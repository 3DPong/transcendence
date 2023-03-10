import { Test, TestingModule } from '@nestjs/testing';
import { AlramGateway } from './alram.gateway';

describe('AlramGateway', () => {
  let gateway: AlramGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlramGateway],
    }).compile();

    gateway = module.get<AlramGateway>(AlramGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
