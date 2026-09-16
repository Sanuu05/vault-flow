import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/warehouse.dto';

@Controller('warhouse')
export class WarhouseController {
    constructor(private readonly wareHouseService: WarehouseService) { }

    @Post()
    create(@Body() dto: CreateWarehouseDto) {
        return this.wareHouseService.createWarehouse(dto)
    }
    @Get()
    getAll() {
        return this.wareHouseService.findAllWarehouses()
    }
    @Get(':id')
    getById(
        @Param('id', ParseUUIDPipe) id: string
    ) {
        return this.wareHouseService.findWarehousesByOrganization({ organizationId: id })
    }
}
