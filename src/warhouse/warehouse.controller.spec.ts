import { Test, TestingModule } from '@nestjs/testing';
import { WarhouseController } from './warehouse.controller';

describe('WarhouseController', () => {
  let controller: WarhouseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarhouseController],
    }).compile();

    controller = module.get<WarhouseController>(WarhouseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
