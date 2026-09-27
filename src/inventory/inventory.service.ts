import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
    CreateInventoryItemDto,
    QueryInventoryItemDto,
    UpdateInventoryItemDto,
} from './dto/inventory.dto';
import { Prisma } from 'generated/prisma/browser';

@Injectable()
export class InventoryService {
    constructor(private readonly prisma: PrismaService) { }

    // =========================================================================
    // 1. CREATE / INITIALIZE INVENTORY ITEM
    // =========================================================================
    async createInventoryItem(organizationId: string, dto: CreateInventoryItemDto) {
        // 1. Verify warehouse belongs to organization
        const warehouse = await this.prisma.warehouse.findFirst({
            where: { id: dto.warehouseId, organizationId },
        });
        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID "${dto.warehouseId}" not found.`);
        }

        // 2. Verify product belongs to organization
        const product = await this.prisma.product.findFirst({
            where: { id: dto.productId, organizationId },
        });
        if (!product) {
            throw new NotFoundException(`Product with ID "${dto.productId}" not found.`);
        }

        // 3. Check compound unique constraint [warehouseId, productId]
        const existing = await this.prisma.inventoryItem.findUnique({
            where: {
                warehouseId_productId: {
                    warehouseId: dto.warehouseId,
                    productId: dto.productId,
                },
            },
        });

        if (existing) {
            throw new ConflictException(
                `This product already exists in the specified warehouse inventory.`,
            );
        }

        return this.prisma.inventoryItem.create({
            data: {
                organizationId,
                warehouseId: dto.warehouseId,
                productId: dto.productId,
                quantity: dto.quantity ?? 0,
            },
            include: {
                warehouse: { select: { id: true, name: true, code: true } },
                product: { select: { id: true, sku: true, name: true, price: true, reorderLevel: true } },
            },
        });
    }

    // =========================================================================
    // 2. GET ALL INVENTORY (Tenant-Scoped with Filters & Pagination)
    // =========================================================================
    async findAllInventory(organizationId: string, query?: QueryInventoryItemDto) {
        const { warehouseId, productId, lowStock, page = 1, limit = 10 } = query || {};
        const skip = (page - 1) * limit;

        const where: Prisma.InventoryItemWhereInput = {
            organizationId,
            ...(warehouseId && { warehouseId }),
            ...(productId && { productId }),
        };

        let items = await this.prisma.inventoryItem.findMany({
            where,
            skip,
            take: limit,
            include: {
                warehouse: { select: { id: true, name: true, code: true } },
                product: { select: { id: true, sku: true, name: true, price: true, reorderLevel: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Optional post-query filter for low stock (quantity <= product.reorderLevel)
        if (lowStock === true) {
            items = items.filter((item) => item.quantity <= item.product.reorderLevel);
        }

        const total = await this.prisma.inventoryItem.count({ where });

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
    // 3. GET SINGLE INVENTORY ITEM BY ID
    // =========================================================================
    async findInventoryById(organizationId: string, id: string) {
        const item = await this.prisma.inventoryItem.findFirst({
            where: { id, organizationId },
            include: {
                warehouse: { select: { id: true, name: true, code: true } },
                product: { select: { id: true, sku: true, name: true, price: true, reorderLevel: true } },
                movements: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!item) {
            throw new NotFoundException(`Inventory item with ID "${id}" not found.`);
        }

        return item;
    }

    // =========================================================================
    // 4. UPDATE INVENTORY ITEM (Manual Quantity/Reserved Override)
    // =========================================================================
    async updateInventoryItem(
        organizationId: string,
        id: string,
        dto: UpdateInventoryItemDto = {},
    ) {
        const existing = await this.prisma.inventoryItem.findFirst({
            where: { id, organizationId },
        });

        if (!existing) {
            throw new NotFoundException(`Inventory item with ID "${id}" not found.`);
        }

        return this.prisma.inventoryItem.update({
            where: { id },
            data: {
                ...(dto.quantity !== undefined && { quantity: dto.quantity }),
                ...(dto.reservedQuantity !== undefined && { reservedQuantity: dto.reservedQuantity }),
            },
            include: {
                warehouse: { select: { id: true, name: true, code: true } },
                product: { select: { id: true, sku: true, name: true } },
            },
        });
    }

    // =========================================================================
    // 5. DELETE INVENTORY ITEM
    // =========================================================================
    async deleteInventoryItem(organizationId: string, id: string) {
        const item = await this.prisma.inventoryItem.findFirst({
            where: { id, organizationId },
        });

        if (!item) {
            throw new NotFoundException(`Inventory item with ID "${id}" not found.`);
        }

        await this.prisma.inventoryItem.delete({
            where: { id },
        });

        return { message: 'Inventory item successfully removed.' };
    }
}