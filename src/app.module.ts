import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { WarehouseService } from './warhouse/warehouse.service';
import { WarhouseModule } from './warhouse/warehouse.module';
import { ProductsService } from './products/products.service';
import { ProductsModule } from './products/products.module';
import { SuppliersService } from './suppliers/suppliers.service';

import { SuppliersModule } from './suppliers/suppliers.module';
import { InventoryService } from './inventory/inventory.service';
import { InventoryModule } from './inventory/inventory.module';
import { StockMovementModule } from './stock-movement/stock-movement.module';
import { StockMovementsService } from './stock-movement/stock-movement.service';

import { OrderModule } from './order/order.module';
import { OrdersService } from './order/order.service';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({
    isGlobal: true
  }),
    OrganizationsModule, UsersModule, WarhouseModule, ProductsModule, SuppliersModule, SuppliersModule, InventoryModule, StockMovementModule, OrderModule],
  controllers: [AppController],
  providers: [AppService, WarehouseService, ProductsService, SuppliersService, InventoryService, StockMovementsService, OrdersService],
})
export class AppModule { }
