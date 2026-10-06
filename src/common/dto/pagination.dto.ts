import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'Quantidade máxima de itens retornados.',
    minimum: 0,
    maximum: 50,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'Limite menor do que 0' })
  @Max(50)
  limit: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Quantidade de itens ignorados antes de iniciar o retorno.',
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset: number;
}
