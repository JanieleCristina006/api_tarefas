/*

DTO > Data Transfer Object (Objeto de transferência de dados)
> Validar dados e transformar dados.
> Usa-se para representar quais dados e em que formatos uma determinada camada aceita e trabalha.

*/

import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Indica se a tarefa foi concluída.',
  })
  @IsBoolean()
  @IsOptional()
  readonly completed?: boolean;
}

// export class UpdateTaskDto{
//   @IsString()
//   @IsOptional()
//   readonly name?:string;

//   @IsString()
//   @IsOptional()
//   readonly description?: string;

//   @IsBoolean()
//   @IsOptional()
//   readonly completed?: boolean;
// }
