import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseTaskDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador único da tarefa.',
  })
  id: number;

  @ApiProperty({
    example: 'Estudar NestJS',
    description: 'Título da tarefa.',
  })
  name: string;

  @ApiProperty({
    example: 'Criar documentação da API com Swagger',
    description: 'Descrição detalhada da tarefa.',
  })
  description: string;

  @ApiProperty({
    example: false,
    description: 'Indica se a tarefa foi concluída.',
  })
  completed: boolean;

  @ApiPropertyOptional({
    example: '2026-09-22T12:00:00.000Z',
    description: 'Data de criação da tarefa.',
    nullable: true,
  })
  createAt?: Date | null;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID do usuário dono da tarefa.',
    nullable: true,
  })
  userId?: number | null;
}

export class DeleteTaskResponseDto {
  @ApiProperty({
    example: 'Tarefa deletada com sucesso!',
    description: 'Mensagem de confirmação da exclusão.',
  })
  message: string;
}
