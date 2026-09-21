import { Module } from '@nestjs/common';
import { WarhouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';

@Module({
  controllers: [WarhouseController],
  providers: [WarehouseService],
})
export class WarhouseModule { }
