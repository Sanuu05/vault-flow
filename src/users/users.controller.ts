import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, GetUsersDto, LoginDto, UpdateUserDto } from './dto/user.dto';
import { Public } from './decorators/public.decorator';
import { AuthenticatedUser, CurrentUser } from './decorators/current-decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/v1/user')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    // 🔓 PUBLIC: Register a new user
    @Public()
    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.userService.createUser(dto);
    }

    // 🔓 PUBLIC: Login and receive a JWT
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.userService.login(dto);
    }

    // 🔒 PROTECTED: Current user profile
    @Get('me')
    getProfile(@CurrentUser() user: AuthenticatedUser) {
        return user;
    }

    // 🔒 PROTECTED: All users in the caller's org
    @Get()
    findAll(@Req() req: any, @Query() query: GetUsersDto) {
        // Prefer the JWT org so the caller can't enumerate other orgs
        const organizationId = req.user.organizationId;
        return this.userService.findAll({ ...query, organizationId });
    }

    // 🔒 PROTECTED: Single user by ID (scoped to caller's org)
    @Get(':id')
    findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
        return this.userService.findOne(req.user.organizationId, { id });
    }

    // 🔒 PROTECTED: Update name / role / password
    @Patch(':id')
    update(
        @Req() req: any,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.userService.updateUser(req.user.organizationId, id, dto);
    }

    // 🔒 PROTECTED: Delete a user (cannot delete self)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
        return this.userService.deleteUser(req.user.organizationId, req.user.id, id);
    }
}
