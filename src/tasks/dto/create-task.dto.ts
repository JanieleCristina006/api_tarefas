/*

DTO > Data Transfer Object (Objeto de transferência de dados)
> Validar dados e transformar dados.
> Usa-se para representar quais dados e em que formatos uma determinada camada aceita e trabalha.

*/

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Estudar NestJS',
    description: 'Título curto da tarefa.',
    minLength: 5,
  })
  @IsString({ message: 'O nome deve ser um texto!' })
  @MinLength(5, { message: 'O nome tem que ter 5 caracteres ou mais!' })
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    example: 'Criar testes unitários e documentar a API com Swagger.',
    description: 'Descrição detalhada do que deve ser feito.',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  readonly description: string;
}
