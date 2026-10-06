import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PayloadTokenDto } from '../auth/dto/payload-token.dto';
import { AuthTokenGuard } from '../auth/guard/auth-token.guard';
import { TokenPayloadParam } from '../auth/param/token-payload.param';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import {
  DeleteTaskResponseDto,
  ResponseTaskDto,
} from './dto/response-task-dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Get()
  @ApiOperation({
    summary: 'Buscar todas as tarefas',
    description:
      'Lista tarefas com paginação simples usando limite e deslocamento.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Quantidade máxima de tarefas retornadas. Valor máximo: 50.',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 0,
    description: 'Quantidade de tarefas ignoradas antes do retorno.',
  })
  @ApiOkResponse({
    description: 'Tarefas encontradas com sucesso.',
    type: ResponseTaskDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Parâmetros de paginação inválidos.',
  })
  findAllTasks(@Query() paginationDto: PaginationDto) {
    return this.taskService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar tarefa por ID',
    description: 'Retorna uma tarefa específica pelo seu identificador.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID numérico da tarefa.',
  })
  @ApiOkResponse({
    description: 'Tarefa encontrada com sucesso.',
    type: ResponseTaskDto,
  })
  @ApiNotFoundResponse({
    description: 'Tarefa não encontrada.',
  })
  findOneTask(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Criar tarefa',
    description:
      'Cria uma tarefa vinculada ao usuário autenticado pelo token JWT.',
  })
  @ApiBody({
    type: CreateTaskDto,
    description: 'Dados necessários para cadastrar uma tarefa.',
  })
  @ApiCreatedResponse({
    description: 'Tarefa criada com sucesso.',
    type: ResponseTaskDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou falha ao cadastrar tarefa.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, inválido ou usuário inativo.',
  })
  createTask(
    @Body() body: CreateTaskDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.taskService.create(body, tokenPayload);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Atualizar tarefa',
    description:
      'Atualiza uma tarefa somente quando ela pertence ao usuário autenticado.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID numérico da tarefa que será atualizada.',
  })
  @ApiBody({
    type: UpdateTaskDto,
    description: 'Campos da tarefa que serão atualizados.',
  })
  @ApiOkResponse({
    description: 'Tarefa atualizada com sucesso.',
    type: ResponseTaskDto,
  })
  @ApiBadRequestResponse({
    description:
      'Tarefa não encontrada, acesso negado ou falha na atualização.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, inválido ou usuário inativo.',
  })
  updatedTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTaskDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.taskService.update(id, body, tokenPayload);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Deletar tarefa',
    description:
      'Remove uma tarefa somente quando ela pertence ao usuário autenticado.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID numérico da tarefa que será deletada.',
  })
  @ApiOkResponse({
    description: 'Tarefa deletada com sucesso.',
    type: DeleteTaskResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Tarefa não encontrada ou falha na exclusão.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, inválido ou usuário inativo.',
  })
  deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.taskService.delete(id, tokenPayload);
  }
}
