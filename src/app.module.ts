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

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({
    isGlobal: true
  }),
    OrganizationsModule, UsersModule, WarhouseModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService, WarehouseService, ProductsService],
})
export class AppModule { }
