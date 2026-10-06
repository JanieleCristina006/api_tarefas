import 'multer';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { PayloadTokenDto } from '../auth/dto/payload-token.dto';
import { AuthTokenGuard } from '../auth/guard/auth-token.guard';
import { TokenPayloadParam } from '../auth/param/token-payload.param';
import { createUserDto } from './dto/create-user.dto';
import {
  BasicUserResponseDto,
  DeleteUserResponseDto,
  UserAvatarResponseDto,
  UserWithTasksResponseDto,
} from './dto/response-user-dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description:
      'Retorna os dados públicos do usuário e suas tarefas vinculadas.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID numérico do usuário.',
  })
  @ApiOkResponse({
    description: 'Usuário encontrado com sucesso.',
    type: UserWithTasksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Usuário não encontrado ou ID inválido.',
  })
  findOneUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar usuário',
    description: 'Cria um novo usuário e retorna os dados básicos cadastrados.',
  })
  @ApiBody({
    type: createUserDto,
    description: 'Dados necessários para cadastrar um usuário.',
  })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso.',
    type: BasicUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou falha ao cadastrar usuário.',
  })
  createUser(@Body() body: createUserDto) {
    return this.userService.createUser(body);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Atualizar usuário',
    description:
      'Atualiza nome e/ou senha do usuário autenticado. O token deve pertencer ao usuário informado no parâmetro.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID numérico do usuário que será atualizado.',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Campos do usuário que serão atualizados.',
  })
  @ApiOkResponse({
    description: 'Usuário atualizado com sucesso.',
    type: BasicUserResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Usuário não encontrado, acesso negado ou falha na atualização.',
  })
  @ApiForbiddenResponse({
    description: 'Esta conta não pode ser modificada.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, inválido ou usuário inativo.',
  })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.userService.updateUser(id, body, tokenPayload);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthTokenGuard)
  @ApiOperation({
    summary: 'Deletar usuário',
    description:
      'Remove o usuário autenticado. O token deve pertencer ao usuário informado no parâmetro.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'ID numérico do usuário que será deletado.',
  })
  @ApiOkResponse({
    description: 'Usuário deletado com sucesso.',
    type: DeleteUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Usuário não encontrado, acesso negado ou falha na exclusão.',
  })
  @ApiForbiddenResponse({
    description: 'Esta conta não pode ser deletada.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, inválido ou usuário inativo.',
  })
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.userService.deleteUser(id, tokenPayload);
  }

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(AuthTokenGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Fazer upload do avatar do usuário',
    description:
      'Recebe uma imagem JPG, JPEG ou PNG de até 5MB e vincula como avatar do usuário autenticado.',
  })
  @ApiBody({
    description: 'Arquivo de imagem enviado no campo file.',
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagem JPG, JPEG ou PNG com tamanho máximo de 5MB.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Avatar atualizado com sucesso.',
    type: UserAvatarResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Usuário não encontrado ou falha ao atualizar avatar.',
  })
  @ApiForbiddenResponse({
    description: 'Esta conta não pode ser modificada.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT ausente, inválido ou usuário inativo.',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Arquivo ausente, formato inválido ou tamanho maior que 5MB.',
  })
  async uploadAvatar(
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /jpeg|jpg|png/g,
        })
        .addMaxSizeValidator({
          maxSize: 5 * (1024 * 1024),
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.uploadAvatarImage(tokenPayload, file);
  }
}
