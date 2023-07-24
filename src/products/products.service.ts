import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { validate as isUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Product, ProductImage } from './entities';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) { }


  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image })),
        user
      });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;

      const products = this.productRepository.find({
        take: limit,
        skip: 0,
        relations: { images: true }//Indicamos la relacion con las imagenes para que nos muestre las imagenes
      });

      //Podriamos devolver products directamente.Si queremos filtrar campos o renombrar podemos pasar por el map 
      return (await products).map(product => ({
        ...product,
        images: product.images.map(img => img.url)
      }));
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      //si no se encuentra ningún producto a traves del id, se realiza la busqueda con querybuilder para buscar por nombre o slug
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      //en la busqueda el nombre se pasa a mayusculas para que no sea case sensitive y slug a minusculas como se guarda en la BD
      product = await queryBuilder.where(`UPPER(title) =:title or slug =:slug`,
        { title: term.toUpperCase(), slug: term.toLocaleLowerCase() })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with ${term} not found`);

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto,user:User) {

    //Vamos a crear una trasaccion para cargar los datos del producto y las imagenes por separado
    const { images, ...toUpdate } = updateProductDto;

    //Cargamos los datos del producto sin las imagenes si este existe
    const product = await this.productRepository.preload({ id: id, ...toUpdate });
    if (!product) throw new NotFoundException(`Product with ${id} not found`);

    //Insertamos las imagenes si vienen
    //Create query runnner para realizar la transaccion
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      //Si vienen imagenes, borramos las anteriores imagenes que tiene el producto
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map(image => this.productImageRepository.create({ url: image }));
      } else {
        //Si ya existian imagenes y no las envian las respetaremos
        product.images = await this.productImageRepository.findBy({ product: { id } });
      }

      product.user=user;
      
      await queryRunner.manager.save(product);
      // await this.productRepository.save(product); //Sin realizar la transaccion se podria guardar asi

      //Aplicamos el commit de la transaccion
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      //Si tenemos un error realizamos el rollback de la transaccion
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    //Se podria hacer que directamente lo borre
    // this.productRepository.delete({ id: id });
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }


  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(`Unexpected error, check server logs`);
  }
}
