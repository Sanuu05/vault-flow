import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, GetUsersDto, LoginDto, UserResponseDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { JwtPayload } from './strategies/jwt.strategy';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    // 1. CREATE A NEW USER
    async createUser(dto: CreateUserDto) {
        // Check if user already exists within this tenant
        const existUser = await this.prisma.user.findFirst({
            where: {
                email: dto.email,
                organizationId: dto.organizationId,
            },
        });

        if (existUser) {
            throw new ConflictException(
                `User with email '${dto.email}' already exists in this organization.`,
            );
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                organizationId: dto.organizationId,
                email: dto.email,
                name: dto.name,
                passwordHash,
                role: dto.role,

            },
        });

        // Consistent serialization
        return plainToInstance(UserResponseDto, user);
    }

    // 2. GET ALL USERS (Scoped to tenant)
    async findAll(dto: GetUsersDto) {
        const users = await this.prisma.user.findMany({
            where: {
                organizationId: dto.organizationId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return plainToInstance(UserResponseDto, users);
    }

    // 3. GET SINGLE USER BY ID OR EMAIL (Scoped to tenant)
    async findOne(organizationId: string, identifier: { id?: string; email?: string }) {
        const user = await this.prisma.user.findFirst({
            where: {
                organizationId,
                ...(identifier.id ? { id: identifier.id } : {}),
                ...(identifier.email ? { email: identifier.email } : {}),
            },
        });

        if (!user) {
            throw new NotFoundException(`User not found in this organization.`);
        }

        return plainToInstance(UserResponseDto, user);
    }

    async login(dto: LoginDto) {
        // 4. Locate user in DB
        const user = await this.prisma.user.findUnique({
            where: {
                organizationId_email: {
                    email: dto.email,
                    organizationId: dto.organizationId,
                },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        // 2. Validate hashed password
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        // 3. Prepare payload for JWT signing
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            organizationId: user.organizationId,
            role: user.role,
        };

        // 4. Sign token
        const accessToken = await this.jwtService.signAsync(payload);

        // 5. Return sanitized user using plainToInstance
        return {
            accessToken,
            user: plainToInstance(UserResponseDto, user),
        };
    }
}