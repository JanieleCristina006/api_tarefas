import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ResponseAuthDto } from './dto/response-auth.dto';
import { SignInDto } from './dto/signin.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({
    summary: 'Autenticar usuário',
    description:
      'Valida email e senha de um usuário ativo e retorna um token JWT para acessar rotas protegidas.',
  })
  @ApiBody({
    type: SignInDto,
    description: 'Credenciais do usuário.',
    examples: {
      usuario: {
        summary: 'Usuário cadastrado',
        value: {
          email: 'pedro@email.com',
          password: '123456',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Usuário autenticado com sucesso.',
    type: ResponseAuthDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Email, senha ou usuário ativo não encontrados.',
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.authenticate(signInDto);
  }
}
