import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';
import { MovementType } from 'generated/prisma/enums';

// Re-export so controllers/services can still import it from here if needed
export { MovementType };

// ==========================================
// 1. CREATE STOCK MOVEMENT DTO
// ==========================================
export class CreateStockMovementDto {
    @IsUUID('4', { message: 'Inventory Item ID must be a valid UUID.' })
    @IsNotEmpty({ message: 'Inventory Item ID is required.' })
    inventoryItemId: string;

    @IsEnum(MovementType, { message: 'Invalid movement type provided.' })
    @IsNotEmpty({ message: 'Movement type is required.' })
    type: MovementType;

    @Type(() => Number)
    @IsInt({ message: 'Quantity changed must be an integer.' })
    @Min(1, { message: 'Quantity changed must be at least 1.' })
    quantityChanged: number;

    @IsOptional()
    @IsUUID('4', { message: 'Reference ID must be a valid UUID.' })
    referenceId?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

// ==========================================
// 2. QUERY / FILTER STOCK MOVEMENTS DTO
// ==========================================
export class QueryStockMovementDto {
    @IsOptional()
    @IsUUID('4')
    inventoryItemId?: string;

    @IsOptional()
    @IsEnum(MovementType)
    type?: MovementType;

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