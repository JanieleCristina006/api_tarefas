import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class createUserDto {
  @ApiProperty({
    example: 'Janiele Silva',
    description: 'Nome completo do usuário.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'janiele@email.com',
    description: 'Email usado para login e identificação do usuário.',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha do usuário. Deve possuir pelo menos 6 caracteres.',
    minLength: 6,
    writeOnly: true,
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}

// @IsStrongPassword({
//   minLength: 6,
//   minLowercase: 1,
//   minNumbers: 1,
//   minUppercase: 1
// })
