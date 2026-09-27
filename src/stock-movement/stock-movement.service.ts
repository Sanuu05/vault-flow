import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
    CreateStockMovementDto,
    MovementType,
    QueryStockMovementDto,
} from './dto/stock-movement.dto';
import { Prisma } from 'generated/prisma/browser';

@Injectable()
export class StockMovementsService {
    constructor(private readonly prisma: PrismaService) { }

    // =========================================================================
    // 1. CREATE STOCK MOVEMENT (Atomic Transaction: Updates Inventory + Logs Movement)
    // =========================================================================
    async createStockMovement(
        organizationId: string,
        userId: string,
        dto: CreateStockMovementDto,
    ) {
        // 1. Verify inventory item belongs to the organization
        const inventoryItem = await this.prisma.inventoryItem.findFirst({
            where: { id: dto.inventoryItemId, organizationId },
        });

        if (!inventoryItem) {
            throw new NotFoundException(
                `Inventory item with ID "${dto.inventoryItemId}" not found.`,
            );
        }

        // 2. Calculate new quantity based on movement type
        let newQuantity = inventoryItem.quantity;

        if (
            dto.type === MovementType.INBOUND_RESTOCK ||
            dto.type === MovementType.TRANSFER_IN
        ) {
            newQuantity += dto.quantityChanged;
        } else if (
            dto.type === MovementType.OUTBOUND_SALE ||
            dto.type === MovementType.TRANSFER_OUT ||
            dto.type === MovementType.DAMAGE
        ) {
            newQuantity -= dto.quantityChanged;
            if (newQuantity < 0) {
                throw new BadRequestException(
                    `Insufficient stock. Available quantity is ${inventoryItem.quantity}, but tried to remove ${dto.quantityChanged}.`,
                );
            }
        } else if (dto.type === MovementType.ADJUSTMENT) {
            newQuantity += dto.quantityChanged;
            if (newQuantity < 0) newQuantity = 0;
        }

        // 3. Execute database transaction (Atomicity)
        return await this.prisma.$transaction(async (tx) => {
            // Update the current inventory quantity
            await tx.inventoryItem.update({
                where: { id: inventoryItem.id },
                data: { quantity: newQuantity },
            });

            // Create the immutable audit log record
            return await tx.stockMovement.create({
                data: {
                    organizationId,
                    inventoryItemId: dto.inventoryItemId,
                    type: dto.type,
                    quantityChanged: dto.quantityChanged,
                    referenceId: dto.referenceId,
                    createdByUserId: userId,
                    notes: dto.notes,
                },
                include: {
                    inventoryItem: {
                        include: {
                            product: { select: { id: true, name: true, sku: true } },
                            warehouse: { select: { id: true, name: true, code: true } },
                        },
                    },
                    createdByUser: { select: { id: true, name: true, email: true } },
                },
            });
        });
    }

    // =========================================================================
    // 2. GET ALL STOCK MOVEMENTS (Tenant-Scoped with Filters & Pagination)
    // =========================================================================
    async findAllMovements(
        organizationId: string,
        query?: QueryStockMovementDto,
    ) {
        const { inventoryItemId, type, page = 1, limit = 10 } = query || {};
        const skip = (page - 1) * limit;

        const where: Prisma.StockMovementWhereInput = {
            organizationId,
            ...(inventoryItemId && { inventoryItemId }),
            ...(type && { type }),
        };

        const [total, items] = await Promise.all([
            this.prisma.stockMovement.count({ where }),
            this.prisma.stockMovement.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    inventoryItem: {
                        include: {
                            product: { select: { id: true, name: true, sku: true } },
                            warehouse: { select: { id: true, name: true, code: true } },
                        },
                    },
                    createdByUser: { select: { id: true, name: true, email: true } },
                },
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
    // 3. GET SINGLE STOCK MOVEMENT BY ID
    // =========================================================================
    async findMovementById(organizationId: string, id: string) {
        const movement = await this.prisma.stockMovement.findFirst({
            where: { id, organizationId },
            include: {
                inventoryItem: {
                    include: {
                        product: { select: { id: true, name: true, sku: true } },
                        warehouse: { select: { id: true, name: true, code: true } },
                    },
                },
                createdByUser: { select: { id: true, name: true, email: true } },
            },
        });

        if (!movement) {
            throw new NotFoundException(`Stock movement record with ID "${id}" not found.`);
        }

        return movement;
    }
}