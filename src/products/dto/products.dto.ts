import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

// ==========================================
// 1. CREATE PRODUCT DTO
// ==========================================
export class CreateProductDto {
    @IsString()
    @IsNotEmpty({ message: 'SKU is required.' })
    @MaxLength(100)
    sku: string;

    @IsString()
    @IsNotEmpty({ message: 'Product name is required.' })
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @Type(() => Number)
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'Price must be a valid monetary value with up to 2 decimal places.' },
    )
    @IsPositive({ message: 'Price must be greater than zero.' })
    @IsNotEmpty({ message: 'Price is required.' })
    price: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Reorder level must be an integer.' })
    @Min(0, { message: 'Reorder level cannot be negative.' })
    reorderLevel?: number;
}

// ==========================================
// 2. UPDATE PRODUCT DTO
// ==========================================
// Inherits all fields as optional, matching standard PATCH behavior
export class UpdateProductDto extends PartialType(CreateProductDto) { }

// ==========================================
// 3. QUERY / FILTER PRODUCT DTO
// ==========================================
export class QueryProductDto {
    @IsOptional()
    @IsString()
    search?: string; // Search across SKU or name

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