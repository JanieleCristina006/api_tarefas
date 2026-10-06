import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Buscar mensagem inicial',
    description:
      'Retorna uma mensagem simples para verificar se a API está ativa.',
  })
  @ApiOkResponse({
    description: 'Mensagem inicial retornada com sucesso.',
    schema: {
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/teste')
  @ApiOperation({
    summary: 'Buscar rota de teste',
    description: 'Retorna uma mensagem fixa usada para teste manual da API.',
  })
  @ApiOkResponse({
    description: 'Rota de teste retornada com sucesso.',
    schema: {
      example: 'Rota de teste',
    },
  })
  getTest() {
    return 'Rota de teste';
  }
}
