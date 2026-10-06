import { ApiProperty } from '@nestjs/swagger';
import { ResponseTaskDto } from '../../tasks/dto/response-task-dto';

export class BasicUserResponseDto {
  @ApiProperty({
    example: 3,
    description: 'Identificador único do usuário.',
  })
  id: number;

  @ApiProperty({
    example: 'Pedro Henrique',
    description: 'Nome completo do usuário.',
  })
  name: string;

  @ApiProperty({
    example: 'pedro@email.com',
    description: 'Email cadastrado do usuário.',
  })
  email: string;
}

export class UserWithTasksResponseDto extends BasicUserResponseDto {
  @ApiProperty({
    type: [ResponseTaskDto],
    description: 'Tarefas relacionadas ao usuário.',
    example: [
      {
        id: 1,
        name: 'Estudar NestJS',
        description: 'Criar documentação da API com Swagger',
        completed: false,
        createAt: '2026-09-22T12:00:00.000Z',
        userId: 3,
      },
    ],
  })
  Task: ResponseTaskDto[];
}

export class UserAvatarResponseDto extends BasicUserResponseDto {
  @ApiProperty({
    example: '3.png',
    description: 'Nome do arquivo de avatar salvo na pasta pública.',
  })
  avatar: string;
}

export class DeleteUserResponseDto {
  @ApiProperty({
    example: 'Usuário deletado com sucesso!',
    description: 'Mensagem de confirmação da exclusão.',
  })
  message: string;
}
