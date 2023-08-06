import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) { }

  @Get()
  // @Auth(ValidRoles.admin)//Si queremos que solo un admin pueda ejecutar el seed
  @ApiResponse({ status: 200, description: 'Seed executed.' })
  executeSeed() {
    return this.seedService.runSeed();
  }

}
