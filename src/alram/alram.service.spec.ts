import { Test, TestingModule } from '@nestjs/testing';
import { AlramService } from './alram.service';

describe('AlramService', () => {
  let service: AlramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlramService],
    }).compile();

    service = module.get<AlramService>(AlramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
