import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { ProductsModule } from 'src/products/products.module';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports:[ProductsModule,AuthModule,UsersModule]
})
export class SeedModule {}
