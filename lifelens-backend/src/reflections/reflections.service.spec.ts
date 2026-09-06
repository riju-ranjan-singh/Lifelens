import { Test, TestingModule } from '@nestjs/testing';
import { ReflectionsService } from './reflections.service.js';

describe('ReflectionsService', () => {
  let service: ReflectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReflectionsService],
    }).compile();

    service = module.get<ReflectionsService>(ReflectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
