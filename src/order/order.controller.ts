import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { OrdersService } from './order.service';
import { CreateOrderDto, QueryOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/orders')
export class OrderController {
    constructor(private readonly ordersService: OrdersService) {}

    // POST /api/v1/orders
    @Post()
    create(@Req() req: any, @Body() dto: CreateOrderDto) {
        const { organizationId, id: userId } = req.user;
        return this.ordersService.createOrder(organizationId, userId, dto);
    }

    // GET /api/v1/orders?warehouseId=&status=&page=&limit=
    @Get()
    findAll(@Req() req: any, @Query() query: QueryOrderDto) {
        return this.ordersService.findAllOrders(req.user.organizationId, query);
    }

    // GET /api/v1/orders/:id
    @Get(':id')
    findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
        return this.ordersService.findOrderById(req.user.organizationId, id);
    }

    // PATCH /api/v1/orders/:id/status
    @Patch(':id/status')
    updateStatus(
        @Req() req: any,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateOrderStatusDto,
    ) {
        const { organizationId, id: userId } = req.user;
        return this.ordersService.updateOrderStatus(organizationId, id, dto, userId);
    }
}
