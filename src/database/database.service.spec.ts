import { Test, TestingModule } from '@nestjs/testing';
import { TpmDatabaseService } from './tpmDatabase.service';

describe('DatabaseService', () => {
  let service: TpmDatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TpmDatabaseService],
    }).compile();

    service = module.get<TpmDatabaseService>(TpmDatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
