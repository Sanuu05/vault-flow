import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
    constructor(private readonly prisma: PrismaService) { }
    // 1. CREATE A NEW TENANT / ORGANIZATION
    async create(dto: CreateOrganizationDto) {
        // Check if slug is already taken
        const existOrg = await this.prisma.organization.findUnique({
            where: {
                slug: dto.slug
            }
        })
        if (existOrg) {
            throw new ConflictException(`Organization with slug '${dto.slug}' already exists.`)
        }
        return await this.prisma.organization.create({
            data: {
                name: dto.name,
                slug: dto.slug
            }
        })
    }

    // 2. FIND ALL ORGANIZATIONS (Superadmin use case)

    async findAll() {
        return await this.prisma.organization.findMany({
            orderBy: {
                createdAt: "desc"
            }
        })
    }

    // 3. FIND ONE BY ID

    async findById(id: string) {
        const org = await this.prisma.organization.findUnique({
            where: { id }
        })
        if (!org) {
            throw new NotFoundException(`Organization with ID '${id}' not found.`);
        }

        return org;
    }

    // 4. UPDATE ORGANIZATION DETAILS (Partial Update)
    async update(id: string, dto: UpdateOrganizationDto) {
        // Verify existence first
        await this.findById(id);

        // If updating slug, check for collisions
        if (dto.slug) {
            const slugOwner = await this.prisma.organization.findUnique({
                where: { slug: dto.slug },
            });

            if (slugOwner && slugOwner.id !== id) {
                throw new ConflictException(`Slug '${dto.slug}' is already taken by another organization.`);
            }
        }

        return this.prisma.organization.update({
            where: { id },
            data: dto,
        });
    }

    // 5. DELETE ORGANIZATION
    async delete(id: string) {
        await this.findById(id);

        return this.prisma.organization.delete({
            where: { id },
        });
    }

}
