import {
    ConflictException,
    Injectable,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import {
    CreateWarehouseDto,
    GetWarehouseDto,
} from './dto/warehouse.dto';

@Injectable()
export class WarehouseService {
    constructor(private readonly prisma: PrismaService) { }

    async createWarehouse(dto: CreateWarehouseDto) {
        const { organizationId, name, code, address } = dto;

        const existingWarehouse = await this.prisma.warehouse.findFirst({
            where: {
                organizationId,
                OR: [
                    { name },
                    { code },
                ],
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
            },
        });
    }

    async findAllWarehouses() {
        return this.prisma.warehouse.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findWarehousesByOrganization(dto: GetWarehouseDto) {
        return this.prisma.warehouse.findMany({
            where: {
                organizationId: dto.organizationId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}