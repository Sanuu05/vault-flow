import { OmitType, PartialType } from '@nestjs/mapped-types'
import { Exclude, Expose } from 'class-transformer'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator'
import { UserRole } from 'generated/prisma/enums'

// ==========================================
// 1. CREATE / REGISTER USER DTO
// ==========================================

export class CreateUserDto {
    @IsUUID()
    @IsNotEmpty()
    organizationId: string


    @IsEmail({}, { message: 'Invalid email address format' })
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string


    @IsEnum(UserRole, {
        message: 'Role must be one of: OWNER, ADMIN, WAREHOUSE_STAFF',
    })
    @IsOptional()
    role: UserRole = UserRole.WAREHOUSE_STAFF
}
export class GetUsersDto {
    @IsUUID()
    @IsNotEmpty()
    organizationId: string

    @IsEmail({}, { message: 'Invalid email address format' })
    @IsOptional()
    email: string

}

// ==========================================
// 2. USER LOGIN DTO
// ==========================================
export class LoginDto {
    @IsUUID()
    @IsOptional()
    organizationId: string; // Optional if email is unique or slug is provided

    @IsEmail({}, { message: 'Invalid email address format' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class AuthResponseDto {
    accessToken: string;
    user: any;
}
// ==========================================
// 3. UPDATE USER DTO
// ==========================================
// Omits organizationId and password from direct standard updates

export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['organizationId', 'password'] as const),

) {
    @IsString()
    @IsOptional()
    @MinLength(8, { message: 'New password must be at least 8 characters long' })
    password?: string;

}

// ==========================================
// 4. SANITIZED USER RESPONSE DTO
// ==========================================

export class UserResponseDto {
    @Expose()
    id: string

    @Expose()
    organizationId: string

    @Expose()
    email: string

    @Expose()
    role: UserRole


    @Exclude() // Strictly prevents password_hash from ever returning to the client
    passwordHash: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

}