import { Module } from '@nestjs/common';
import { StockMovementsController } from './stock-movement.controller';
import { StockMovementsService } from './stock-movement.service';

@Module({
  controllers: [StockMovementsController],
  providers: [StockMovementsService]
})
export class StockMovementModule { }
