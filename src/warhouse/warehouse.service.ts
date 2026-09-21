import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
    CreateWarehouseDto,
    UpdateWarehouseDto,
} from './dto/warehouse.dto';

@Injectable()
export class WarehouseService {
    constructor(private readonly prisma: PrismaService) { }

    // 1. CREATE: Tenant-scoped creation
    async createWarehouse(organizationId: string, dto: CreateWarehouseDto) {
        const { name, code, address, isActive } = dto;

        // Check conflict within the tenant
        const existingWarehouse = await this.prisma.warehouse.findFirst({
            where: {
                organizationId,
                OR: [{ name }, { code }],
            },
        });

        if (existingWarehouse) {
            if (existingWarehouse.name === name) {
                throw new ConflictException(
                    `Warehouse with the name "${name}" already exists.`,
                );
            }
            throw new ConflictException(
                `Warehouse with the code "${code}" already exists.`,
            );
        }

        return this.prisma.warehouse.create({
            data: {
                organizationId,
                name,
                code,
                address,
                isActive: isActive ?? true,
            },
        });
    }

    // 2. FIND ALL: Always scoped to organizationId
    async findWarehousesByOrganization(organizationId: string) {
        return this.prisma.warehouse.findMany({
            where: {
                organizationId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    // 3. FIND ONE: Prevents cross-tenant access by checking compound identity
    async findWarehouseById(organizationId: string, id: string) {
        const warehouse = await this.prisma.warehouse.findFirst({
            where: {
                id,
                organizationId,
            },
        });

        if (!warehouse) {
            throw new NotFoundException('Warehouse not found.');
        }

        return warehouse;
    }

    // 4. UPDATE: Safely excludes the current record and verifies tenant ownership
    async updateWarehouse(
        organizationId: string,
        id: string,
        dto: UpdateWarehouseDto,
    ) {
        // 1. Verify existence and tenant ownership
        const warehouse = await this.prisma.warehouse.findFirst({
            where: {
                id,
                organizationId,
            },
        });

        if (!warehouse) {
            throw new NotFoundException('Warehouse not found.');
        }

        // 2. Check duplicate names or codes across OTHER warehouses in the same tenant
        if (dto.name || dto.code) {
            const duplicateWarehouse = await this.prisma.warehouse.findFirst({
                where: {
                    organizationId,
                    id: { not: id }, // ✅ Properly excludes current warehouse
                    OR: [
                        ...(dto.name ? [{ name: dto.name }] : []),
                        ...(dto.code ? [{ code: dto.code }] : []),
                    ],
                },
            });

            if (duplicateWarehouse) {
                if (dto.name && duplicateWarehouse.name === dto.name) {
                    throw new ConflictException(
                        `Warehouse with the name "${dto.name}" already exists.`,
                    );
                }
                if (dto.code && duplicateWarehouse.code === dto.code) {
                    throw new ConflictException(
                        `Warehouse with the code "${dto.code}" already exists.`,
                    );
                }
            }
        }

        // 3. Perform update
        return this.prisma.warehouse.update({
            where: {
                id,
            },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.code && { code: dto.code }),
                ...(dto.address !== undefined && { address: dto.address }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
    }

    // 5. DELETE: Scoped to tenant
    async deleteWarehouse(organizationId: string, id: string) {
        const warehouse = await this.prisma.warehouse.findFirst({
            where: { id, organizationId },
        });

        if (!warehouse) {
            throw new NotFoundException('Warehouse not found.');
        }

        return this.prisma.warehouse.delete({
            where: { id },
        });
    }
}