import { DataSource, Repository } from 'typeorm';
import { User } from '../../entities';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionService } from '../../../../common/session/session.service';
import { PostgresDatabaseProviderModule } from '../../../../providers/database/postgres/provider.module';
import { createRequest, createResponse, MockRequest, MockResponse } from 'node-mocks-http';
import { Request, Response } from 'express';
import { OtpModule } from '../../../../auth/otp/otp.module';
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

  describe('getQRCode', () => {
    it('유저가 정상적으로 QR을 요청한 경우 QR을 반환한다.', async () => {
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
          otpSecret: null,
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
      await twoFactorService.getQRCode(savedUser.user_id, request, response, file);
      // check db is changed
      const findUser = await userRepository.findOne({ where: { user_id: savedUser.user_id } });
      expect(findUser.two_factor).toEqual(false);
      expect(findUser.two_factor_secret).toBeNull();
      expect(file.bytesWritten).toBeGreaterThanOrEqual(10);
      expect(request.session.otpSecret.length).toBeGreaterThanOrEqual(10);
    });

    it('유저가 잘못된 id를 제공한 경우 401 에러를 던진다.', async () => {
      request = createRequest({
        session: {
          user_id: 0,
          userStatus: UserStatusEnum.ONLINE,
          sessionStatus: SessionStatusEnum.SUCCESS,
          otpSecret: null,
          email: null,
          destroy: (callback) => {
            callback();
          },
        },
      });
      try {
        const res = await twoFactorService.getQRCode(0, request, response);
        expect(res).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
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
          otpSecret: null,
          email: null,
        },
      });
      const filePath = __dirname + '/test.png';
      const file = fs.createWriteStream(filePath);
      try {
        const res = await twoFactorService.getQRCode(savedUser.user_id, request, response, file);
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

    it('활성화된 유저가 요청하는 경우 400에러를 던진다.', async () => {
      const newUser = userRepository.create({
        nickname: 'test',
        email: 'test@gmail.com',
        profile_url: 'http://test.com/img/1',
        two_factor: true,
        two_factor_secret: 'something',
      });
      const savedUser = await userRepository.save(newUser);
      request = createRequest({
        session: {
          user_id: savedUser.user_id,
          userStatus: UserStatusEnum.ONLINE,
          sessionStatus: SessionStatusEnum.SUCCESS,
          otpSecret: null,
          email: null,
          destroy: (callback) => {
            callback();
          },
        },
      });
      // please check this file!!
      // file stream 으로 실제 qrcode 가 전달되고 있는지 확인함.
      const filePath = __dirname + '/test.png';
      const file = fs.createWriteStream(filePath);
      // REAL TEST AREA
      try {
        const result = await twoFactorService.getQRCode(savedUser.user_id, request, response, file);
        expect(result).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('already activated');
        expect(file.bytesWritten).toEqual(0);
      }
      fs.unlink(filePath, () => {
        return;
      });
    });
  });

  describe('activateUserTwoFactor', () => {
    const otpSecret: string = authenticator.generateSecret();
    const SECRET: string = process.env.OTP_SECRET; // 아마 스코프 문제로 모듈 로드 전에 service 접근이 안되는 것 같아서 이렇게 함.
    const encrypted: string = CryptoJS.AES.encrypt(otpSecret, SECRET).toString();
    const requestOption = {
      session: {
        user_id: 1,
        userStatus: UserStatusEnum.ONLINE,
        sessionStatus: SessionStatusEnum.SUCCESS,
        otpSecret: encrypted,
        email: null,
        destroy: (callback) => {
          callback();
        },
      },
    };

    it('정상적으로 활성화한 경우 로그아웃 & 유저 2FA 활성화', async () => {
      const newUser = userRepository.create({
        nickname: 'test',
        email: 'test@gmail.com',
        profile_url: 'http://test.com/img/1',
      });
      const savedUser = await userRepository.save(newUser);
      request = createRequest(requestOption);
      response = createResponse();
      const validToken: string = authenticator.generate(otpSecret);
      try {
        await twoFactorService.activateUserTwoFactor(savedUser.user_id, validToken, request, response);
      } catch (e) {
        expect(e).toBeUndefined();
      }
      const updatedUser = await userRepository.findOne({ where: { user_id: savedUser.user_id } });
      expect(updatedUser.two_factor_secret).toEqual(encrypted);
      expect(updatedUser.two_factor).toEqual(true);
      expect(response.cookies['connect.sid'].options.expires).toStrictEqual(new Date(1)); // session cookie clear
    });

    it('존재하지 않는 유저 세션인 경우 401에러를 던진다.', async () => {
      request = createRequest(requestOption);
      response = createResponse();
      try {
        const result = await twoFactorService.activateUserTwoFactor(0, 'validToken', request, response);
        expect(result).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toEqual('invalid user (session is not valid)');
      }
    });

    it('이미 two factor가 활성화된 유저일 경우 400에러를 던진다.', async () => {
      const newUser = userRepository.create({
        nickname: 'test',
        email: 'test@gmail.com',
        profile_url: 'http://test.com/img/1',
        two_factor: true,
        two_factor_secret: '1312312',
      });
      const savedUser = await userRepository.save(newUser);
      let error;
      request = createRequest(requestOption);
      response = createResponse();
      try {
        const result = await twoFactorService.activateUserTwoFactor(
          savedUser.user_id,
          'invalidToken',
          request,
          response
        );
        expect(result).toBeUndefined();
      } catch (e) {
        error = e;
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('already activated');
      }
      expect(error).toBeDefined();
    });

    it('잘못된 토큰을 보낸 경우 400에러를 던진다.', async () => {
      const newUser = userRepository.create({
        nickname: 'test',
        email: 'test@gmail.com',
        profile_url: 'http://test.com/img/1',
      });
      const savedUser = await userRepository.save(newUser);
      let error;
      request = createRequest(requestOption);
      response = createResponse();
      const invalidToken = '00000-';
      try {
        const result = await twoFactorService.activateUserTwoFactor(savedUser.user_id, invalidToken, request, response);
        expect(result).toBeUndefined();
      } catch (e) {
        error = e;
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('token is invalid');
      }
      expect(error).toBeDefined();
    });
  });
  describe('deactivateTwoFactor', () => {
    const otpSecret: string = authenticator.generateSecret();
    const SECRET: string = process.env.OTP_SECRET; // 아마 스코프 문제로 모듈 로드 전에 service 접근이 안되는 것 같아서 이렇게 함.
    const encrypted: string = CryptoJS.AES.encrypt(otpSecret, SECRET).toString();
    const requestOption = {
      session: {
        user_id: 1,
        userStatus: UserStatusEnum.ONLINE,
        sessionStatus: SessionStatusEnum.SUCCESS,
        otpSecret: null,
        email: null,
        destroy: (callback) => {
          callback();
        },
      },
    };
    it('정상적인 경우 유저의 2FA가 해제되고 로그아웃 된다.', async () => {
      request = createRequest(requestOption);
      response = createResponse();
      const newUser: User = userRepository.create({
        nickname: 'test',
        email: 'test@gmail.com',
        profile_url: 'http://test.com/img/1',
        two_factor: true,
        two_factor_secret: encrypted,
      });
      const savedUser: User = await userRepository.save(newUser);
      const validToken: string = authenticator.generate(otpSecret);
      let error;
      try {
        await twoFactorService.deactivateUserTwoFactor(savedUser.user_id, validToken, request, response);
      } catch (e) {
        error = e;
      }
      expect(error).toBeUndefined();
      const findUser: User = await userRepository.findOne({ where: { user_id: savedUser.user_id } });
      expect(findUser.two_factor_secret).toBeNull();
      expect(findUser.two_factor).toEqual(false);
      expect(response.cookies['connect.sid'].options.expires).toStrictEqual(new Date(1)); // session cookie clear
    });

    it('없는 유저의 세션일 경우 401에러를 반환한다.', async () => {
      request = createRequest(requestOption);
      response = createResponse();

      let error;
      try {
        await twoFactorService.deactivateUserTwoFactor(2222, 'invalidToken', request, response);
      } catch (e) {
        error = e;
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toEqual('invalid user (session is not valid)');
      }
      expect(error).toBeDefined();
    });

    it('유저가 2FA를 활성화하지 않은 경우 400에러를 반환한다..', async () => {
      request = createRequest(requestOption);
      response = createResponse();
      const newUser: User = userRepository.create({
        nickname: 'test',
        email: 'test@gmail.com',
        profile_url: 'http://test.com/img/1',
        two_factor: false,
        two_factor_secret: null,
      });
      const savedUser: User = await userRepository.save(newUser);
      const validToken: string = authenticator.generate(otpSecret);
      let error;
      try {
        await twoFactorService.deactivateUserTwoFactor(savedUser.user_id, validToken, request, response);
      } catch (e) {
        error = e;
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('user 2fa is not activated');
      }
      expect(error).toBeDefined();
    });

    it('잘못된 토큰이 온 경우 400에러를 반환한다.', async () => {
      request = createRequest(requestOption);
      response = createResponse();
      const newUser: User = userRepository.create({
        nickname: 'test',
        email: 'test@gmail.com',
        profile_url: 'http://test.com/img/1',
        two_factor: true,
        two_factor_secret: encrypted,
      });
      const savedUser: User = await userRepository.save(newUser);
      const validToken: string = authenticator.generate(otpSecret) + 'not valid';
      let error;
      try {
        await twoFactorService.deactivateUserTwoFactor(savedUser.user_id, validToken, request, response);
      } catch (e) {
        error = e;
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('token is invalid');
      }
      expect(error).toBeDefined();
    });
  });
});
