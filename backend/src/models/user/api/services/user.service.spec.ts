import { DataSource, Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../../entities';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserReqDto, CreateUserResDto, GetUserResDto, UpdateUserReqDto, UpdateUserResDto } from '../dtos';
import { SessionService } from '../../../../common/session/session.service';
import { PostgresDatabaseProviderModule } from '../../../../providers/database/postgres/provider.module';
import { createRequest, createResponse, MockRequest, MockResponse } from 'node-mocks-http';
import { SessionStatusEnum } from '../../../../common/enums/sessionStatus.enum';
import { Request, Response } from 'express';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { GetUserSettingResDto } from '../dtos/getUserSettingResDto';
import { UserStatusEnum } from '../../../../common/enums';

describe('UserService', () => {
  let dataSource: DataSource;
  let userService: UserService;
  let userRepository: Repository<User>;
  let request: MockRequest<Request>;
  let response: MockResponse<Response>;
  /**
   * 실제 각 테스트마다 데이터 베이스를 하나 생성합니다.
   */

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, SessionService],
      imports: [PostgresDatabaseProviderModule, TypeOrmModule.forFeature([User])],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    userService = module.get<UserService>(UserService);
    userRepository = dataSource.getRepository(User);
    request = createRequest({
      session: {
        user_id: null,
        userStatus: null,
        sessionStatus: null,
        email: null,
      },
    });
  });

  afterEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  describe('getUser', () => {
    const newUser: User = new User();
    newUser.user_id = 1;
    newUser.nickname = 'tester';
    newUser.email = 'tester@test.com';
    newUser.profile_url = 'https://test.com/img/1';

    it('존재하는 유저를 조회하면 해당 유저의 정보를 반환한다. ', async () => {
      const savedUser: User = await userRepository.save(newUser);
      const result: GetUserResDto = await userService.getUser(savedUser.user_id);
      const answer: GetUserResDto = new GetUserResDto(savedUser);
      expect(result).toEqual(answer);
    });

    it('존재하지 않는 유저를 조회하면 400에러를 반환한다..', async () => {
      let result: GetUserResDto;
      let error;
      try {
        result = await userService.getUser(0);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual('not exist user');
      expect(result).toBeUndefined();
    });

    it('삭제된 유저의 정보를 조회하면, 400에러를 반환한다.', async () => {
      const savedUser: User = await userRepository.save(newUser);
      // delete user
      await userRepository.delete({ user_id: savedUser.user_id });
      let result: GetUserResDto;
      let error;
      try {
        result = await userService.getUser(savedUser.user_id);
      } catch (e) {
        error = e;
      }
      expect(result).toBeUndefined();
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual('not exist user');
    });
  });

  describe('createUser', () => {
    it('유저 데이터를 정상적으로 입력한 경우 유저의 정보를 반환한다.', async () => {
      const sessionData = {
        sessionStatus: SessionStatusEnum.SIGNUP,
        user_id: null,
        userStatus: null,
        email: 'tester@test.com',
      };
      const dto: CreateUserReqDto = {
        nickname: 'tester',
        profile_url: 'http://test.com/img/1',
      };
      const result: CreateUserResDto = await userService.createUser(sessionData, dto, request);
      expect(result).toHaveProperty('user_id');

      const savedUser: User = await userRepository.findOne({
        where: {
          nickname: dto.nickname,
          profile_url: dto.profile_url,
        },
      });
      expect(savedUser).toBeDefined();
    });

    it('중복된 nickname을 요청한 경우 409 에러를 던진다.', async () => {
      const sessionData = {
        sessionStatus: SessionStatusEnum.SIGNUP,
        user_id: null,
        userStatus: null,
        email: 'tester@test.com',
      };
      const dto: CreateUserReqDto = {
        nickname: 'tester',
        profile_url: 'http://test.com/img/1',
      };
      const newUser: User = userRepository.create({
        nickname: dto.nickname,
        email: 'sessionData.email@gmail.com',
        profile_url: dto.profile_url,
      });
      // make duplicate
      await userRepository.save(newUser);
      try {
        const result = await userService.createUser(sessionData, dto, request);
        expect(result).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toEqual('duplicate nickname');
        // rollback 확인
        const tableData: Array<User> = await userRepository.find();
        expect(tableData.length).toEqual(1);
      }
    });

    it('중복된 email을 요청한 경우 409 에러를 던진다.', async () => {
      const sessionData = {
        sessionStatus: SessionStatusEnum.SIGNUP,
        user_id: null,
        userStatus: null,
        email: 'tester@test.com',
      };
      const dto: CreateUserReqDto = {
        nickname: 'tester',
        profile_url: 'http://test.com/img/1',
      };
      const newUser: User = userRepository.create({
        nickname: 'dto.nickname',
        email: sessionData.email,
        profile_url: dto.profile_url,
      });
      // make duplicate
      await userRepository.save(newUser);
      try {
        const result = await userService.createUser(sessionData, dto, request);
        expect(result).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toEqual('duplicate nickname'); // email 구분 따로 안함...
        // rollback 확인
        const tableData: Array<User> = await userRepository.find();
        expect(tableData.length).toEqual(1);
      }
    });

    it('session 이 request에 존재하지 않는 경우, 500을 던진다.', async () => {
      const sessionData = {
        sessionStatus: SessionStatusEnum.SIGNUP,
        user_id: null,
        userStatus: null,
        email: 'tester@test.com',
      };
      const dto: CreateUserReqDto = {
        nickname: 'tester',
        profile_url: 'http://test.com/img/1',
      };

      const invalidReq: MockRequest<Request> = createRequest();
      try {
        const result = await userService.createUser(sessionData, dto, invalidReq);
        expect(result).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        // rollback 확인
        const tableData: Array<User> = await userRepository.find();
        expect(tableData.length).toEqual(0);
      }
    });
  });

  describe('updateUser', () => {
    it('정상적으로 유저를 업데이트한 경우, 유저 정보를 반환한다.', async () => {
      const newUser: User = userRepository.create({
        nickname: 'tester',
        email: 'tester@test.com',
        profile_url: 'http://test.com/img/1',
      });
      const dto: UpdateUserReqDto = {
        nickname: 'nickname',
        profile_url: 'http://test.com/img/2',
      };
      // save user
      const savedUser: User = await userRepository.save(newUser);
      let result: UpdateUserResDto;
      let error;
      try {
        result = await userService.updateUser(savedUser.user_id, dto);
      } catch (e) {
        error = e;
      }
      expect(error).toBeUndefined();
      expect(result.user_id).toEqual(savedUser.user_id);
      expect(result.nickname).toEqual(dto.nickname);
      expect(result.profile_url).toEqual(dto.profile_url);
    });

    it('중복된 닉네임을 요청한 경우 409 에러를 던진다.', async () => {
      const newUser: User = userRepository.create({
        nickname: 'tester',
        email: 'tester@test.com',
        profile_url: 'http://test.com/img/1',
      });
      const myUser: User = userRepository.create({
        nickname: 'mine',
        email: 'mine@test.com',
        profile_url: 'http://test.com/img/1',
      });
      // save user for duplicate nickname
      const savedUser: User = await userRepository.save(newUser);
      // save user for test
      const mySavedUser: User = await userRepository.save(myUser);
      const dto: UpdateUserReqDto = {
        nickname: savedUser.nickname, // duplicated
        profile_url: 'http://test.com/img/2',
      };

      let result: UpdateUserResDto;
      let error;
      try {
        result = await userService.updateUser(mySavedUser.user_id, dto);
      } catch (e) {
        error = e;
      }
      expect(result).toBeUndefined();
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.message).toEqual('duplicate nickname');
      // Rollback 확인
      const findUser: User = await userRepository.findOne({
        where: {
          user_id: mySavedUser.user_id,
        },
      });
      expect(findUser).toEqual(mySavedUser);
      const users: Array<User> = await userRepository.find();
      expect(users.length).toEqual(2);
    });

    it('존재하지 않는 유저 세션일 경우 400 에러를 던진다.', async () => {
      const dto: UpdateUserReqDto = {
        nickname: 'savedUser.nickname',
        profile_url: 'http://test.com/img/2',
      };
      try {
        const result: UpdateUserResDto = await userService.updateUser(0, dto);
        expect(result).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toEqual('invalid user (session is not valid)');
        // Rollback 확인
        const findUser: User = await userRepository.findOne({
          where: {
            user_id: 1,
          },
        });
        expect(findUser).toBeNull();
        const users: Array<User> = await userRepository.find();
        expect(users.length).toEqual(0);
      }
    });

    it('삭제된 유저를 검색하는 경우 400에러를 반환한다..', async () => {
      const newUser: User = userRepository.create({
        nickname: 'tester',
        email: 'tester@test.com',
        profile_url: 'http://test.com/img/1',
      });
      const dto: UpdateUserReqDto = {
        nickname: 'nickname',
        profile_url: 'http://test.com/img/2',
      };
      // save user
      const savedUser: User = await userRepository.save(newUser);
      await userRepository.softDelete({
        user_id: savedUser.user_id,
      });

      let result: UpdateUserResDto;
      let error;
      try {
        result = await userService.updateUser(savedUser.user_id, dto);
      } catch (e) {
        error = e;
      }
      expect(result).toBeUndefined();
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toEqual('invalid user (session is not valid)');
    });
  });

  describe('getMyUserSettings', () => {
    it('정상적으로 본인 세팅을 요구한 경우 200과 함께 세팅 정보 전달', async () => {
      const newUser: User = userRepository.create({
        nickname: 'test',
        email: 'test@gmail.com',
        profile_url: 'http://test.com/img/1',
      });
      const savedUser: User = await userRepository.save(newUser);
      const answer: GetUserSettingResDto = {
        user_id: savedUser.user_id,
        nickname: savedUser.nickname,
        profile_url: savedUser.profile_url,
        two_factor: savedUser.two_factor,
      };

      let error;
      let result;
      try {
        result = await userService.getMyUserSettings(savedUser.user_id);
      } catch (e) {
        error = e;
      }
      expect(error).toBeUndefined();
      expect(result).toEqual(answer);
    });

    it('잘못된 세션에서 유저 정보를 요구하는 경우 401에러 반환', async () => {
      let error;
      let result;
      try {
        result = await userService.getMyUserSettings(0);
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toEqual('invalid user (session is not valid)');
      expect(result).toBeUndefined();
    });

    it('삭제된 유저에 대해서 조회하는 경우 400에러 반환', async () => {
      const newUser: User = userRepository.create({
        nickname: 'test',
        email: 'test@gmail.com',
        profile_url: 'http://test.com/img/1',
      });
      const savedUser: User = await userRepository.save(newUser);
      await userRepository.softDelete({ user_id: savedUser.user_id });

      let error;
      let result;
      try {
        result = await userService.getMyUserSettings(savedUser.user_id);
      } catch (e) {
        error = e;
      }
      expect(result).toBeUndefined();
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toEqual('invalid user (session is not valid)');
    });
  });

  describe('deleteUser', () => {
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
    it('정상적인 삭제 요청의 경우 200', async () => {
      request = createRequest(requestOption);
      response = createResponse();
      const newUser: User = userRepository.create({
        nickname: 'test',
        email: 'test@gmail.com',
        profile_url: 'http://test.com/img/1',
      });
      const savedUser: User = await userRepository.save(newUser);
      let error;
      try {
        await userService.deleteUser(savedUser.user_id, request, response);
      } catch (e) {
        error = e;
      }
      expect(error).toBeUndefined();
      const findUser: User = await userRepository.findOne({ where: { user_id: savedUser.user_id } });
      expect(findUser).toBeNull();
      expect(response.cookies['connect.sid'].options.expires).toStrictEqual(new Date(1)); // session cookie clear
    });

    it('없는 유저 세션일 경우 401에러 반환', async () => {
      request = createRequest(requestOption);
      response = createResponse();
      let error;
      try {
        await userService.deleteUser(0, request, response);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toEqual('invalid user (session is not valid)');
    });

    /**
     * SESSION FAIL 이후 세션이 꼬일 수 있다. 해당 부분은 잡지 못함.
     */
    it('세션상의 에러일 경우 롤백 후 500반환', async () => {
      request = createRequest();
      response = createResponse();
      const newUser: User = userRepository.create({
        nickname: 'test',
        email: 'test@gmail.com',
        profile_url: 'http://test.com/img/1',
      });
      const savedUser: User = await userRepository.save(newUser);
      let error;
      try {
        await userService.deleteUser(savedUser.user_id, request, response);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(InternalServerErrorException);
      expect(error.message).toEqual('server error');
      const findUser: User = await userRepository.findOne({ where: { user_id: savedUser.user_id } });
      expect(findUser).toEqual(savedUser);
    });
  });
});
