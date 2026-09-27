import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
    CreateSupplierDto,
    QuerySupplierDto,
    UpdateSupplierDto,
} from './dto/suppliers.dto';
import { Prisma } from 'generated/prisma/browser';

@Injectable()
export class SuppliersService {
    constructor(private readonly prisma: PrismaService) { }

    // =========================================================================
    // 1. CREATE SUPPLIER
    // =========================================================================
    async createSupplier(organizationId: string, dto: CreateSupplierDto) {
        // Optional: Check if a supplier with the same name already exists in this organization
        const existing = await this.prisma.supplier.findFirst({
            where: {
                organizationId,
                name: { equals: dto.name, mode: 'insensitive' },
            },
        });

        if (existing) {
            throw new ConflictException(
                `Supplier with name "${dto.name}" already exists in this organization.`,
            );
        }

        return this.prisma.supplier.create({
            data: {
                organizationId,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                address: dto.address,
            },
        });
    }

    // =========================================================================
    // 2. GET ALL SUPPLIERS (Tenant-Scoped with Search & Pagination)
    // =========================================================================
    async findAllSuppliers(organizationId: string, query?: QuerySupplierDto) {
        const { search, page = 1, limit = 10 } = query || {};
        const skip = (page - 1) * limit;

        const where: Prisma.SupplierWhereInput = {
            organizationId,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [total, items] = await Promise.all([
            this.prisma.supplier.count({ where }),
            this.prisma.supplier.findMany({
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
    // 3. GET ONE SUPPLIER BY ID (Tenant-Scoped)
    // =========================================================================
    async findSupplierById(organizationId: string, id: string) {
        const supplier = await this.prisma.supplier.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
                purchaseOrders: {
                    select: {
                        id: true,
                        poNumber: true,
                        status: true,
                        expectedDeliveryDate: true,
                        createdAt: true,
                    },
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!supplier) {
            throw new NotFoundException(`Supplier with ID "${id}" not found.`);
        }

        return supplier;
    }

    // =========================================================================
    // 4. UPDATE SUPPLIER (Tenant-Scoped with Name Conflict Check)
    // =========================================================================
    async updateSupplier(
        organizationId: string,
        id: string,
        dto: UpdateSupplierDto,
    ) {
        const existing = await this.prisma.supplier.findFirst({
            where: { id, organizationId },
        });

        if (!existing) {
            throw new NotFoundException(`Supplier with ID "${id}" not found.`);
        }

        if (dto.name && dto.name !== existing.name) {
            const duplicateName = await this.prisma.supplier.findFirst({
                where: {
                    organizationId,
                    name: { equals: dto.name, mode: 'insensitive' },
                },
            });

            if (duplicateName) {
                throw new ConflictException(
                    `Another supplier with name "${dto.name}" already exists.`,
                );
            }
        }

        return this.prisma.supplier.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.email !== undefined && { email: dto.email }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.address !== undefined && { address: dto.address }),
            },
        });
    }

    // =========================================================================
    // 5. DELETE SUPPLIER (Tenant-Scoped)
    // =========================================================================
    async deleteSupplier(organizationId: string, id: string) {
        const supplier = await this.prisma.supplier.findFirst({
            where: { id, organizationId },
        });

        if (!supplier) {
            throw new NotFoundException(`Supplier with ID "${id}" not found.`);
        }

        await this.prisma.supplier.delete({
            where: { id },
        });

        return { message: 'Supplier successfully deleted.' };
    }
}