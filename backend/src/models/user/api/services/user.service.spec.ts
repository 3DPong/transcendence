import { DataSource, Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../../entities';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserReqDto, CreateUserResDto, GetUserResDto, UpdateUserReqDto, UpdateUserResDto } from '../dtos';
import { SessionService } from '../../../../common/session/session.service';
import { PostgresDatabaseProviderModule } from '../../../../providers/database/postgres/provider.module';
import { createRequest, MockRequest } from 'node-mocks-http';
import { SessionStatusEnum } from '../../../../common/enums/sessionStatus.enum';
import { Request } from 'express';
import { BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UserStatusEnum } from '../../../../common/enums';

describe('UserService', () => {
  let dataSource: DataSource;
  let userService: UserService;
  let userRepository: Repository<User>;
  let request: MockRequest<Request>;
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
      const result: GetUserResDto = await userService.getUser(1);
      const answer: GetUserResDto = new GetUserResDto(savedUser);
      expect(result).toEqual(answer);
    });
    it('존재하지 않는 유저를 조회하면 반환값이 없다.', async () => {
      const result: GetUserResDto | void = await userService.getUser(0);
      expect(result).toBeUndefined();
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
      const sessionData = {
        sessionStatus: SessionStatusEnum.SUCCESS,
        user_id: 1,
        userStatus: UserStatusEnum.ONLINE,
        email: null,
      };
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
      const result: UpdateUserResDto = await userService.updateUser(sessionData, dto);
      const findUser: User = await userRepository.findOne({
        where: {
          nickname: dto.nickname,
          profile_url: dto.profile_url,
        },
      });
      expect(result.user_id).toEqual(savedUser.user_id);
      expect(result.nickname).toEqual(dto.nickname);
      expect(result.profile_url).toEqual(dto.profile_url);
      expect(findUser.nickname).toEqual(dto.nickname);
      expect(findUser.profile_url).toEqual(dto.profile_url);
    });

    it('중복된 닉네임을 요청한 경우 409 에러를 던진다.', async () => {
      const sessionData = {
        sessionStatus: SessionStatusEnum.SUCCESS,
        user_id: 1,
        userStatus: UserStatusEnum.ONLINE,
        email: null,
      };
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
      // set user session to mySavedUser
      sessionData.user_id = mySavedUser.user_id;
      try {
        const result: UpdateUserResDto = await userService.updateUser(sessionData, dto);
        expect(result).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toEqual('duplicate nickname');
        // Rollback 확인
        const findUser: User = await userRepository.findOne({
          where: {
            user_id: mySavedUser.user_id,
          },
        });
        expect(findUser).toEqual(mySavedUser);
        const users: Array<User> = await userRepository.find();
        expect(users.length).toEqual(2);
      }
    });

    it('존재하지 않는 유저 세션일 경우 400 에러를 던진다.', async () => {
      const sessionData = {
        sessionStatus: SessionStatusEnum.SUCCESS,
        user_id: 1, // not exist
        userStatus: UserStatusEnum.ONLINE,
        email: null,
      };
      const dto: UpdateUserReqDto = {
        nickname: 'savedUser.nickname',
        profile_url: 'http://test.com/img/2',
      };
      try {
        const result: UpdateUserResDto = await userService.updateUser(sessionData, dto);
        expect(result).toBeUndefined();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('not exist user');
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
  });
});
