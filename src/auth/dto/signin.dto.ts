import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    example: 'janiele@email.com',
    description: 'Email cadastrado do usuário.',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha cadastrada do usuário.',
    writeOnly: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
