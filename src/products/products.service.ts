import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
    CreateProductDto,
    QueryProductDto,
    UpdateProductDto,
} from './dto/products.dto';
import { Prisma } from 'generated/prisma/browser';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) { }

    // =========================================================================
    // 1. CREATE PRODUCT
    // =========================================================================
    async createProduct(organizationId: string, dto: CreateProductDto) {
        const existing = await this.prisma.product.findUnique({
            where: {
                organizationId_sku: {
                    organizationId,
                    sku: dto.sku,
                },
            },
        });

        if (existing) {
            throw new ConflictException(
                `Product with SKU "${dto.sku}" already exists in this organization.`,
            );
        }

        return this.prisma.product.create({
            data: {
                organizationId,
                sku: dto.sku,
                name: dto.name,
                description: dto.description,
                price: new Prisma.Decimal(dto.price),
                ...(dto.reorderLevel !== undefined && { reorderLevel: dto.reorderLevel }),
            },
        });
    }

    // =========================================================================
    // 2. GET ALL PRODUCTS (Tenant-Scoped with Search & Pagination)
    // =========================================================================
    async findAllProducts(organizationId: string, query?: QueryProductDto) {
        const { search, page = 1, limit = 10 } = query || {};
        const skip = (page - 1) * limit;

        const where: Prisma.ProductWhereInput = {
            organizationId,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [total, items] = await Promise.all([
            this.prisma.product.count({ where }),
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // =========================================================================
    // 3. GET ONE PRODUCT BY ID (Tenant-Scoped)
    // =========================================================================
    async findProductById(organizationId: string, id: string) {
        const product = await this.prisma.product.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                inventoryItems: {
                    select: {
                        id: true,
                        warehouseId: true,
                        quantity: true,
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID "${id}" not found.`);
        }

        return product;
    }

    // =========================================================================
    // 4. UPDATE PRODUCT (Tenant-Scoped with SKU Conflict Check)
    // =========================================================================
    async updateProduct(
        organizationId: string,
        id: string,
        dto: UpdateProductDto,
    ) {
        // 1. Verify existence in this tenant
        const existing = await this.prisma.product.findFirst({
            where: { id, organizationId },
        });

        if (!existing) {
            throw new NotFoundException(`Product with ID "${id}" not found.`);
        }

        // 2. Check if updating SKU collides with another product in this organization
        if (dto.sku && dto.sku !== existing.sku) {
            const duplicateSku = await this.prisma.product.findUnique({
                where: {
                    organizationId_sku: {
                        organizationId,
                        sku: dto.sku,
                    },
                },
            });

            if (duplicateSku) {
                throw new ConflictException(
                    `Another product with SKU "${dto.sku}" already exists.`,
                );
            }
        }

        // 3. Perform update
        return this.prisma.product.update({
            where: { id },
            data: {
                ...(dto.sku && { sku: dto.sku }),
                ...(dto.name && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.price !== undefined && { price: new Prisma.Decimal(dto.price) }),
                ...(dto.reorderLevel !== undefined && { reorderLevel: dto.reorderLevel }),
            },
        });
    }

    // =========================================================================
    // 5. DELETE PRODUCT (Tenant-Scoped)
    // =========================================================================
    async deleteProduct(organizationId: string, id: string) {
        const product = await this.prisma.product.findFirst({
            where: { id, organizationId },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID "${id}" not found.`);
        }

        return this.prisma.product.delete({
            where: { id },
        });
    }
}