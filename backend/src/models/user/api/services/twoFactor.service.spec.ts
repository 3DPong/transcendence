import { DataSource, Repository } from 'typeorm';
import { User } from '../../entities';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionService } from '../../../../common/session/session.service';
import { PostgresDatabaseProviderModule } from '../../../../providers/database/postgres/provider.module';
import { createRequest, createResponse, MockRequest, MockResponse } from 'node-mocks-http';
import { Request, Response } from 'express';
import { OtpModule } from '../../../../common/otp/otp.module';
import { TwoFactorService } from './twoFactor.service';
import { UserStatusEnum } from '../../../../common/enums';
import { SessionStatusEnum } from '../../../../common/enums/sessionStatus.enum';
import * as fs from 'fs';
import { BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import { OtpConfigModule } from '../../../../config/otp/config.module';
import { OtpConfigService } from '../../../../config/otp/config.service';
import { authenticator } from 'otplib';

describe('TwoFactorService', () => {
  let dataSource: DataSource;
  let twoFactorService: TwoFactorService;
  let userRepository: Repository<User>;
  let request: MockRequest<Request>;
  let response: MockResponse<Response>;
  let otpConfigService: OtpConfigService;
  /**
   * 실제 각 테스트마다 데이터 베이스를 하나 생성합니다.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TwoFactorService, SessionService],
      imports: [PostgresDatabaseProviderModule, TypeOrmModule.forFeature([User]), OtpModule, OtpConfigModule],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    twoFactorService = module.get<TwoFactorService>(TwoFactorService);
    otpConfigService = module.get<OtpConfigService>(OtpConfigService);
    userRepository = dataSource.getRepository(User);
    request = createRequest({
      session: {
        user_id: null,
        userStatus: null,
        sessionStatus: null,
        email: null,
      },
    });
    response = createResponse();
  });

  afterEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  describe('activateUserTwoFactor', () => {
    it('유저가 정상적으로 2FA를 활성화한 경우', async () => {
      const newUser = userRepository.create({
        nickname: 'test',
        email: 'test@gmail.com',
        profile_url: 'http://test.com/img/1',
      });
      const savedUser = await userRepository.save(newUser);
      request = createRequest({
        session: {
          user_id: savedUser.user_id,
          userStatus: UserStatusEnum.ONLINE,
          sessionStatus: SessionStatusEnum.SUCCESS,
          email: null,
          destroy: (callback) => {
            callback();
          },
        },
      });
      // please check this file!!
      // file stream 으로 실제 qrcode 가 전달되고 있는지 확인함.
      const filePath = __dirname + '/qrcode.png';
      const file = fs.createWriteStream(filePath);
      await twoFactorService.activateUserTwoFactor(savedUser.user_id, request, response, file);
      // check db is changed
      const findUser = await userRepository.findOne({ where: { user_id: savedUser.user_id } });
      expect(findUser.two_factor).toBe(true);
      expect(findUser.two_factor_secret).toBeDefined();
      expect(file.bytesWritten).toBeGreaterThanOrEqual(100);
    });

    it('유저가 잘못된 id를 제공한 경우 400 에러를 던진다.', async () => {
      request = createRequest({
        session: {
          user_id: 0,
          userStatus: UserStatusEnum.ONLINE,
          sessionStatus: SessionStatusEnum.SUCCESS,
          email: null,
          destroy: (callback) => {
            callback();
          },
        },
      });
      try {
        const res = await twoFactorService.activateUserTwoFactor(0, request, response);
        expect(res).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('invalid user (session is not valid)');

        const users: Array<User> = await userRepository.find();
        expect(users.length).toEqual(0);
      }
    });

    it('session 관련하여 문제가 있는 경우 500 에러를 던진다.', async () => {
      const newUser = userRepository.create({
        nickname: 'test',
        email: 'test@gmail.com',
        profile_url: 'http://test.com/img/1',
      });
      const savedUser = await userRepository.save(newUser);
      request = createRequest({
        session: {
          user_id: savedUser.user_id,
          userStatus: UserStatusEnum.ONLINE,
          sessionStatus: SessionStatusEnum.SUCCESS,
          email: null,
        },
      });
      const filePath = __dirname + '/test.png';
      const file = fs.createWriteStream(filePath);
      try {
        const res = await twoFactorService.activateUserTwoFactor(savedUser.user_id, request, response, file);
        expect(res).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('server error');
        // check rollback
        const user: User = await userRepository.findOne({ where: { user_id: savedUser.user_id } });
        expect(user).toEqual(savedUser);
        expect(file.bytesWritten).toEqual(0);
      }
      fs.unlink(filePath, () => {
        return;
      });
    });
  });

  describe('deactivateUserTwoFactor', () => {
    const requestOption = {
      session: {
        user_id: 1,
        userStatus: UserStatusEnum.ONLINE,
        sessionStatus: SessionStatusEnum.SUCCESS,
        email: null,
        destroy: (callback) => {
          callback();
        },
      },
    };
    it('정상적으로 Deactivate 한 경우 200으로 return void', async () => {
      request = createRequest(requestOption);
      response = createResponse();
      const newUser: User = userRepository.create({
        nickname: 'tester',
        email: 'tester@gmail.com',
        profile_url: 'http://test.com/img/2',
      });
      const savedUser = await userRepository.save(newUser);
      // activate 2FA
      await twoFactorService.activateUserTwoFactor(savedUser.user_id, request, response);
      const twoFactorUser: User = await userRepository.findOne({ where: { user_id: savedUser.user_id } });
      // get decrypted secret to create valid token
      const encryptedSecret = twoFactorUser.two_factor_secret;
      const decryptedSecret = CryptoJS.AES.decrypt(encryptedSecret, otpConfigService.secret).toString(
        CryptoJS.enc.Utf8
      );
      const token: string = authenticator.generate(decryptedSecret);
      // test service
      const result = await twoFactorService.deactivateUserTwoFactor(savedUser.user_id, token, request, response);

      expect(result).toBeUndefined();
    });

    it('잘못된 토큰을 제공한 경우 400에러를 던진다.', async () => {
      request = createRequest(requestOption);
      response = createResponse();
      const newUser: User = userRepository.create({
        nickname: 'tester',
        email: 'tester@gmail.com',
        profile_url: 'http://test.com/img/2',
      });
      const savedUser = await userRepository.save(newUser);
      // activate 2FA
      await twoFactorService.activateUserTwoFactor(savedUser.user_id, request, response);
      const token = '999999';
      // test service
      try {
        const result = await twoFactorService.deactivateUserTwoFactor(savedUser.user_id, token, request, response);
        expect(result).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('token is invalid');
      }
    });

    it('없는 유저의 id가 제공된 경우 401에러를 던진다.', async () => {
      request = createRequest(requestOption);
      response = createResponse();
      const token = '000000';
      try {
        const result = await twoFactorService.deactivateUserTwoFactor(0, token, request, response);
        expect(result).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toEqual('invalid user (session is not valid)');
      }
    });

    it('유저의 2FA가 활성화되지 않은 경우 400에러를 던진다.', async () => {
      request = createRequest(requestOption);
      response = createResponse();
      const newUser: User = userRepository.create({
        nickname: 'tester',
        email: 'tester@gmail.com',
        profile_url: 'http://test.com/img/2',
      });
      const savedUser = await userRepository.save(newUser);
      const token = '000000';

      try {
        const result = await twoFactorService.deactivateUserTwoFactor(savedUser.user_id, token, request, response);
        expect(result).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('user 2fa is not activated');
      }
    });
  });
});
