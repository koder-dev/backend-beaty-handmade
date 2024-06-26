import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma, Product } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '../file/file.service';
import { OrderByPipe, WherePipe } from '@nodeteam/nestjs-pipes';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly fileService: FileService,
  ) {}

  @Post()
  createProduct(@Body(ValidationPipe) createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Post('image/:id')
  @UseInterceptors(FileInterceptor('file', { dest: './public/images/product' }))
  async setProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const imgInfo = await this.fileService.uploadFile(file);
    return this.productService.updateProduct(id, { img: imgInfo.filename });
  }

  @Get()
  getProducts(
    @Query('where', WherePipe) where?: Prisma.ProductWhereInput,
    @Query('orderBy', OrderByPipe)
    orderBy?: Prisma.ProductOrderByWithRelationInput,
  ): Promise<Product[]> {
    return this.productService.getProducts(where, orderBy);
  }

  @Get(':id')
  getProductById(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productService.getProductById(+id);
  }

  @Patch(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(+id, updateProductDto);
  }

  @Delete(':id')
  removeProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.removeProduct(+id);
  }
}
