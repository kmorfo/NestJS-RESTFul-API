import { Controller, Post, Get, Res, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException, Param, Patch } from '@nestjs/common';
import { diskStorage } from 'multer';
import { Response } from 'express';

import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';

import { fileFilter, fileNamer } from './helpers';
import { FilesService } from './files.service';


@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) { }

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {
    const patch = this.filesService.getStaticProductImage(imageName);

    //Al utilizar el decorador Res, tenemos que rear la respuesta manualmente
    res.sendFile(patch);
  }


  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: { fileSize: 15000 },
    storage: diskStorage({ destination: './static/products', filename: fileNamer })

  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File) {

    //Se valida el archivo recibido con el fileFilter que se llama en el interceptor, si no cumple los parametros se rechaza
    if (!file) throw new BadRequestException('Make sure that the file is an image');

    // const secureUrl = `${file.filename}`;
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return secureUrl;
  }


  //Ejemplo utilizando los validation pipes
  /*   @Post('product')
    @UseInterceptors(FileInterceptor('file'))
    uploadProductImage(
      @UploadedFile(
        new ParseFilePipe({
          validators: [
            new MaxFileSizeValidator({ maxSize: 1500000 }),//En bytes
            new FileTypeValidator({ fileType: 'image/png' }),
          ]
        })
      )
      file: Express.Multer.File,
    ) {
      return file;
    } */

}
