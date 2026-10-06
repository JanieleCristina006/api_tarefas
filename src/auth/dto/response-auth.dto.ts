import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseAuthDto {
  @ApiProperty({
    example: 1,
    description: 'Identificador único do usuário autenticado.',
  })
  id: number;

  @ApiProperty({
    example: 'Janiele Silva',
    description: 'Nome do usuário autenticado.',
  })
  name: string;

  @ApiPropertyOptional({
    example: '1.png',
    description: 'Avatar do usuário autenticado, quando cadastrado.',
    nullable: true,
  })
  avatar?: string | null;

  @ApiProperty({
    example: 'janiele@email.com',
    description: 'Email do usuário autenticado.',
  })
  email: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.exemplo.assinatura',
    description: 'Token JWT usado no header Authorization como Bearer token.',
  })
  token: string;
}
