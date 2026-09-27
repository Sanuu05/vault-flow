import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    Min,
} from 'class-validator';

// ==========================================
// 1. CREATE / INITIALIZE INVENTORY ITEM DTO
// ==========================================
export class CreateInventoryItemDto {
    @IsUUID('4', { message: 'Warehouse ID must be a valid UUID.' })
    @IsNotEmpty({ message: 'Warehouse ID is required.' })
    warehouseId: string;

    @IsUUID('4', { message: 'Product ID must be a valid UUID.' })
    @IsNotEmpty({ message: 'Product ID is required.' })
    productId: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Quantity must be an integer.' })
    @Min(0, { message: 'Quantity cannot be negative.' })
    quantity?: number = 0;
}

// ==========================================
// 2. UPDATE INVENTORY ITEM DTO
// ==========================================
export class UpdateInventoryItemDto extends PartialType(CreateInventoryItemDto) {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Reserved quantity must be an integer.' })
    @Min(0, { message: 'Reserved quantity cannot be negative.' })
    reservedQuantity?: number;
}

// ==========================================
// 3. QUERY / FILTER INVENTORY DTO
// ==========================================
export class QueryInventoryItemDto {
    @IsOptional()
    @IsUUID('4')
    warehouseId?: string;

    @IsOptional()
    @IsUUID('4')
    productId?: string;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    lowStock?: boolean; // Filter items where quantity <= product.reorderLevel

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;
}