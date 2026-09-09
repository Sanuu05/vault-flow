import { PartialType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator'


// 1. Create DTO (Input on POST)

export class CreateOrganizationDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @Matches(/^[a-z0-9-]+$/, {
        message: 'Slug can only contain lowercase alphanumeric characters and hyphens',
    })
    slug: string;
}

// 2. Update DTO (Input on PATCH)

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) { }

// 3. Response DTO (Output / Serialization)

export class OrganizationResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    slug: string

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}