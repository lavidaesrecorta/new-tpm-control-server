import { Test, TestingModule } from '@nestjs/testing';
import { TpmService } from './tpm.service';

describe('TpmService', () => {
  let service: TpmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TpmService],
    }).compile();

    service = module.get<TpmService>(TpmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
