import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
    IsEmail,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

// ==========================================
// 1. CREATE SUPPLIER DTO
// ==========================================
export class CreateSupplierDto {
    @IsString()
    @IsNotEmpty({ message: 'Supplier name is required.' })
    @MaxLength(255)
    name: string;

    @IsOptional()
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    @MaxLength(255)
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;
}

// ==========================================
// 2. UPDATE SUPPLIER DTO
// ==========================================
// Inherits all fields as optional for PATCH requests
export class UpdateSupplierDto extends PartialType(CreateSupplierDto) { }

// ==========================================
// 3. QUERY / FILTER SUPPLIER DTO
// ==========================================
export class QuerySupplierDto {
    @IsOptional()
    @IsString()
    search?: string; // Search across name, email, or phone

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