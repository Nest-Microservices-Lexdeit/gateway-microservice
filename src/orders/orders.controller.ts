import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Inject,
  Query,
} from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ORDERS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { catchError } from 'rxjs';

@Controller('orders')
export class OrdersController {


  constructor(
    @Inject(ORDERS_SERVICE) private readonly ordersClient: ClientProxy
  ) { }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    try {
      return this.ordersClient.send("createOrder", { ...createOrderDto })
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ordersClient.send("findAllOrders", { ...paginationDto })
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersClient.send("findOneOrder", id).pipe(catchError(err => { throw new RpcException(err) }));
  }

}
