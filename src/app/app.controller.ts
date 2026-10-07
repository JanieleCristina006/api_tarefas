import { Controller, Get } from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Status')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Verificar disponibilidade da API',
    description: 'Confirma que a API esta online e respondendo requisicoes.',
  })
  @ApiOkResponse({
    description: 'API disponivel.',
    schema: {
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/teste')
  @ApiExcludeEndpoint()
  getTest() {
    return 'Rota de teste';
  }
}
