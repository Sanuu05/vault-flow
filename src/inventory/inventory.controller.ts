import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
    CreateInventoryItemDto,
    QueryInventoryItemDto,
    UpdateInventoryItemDto,
} from './dto/inventory.dto';
import { CurrentUser } from 'src/users/decorators/current-decorator';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

@Controller('api/v1/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post()
    create(
        @CurrentUser('organizationId') organizationId: string,
        @Body() dto: CreateInventoryItemDto,
    ) {
        return this.inventoryService.createInventoryItem(organizationId, dto);
    }

    @Get()
    findAll(
        @CurrentUser('organizationId') organizationId: string,
        @Query() query: QueryInventoryItemDto,
    ) {
        return this.inventoryService.findAllInventory(organizationId, query);
    }

    @Get(':id')
    findOne(
        @CurrentUser('organizationId') organizationId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.inventoryService.findInventoryById(organizationId, id);
    }

    @Patch(':id')
    update(
        @CurrentUser('organizationId') organizationId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateInventoryItemDto,
    ) {
        return this.inventoryService.updateInventoryItem(organizationId, id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @CurrentUser('organizationId') organizationId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.inventoryService.deleteInventoryItem(organizationId, id);
    }
}