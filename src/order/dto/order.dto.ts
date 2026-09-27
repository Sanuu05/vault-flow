import { Type } from 'class-transformer';
import {
    IsArray,
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { OrderStatus } from 'generated/prisma/enums';

export { OrderStatus };

// ==========================================
// 1. ORDER ITEM SUB-DTO
// ==========================================
export class CreateOrderItemDto {
    @IsUUID('4', { message: 'Product ID must be a valid UUID.' })
    @IsNotEmpty({ message: 'Product ID is required.' })
    productId: string;

    @Type(() => Number)
    @IsInt({ message: 'Quantity must be an integer.' })
    @Min(1, { message: 'Quantity must be at least 1.' })
    quantity: number;

    @Type(() => Number)
    @IsNumber({}, { message: 'Unit price must be a valid number.' })
    @Min(0, { message: 'Unit price cannot be negative.' })
    unitPrice: number;
}

// ==========================================
// 2. CREATE ORDER DTO
// ==========================================
export class CreateOrderDto {
    @IsUUID('4', { message: 'Warehouse ID must be a valid UUID.' })
    @IsNotEmpty({ message: 'Warehouse ID is required.' })
    warehouseId: string;

    @IsString()
    @IsNotEmpty({ message: 'Order number is required.' })
    orderNumber: string;

    @IsString()
    @IsNotEmpty({ message: 'Customer name is required.' })
    customerName: string;

    @IsEmail({}, { message: 'Invalid customer email format.' })
    @IsNotEmpty({ message: 'Customer email is required.' })
    customerEmail: string;

    @IsString()
    @IsNotEmpty({ message: 'Shipping address is required.' })
    shippingAddress: string;

    @IsString()
    @IsNotEmpty({ message: 'City is required.' })
    city: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsString()
    @IsNotEmpty({ message: 'Postal code is required.' })
    postalCode: string;

    @IsOptional()
    @IsString()
    country?: string = 'IN';

    @Type(() => Number)
    @IsNumber({}, { message: 'Total amount must be a number.' })
    @Min(0, { message: 'Total amount cannot be negative.' })
    totalAmount: number;

    @IsArray({ message: 'Items must be an array.' })
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    @IsNotEmpty({ message: 'Order must contain at least one item.' })
    items: CreateOrderItemDto[];
}

// ==========================================
// 3. UPDATE ORDER STATUS DTO
// ==========================================
export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus, { message: 'Invalid order status provided.' })
    @IsNotEmpty({ message: 'Status is required.' })
    status: OrderStatus;
}

// ==========================================
// 4. QUERY / FILTER ORDERS DTO
// ==========================================
export class QueryOrderDto {
    @IsOptional()
    @IsUUID('4')
    warehouseId?: string;

    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

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