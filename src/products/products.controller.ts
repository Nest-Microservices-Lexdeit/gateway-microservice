import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, } from 'rxjs';
import { PaginationDto } from 'src/common';
import { NATS_SERVICE } from 'src/config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


@Controller('products')
export class ProductsController {


  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) { }


  @Post()
  createProduct(@Body() createProduct: CreateProductDto) {
    try {
      return this.client.send({ cmd: "create_product" }, { ...createProduct });
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get()
  findAllProducts(@Query() paginationDto: PaginationDto) {
    return this.client.send({ cmd: "find_all_products" }, { ...paginationDto });
  }

  @Get(":id")
  async findProductById(@Param('id') id: string) {

    try {

      const product = await firstValueFrom(this.client.send({ cmd: "find_one_product" }, { id: id }));

      return product;

    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete(":id")
  deleteProduct(@Param("id") id: string) {
    return this.client.send({ cmd: "delete_product" }, { id: id }).pipe(catchError(err => { throw new RpcException(err) }));
  }

  @Patch(":id")
  updateProduct(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateProduct: UpdateProductDto
  ) {

    return this.client.send({ cmd: "update_product" }, {
      id,
      ...updateProduct
    }).pipe(catchError(err => { throw new RpcException(err) }))

  }


}
