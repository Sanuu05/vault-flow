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
import { SuppliersService } from './suppliers.service';
import {
    CreateSupplierDto,
    QuerySupplierDto,
    UpdateSupplierDto,
} from './dto/suppliers.dto';
import { CurrentUser } from 'src/users/decorators/current-decorator';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

@Controller('api/v1/suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) { }

    // 1. CREATE SUPPLIER
    @Post()
    create(
        @CurrentUser('organizationId') organizationId: string,
        @Body() dto: CreateSupplierDto,
    ) {
        return this.suppliersService.createSupplier(organizationId, dto);
    }

    // 2. GET ALL SUPPLIERS (with search & pagination)
    @Get()
    findAll(
        @CurrentUser('organizationId') organizationId: string,
        @Query() query: QuerySupplierDto,
    ) {
        return this.suppliersService.findAllSuppliers(organizationId, query);
    }

    // 3. GET SINGLE SUPPLIER BY ID
    @Get(':id')
    findOne(
        @CurrentUser('organizationId') organizationId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.suppliersService.findSupplierById(organizationId, id);
    }

    // 4. UPDATE SUPPLIER BY ID
    @Patch(':id')
    update(
        @CurrentUser('organizationId') organizationId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateSupplierDto,
    ) {
        return this.suppliersService.updateSupplier(organizationId, id, dto);
    }

    // 5. DELETE SUPPLIER (204 No Content)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @CurrentUser('organizationId') organizationId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.suppliersService.deleteSupplier(organizationId, id);
    }
}