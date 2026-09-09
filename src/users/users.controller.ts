import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, GetUsersDto, LoginDto } from './dto/user.dto';
import { Public } from './decorators/public.decorator';
import { AuthenticatedUser, CurrentUser } from './decorators/current-decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/v1/user')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly userService: UsersService) { }


    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.userService.createUser(dto)
    }
    // 🔓 PUBLIC: Allows users to log in and receive a JWT
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() dto: LoginDto) {

        return this.userService.login(dto);
    }
    // 🔒 PROTECTED: Returns the token claims and profile for the caller
    @Get('me')
    getProfile(@CurrentUser() user: AuthenticatedUser) {
        return user;
    }
    @Get()
    findAll(@Query() query: GetUsersDto) {
        return this.userService.findAll(query)
    }
    @Get(':id')
    findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Query('organizationId', ParseUUIDPipe) organizationId: string
    ) {
        return this.userService.findOne(organizationId, { id })
    }


}
