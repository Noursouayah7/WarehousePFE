import { Test, TestingModule } from '@nestjs/testing';
import { BlocController } from './bloc.controller';
import { BlocService } from './bloc.service';

describe('BlocController', () => {
  let controller: BlocController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlocController],
      providers: [BlocService],
    }).compile();

    controller = module.get<BlocController>(BlocController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
