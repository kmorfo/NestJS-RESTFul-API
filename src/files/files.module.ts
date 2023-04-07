import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports:[
    ConfigModule
  ]
})
export class FilesModule {}
