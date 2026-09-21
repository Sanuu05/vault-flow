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
import { ProductsService } from './products.service';
import {
    CreateProductDto,
    QueryProductDto,
    UpdateProductDto,
} from './dto/products.dto';
import { CurrentUser } from 'src/users/decorators/current-decorator';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

@Controller('api/v1/products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    // 1. CREATE PRODUCT
    @Post()
    create(
        @CurrentUser('organizationId') organizationId: string,
        @Body() dto: CreateProductDto,
    ) {
        return this.productsService.createProduct(organizationId, dto);
    }

    // 2. GET ALL PRODUCTS (with search and pagination)
    @Get()
    findAll(
        @CurrentUser('organizationId') organizationId: string,
        @Query() query: QueryProductDto,
    ) {
        return this.productsService.findAllProducts(organizationId, query);
    }

    // 3. GET SINGLE PRODUCT BY ID
    @Get(':id')
    findOne(
        @CurrentUser('organizationId') organizationId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.productsService.findProductById(organizationId, id);
    }

    // 4. UPDATE PRODUCT BY ID
    @Patch(':id')
    update(
        @CurrentUser('organizationId') organizationId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateProductDto,
    ) {
        return this.productsService.updateProduct(organizationId, id, dto);
    }

    // 5. DELETE PRODUCT (204 No Content)
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @CurrentUser('organizationId') organizationId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.productsService.deleteProduct(organizationId, id);
    }
}