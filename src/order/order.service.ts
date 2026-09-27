import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto, OrderStatus, QueryOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { MovementType } from 'generated/prisma/enums';
import { Prisma } from 'generated/prisma/browser';

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) { }

    // =========================================================================
    // 1. CREATE ORDER (Starts as RESERVED and updates inventory atomically)
    // =========================================================================
    async createOrder(organizationId: string, userId: string, dto: CreateOrderDto) {
        const warehouse = await this.prisma.warehouse.findFirst({
            where: { id: dto.warehouseId, organizationId },
        });

        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID "${dto.warehouseId}" not found.`);
        }

        // Validate initial stock availability
        for (const item of dto.items) {
            const inventoryItem = await this.prisma.inventoryItem.findFirst({
                where: {
                    organizationId,
                    warehouseId: dto.warehouseId,
                    productId: item.productId,
                },
            });

            if (!inventoryItem || inventoryItem.quantity < item.quantity) {
                throw new BadRequestException(
                    `Insufficient or missing stock for product ID "${item.productId}" in warehouse "${warehouse.name}".`,
                );
            }
        }

        return await this.prisma.$transaction(async (tx) => {
            // Create the Order record
            const order = await tx.order.create({
                data: {
                    organizationId,
                    warehouseId: dto.warehouseId,
                    userId,
                    orderNumber: dto.orderNumber,
                    customerName: dto.customerName,
                    customerEmail: dto.customerEmail,
                    shippingAddress: dto.shippingAddress,
                    city: dto.city,
                    state: dto.state,
                    postalCode: dto.postalCode,
                    country: dto.country || 'IN',
                    totalAmount: dto.totalAmount,
                    status: OrderStatus.RESERVED,
                    items: {
                        create: dto.items.map((item) => ({
                            organizationId,
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                        })),
                    },
                },
                include: {
                    items: { include: { product: true } },
                    warehouse: true,
                },
            });

            // Deduct inventory and record stock movements safely
            for (const item of dto.items) {
                const inventoryItem = await tx.inventoryItem.findFirst({
                    where: { organizationId, warehouseId: dto.warehouseId, productId: item.productId },
                });

                if (!inventoryItem) {
                    throw new NotFoundException(`Inventory record for product ID "${item.productId}" not found.`);
                }

                const newQuantity = inventoryItem.quantity - item.quantity;
                await tx.inventoryItem.update({
                    where: { id: inventoryItem.id },
                    data: { quantity: newQuantity },
                });

                await tx.stockMovement.create({
                    data: {
                        organizationId,
                        inventoryItemId: inventoryItem.id,
                        type: MovementType.OUTBOUND_SALE,
                        quantityChanged: item.quantity,
                        referenceId: order.id,
                        createdByUserId: userId,
                        notes: `Stock reserved/deducted for order #${order.orderNumber}`,
                    },
                });
            }

            return order;
        });
    }

    // =========================================================================
    // 2. GET ALL ORDERS (Tenant-Scoped with Filters & Pagination)
    // =========================================================================
    async findAllOrders(organizationId: string, query?: QueryOrderDto) {
        const { warehouseId, status, page = 1, limit = 10 } = query || {};
        const skip = (page - 1) * limit;

        const where: Prisma.OrderWhereInput = {
            organizationId,
            ...(warehouseId && { warehouseId }),
            ...(status && { status }),
        };

        const [total, items] = await Promise.all([
            this.prisma.order.count({ where }),
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    warehouse: { select: { id: true, name: true, code: true } },
                    items: { include: { product: { select: { id: true, name: true, sku: true } } } },
                },
            }),
        ]);

        return {
            items,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    // =========================================================================
    // 3. GET SINGLE ORDER BY ID
    // =========================================================================
    async findOrderById(organizationId: string, id: string) {
        const order = await this.prisma.order.findFirst({
            where: { id, organizationId },
            include: {
                warehouse: true,
                createdByUser: { select: { id: true, name: true, email: true } },
                items: { include: { product: true } },
            },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID "${id}" not found.`);
        }

        return order;
    }

    // =========================================================================
    // 4. UPDATE ORDER STATUS (Handles Cancellations & Automatic Restocks)
    // =========================================================================
    async updateOrderStatus(
        organizationId: string,
        id: string,
        dto: UpdateOrderStatusDto,
        userId: string,
    ) {
        const order = await this.findOrderById(organizationId, id);

        if (dto.status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
            return await this.prisma.$transaction(async (tx) => {
                const updatedOrder = await tx.order.update({
                    where: { id },
                    data: { status: dto.status },
                    include: { items: { include: { product: true } } },
                });

                for (const item of order.items) {
                    const inventoryItem = await tx.inventoryItem.findFirst({
                        where: { organizationId, warehouseId: order.warehouseId, productId: item.productId },
                    });

                    if (inventoryItem) {
                        const newQuantity = inventoryItem.quantity + item.quantity;
                        await tx.inventoryItem.update({
                            where: { id: inventoryItem.id },
                            data: { quantity: newQuantity },
                        });

                        await tx.stockMovement.create({
                            data: {
                                organizationId,
                                inventoryItemId: inventoryItem.id,
                                type: MovementType.INBOUND_RESTOCK,
                                quantityChanged: item.quantity,
                                referenceId: order.id,
                                createdByUserId: userId,
                                notes: `Restocked due to cancellation of order #${order.orderNumber}`,
                            },
                        });
                    }
                }

                return updatedOrder;
            });
        }

        return await this.prisma.order.update({
            where: { id },
            data: { status: dto.status },
            include: { items: { include: { product: true } } },
        });
    }
}