import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {

    @ApiProperty({
        default: 10, description: 'How many rows do you need?'
    })
    @IsOptional()
    @IsPositive()
    //Transforma el parametro a Number, es similar al enableImplicitConversions:true solo que aqui se hace parametro por parametro
    @Type(() => Number)
    limit?: number;
    
    @ApiProperty({
        default: 0, description: 'How many rows do you skip?'
    })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset?: number;
}