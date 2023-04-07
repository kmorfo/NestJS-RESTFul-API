import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) { }

  @Get()
  // @Auth(ValidRoles.admin)//Si queremos que solo un admin pueda ejecutar el seed
  executeSeed() {

    return this.seedService.runSeed();
  }

}
