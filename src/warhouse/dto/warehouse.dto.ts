import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';

// ==========================================
// 1. CREATE WAREHOUSE DTO
// ==========================================

export class CreateWarehouseDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    code: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    address?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

// ==========================================
// 2. GET WAREHOUSE DTO
// ==========================================

export class GetWarehouseDto {
    @IsOptional()
    @IsUUID()
    organizationId?: string;
}

// ==========================================
// 3. UPDATE WAREHOUSE DTO
// ==========================================

export class UpdateWarehouseDto extends PartialType(
    (CreateWarehouseDto),
) {

}