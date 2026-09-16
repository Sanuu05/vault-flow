import { Module } from '@nestjs/common';
import { WarhouseController } from './warehouse.controller';

@Module({
  controllers: [WarhouseController]
})
export class WarhouseModule { }
