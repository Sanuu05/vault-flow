import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';
import { CurrentUser } from 'src/users/decorators/current-decorator';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

@Controller('api/v1/warehouse')
@UseGuards(JwtAuthGuard)
export class WarhouseController {
    constructor(private readonly wareHouseService: WarehouseService) { }

    @Post()
    create(
        @CurrentUser('organizationId') orgId: string,
        @Body() dto: CreateWarehouseDto
    ) {
        return this.wareHouseService.createWarehouse(orgId, dto)
    }
    @Get()
    getAll(@CurrentUser('organizationId') orgId: string,) {
        return this.wareHouseService.findWarehousesByOrganization(orgId)
    }
    @Get(':id')
    getById(
        @CurrentUser('organizationId') orgId: string,
        @Param('id', ParseUUIDPipe) id: string
    ) {
        return this.wareHouseService.findWarehouseById(orgId, id)
    }
    @Patch(':id')
    update(
        @CurrentUser('organizationId') orgId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateWarehouseDto
    ) {
        return this.wareHouseService.updateWarehouse(orgId, id, dto)
    }
}
