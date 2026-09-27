import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    CreateStockMovementDto,
    QueryStockMovementDto,
} from './dto/stock-movement.dto';
import { CurrentUser } from 'src/users/decorators/current-decorator';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { StockMovementsService } from './stock-movement.service';

@Controller('api/v1/stock-movements')
@UseGuards(JwtAuthGuard)
export class StockMovementsController {
    constructor(private readonly stockMovementsService: StockMovementsService) { }

    // =========================================================================
    // 1. CREATE STOCK MOVEMENT (Triggers atomic inventory update + audit log)
    // =========================================================================
    @Post()
    create(
        @CurrentUser('organizationId') organizationId: string,
        @CurrentUser('userId') userId: string,
        @Body() dto: CreateStockMovementDto,
    ) {
        return this.stockMovementsService.createStockMovement(
            organizationId,
            userId,
            dto,
        );
    }

    // =========================================================================
    // 2. GET ALL STOCK MOVEMENTS (Tenant-scoped with filtering & pagination)
    // =========================================================================
    @Get()
    findAll(
        @CurrentUser('organizationId') organizationId: string,
        @Query() query: QueryStockMovementDto,
    ) {
        return this.stockMovementsService.findAllMovements(organizationId, query);
    }

    // =========================================================================
    // 3. GET SINGLE STOCK MOVEMENT BY ID
    // =========================================================================
    @Get(':id')
    findOne(
        @CurrentUser('organizationId') organizationId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.stockMovementsService.findMovementById(organizationId, id);
    }
}