import { Test, TestingModule } from '@nestjs/testing';
import { ReflectionsController } from './reflections.controller.js';

describe('ReflectionsController', () => {
  let controller: ReflectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReflectionsController],
    }).compile();

    controller = module.get<ReflectionsController>(ReflectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
