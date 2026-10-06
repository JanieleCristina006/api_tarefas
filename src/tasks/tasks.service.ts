import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Tasks } from './entities/tasks.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PayloadTokenDto } from '../auth/dto/payload-token.dto';
import { ResponseTaskDto } from './dto/response-task-dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(paginationDto: PaginationDto): Promise<ResponseTaskDto[]> {
    const { limit = 10, offset = 10 } = paginationDto;

    const allTasks = await this.prisma.task.findMany({
      take: limit,
      skip: offset,
    });

    return allTasks;
  }

  async findOne(id: number): Promise<ResponseTaskDto> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: id,
      },
    });

    if (task?.name) return task;

    throw new HttpException('Tarefa não encontrada!', HttpStatus.NOT_FOUND);
  }

  async create(
    body: CreateTaskDto,
    tokenPayload: PayloadTokenDto,
  ): Promise<ResponseTaskDto> {
    try {
      const newTask = await this.prisma.task.create({
        data: {
          name: body.name,
          description: body.description,
          userId: tokenPayload.sub,
        },
      });

      return newTask;
    } catch {
      throw new HttpException(
        'Falha ao cadastrar tarefa!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(
    id: number,
    body: UpdateTaskDto,
    tokenPayload: PayloadTokenDto,
  ): Promise<ResponseTaskDto> {
    try {
      const findTask = await this.prisma.task.findFirst({
        where: {
          id: id,
        },
      });

      if (!findTask) {
        throw new HttpException('Tarefa não encontrada', HttpStatus.NOT_FOUND);
      }

      if (findTask.userId !== tokenPayload.sub) {
        throw new HttpException('Tarefa não encontrada', HttpStatus.NOT_FOUND);
      }

      const task = await this.prisma.task.update({
        where: {
          id: findTask.id,
        },
        data: {
          name: body?.name ? body?.name : findTask.name,
          description: body?.description
            ? body?.description
            : findTask.description,
          completed:
            body?.completed !== undefined ? body.completed : findTask.completed,
        },
      });

      return task;
    } catch (error) {
      throw new HttpException(
        'Falha ao atualizar essa tarefa',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(id: number, tokenPayload: PayloadTokenDto) {
    try {
      const findTask = await this.prisma.task.findFirst({
        where: {
          id: id,
        },
      });

      if (!findTask) {
        throw new HttpException('Tarefa não encontrada', HttpStatus.NOT_FOUND);
      }

      if (findTask.userId !== tokenPayload.sub) {
        throw new HttpException(
          'Falha ao deletar essa tarefa!',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.task.delete({
        where: {
          id: findTask.id,
        },
      });

      return {
        message: 'Tarefa deletada com sucesso!',
      };
    } catch (error) {
      throw new HttpException('Tarefa não encontrada!', HttpStatus.NOT_FOUND);
    }
  }
}
