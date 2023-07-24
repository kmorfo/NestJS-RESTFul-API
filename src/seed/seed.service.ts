import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { initialData } from './data/seed-data';
import { ProductsService } from './../products/products.service';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';


@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async runSeed() {
    this.deleteTables();
    const user: User = await this.insertUsers();

    this.insertNewProducts(user);
    return `Execute Seed`;
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();

  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user))
    });
    await this.userRepository.save(users);
    return users[0];
  }

  private async insertNewProducts(user: User) {
    this.productService.deleteAllProducts();

    const seedProducts = initialData.products;

    const insertPromises = [];

    seedProducts.forEach(product => {
      insertPromises.push(this.productService.create(product, user));
    })
    await Promise.all(insertPromises);

    return true;
  }

}
