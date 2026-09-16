import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
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
    @IsUUID()
    @IsNotEmpty()
    organizationId: string;

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
    OmitType(CreateWarehouseDto, ['organizationId'] as const),
) { }