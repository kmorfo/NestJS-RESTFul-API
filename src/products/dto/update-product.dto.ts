// import { PartialType } from '@nestjs/mapped-types'; //Importamos de swagger al crear la doc
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
