import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PayloadTokenDto } from '../auth/dto/payload-token.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

type MockPrismaService = {
  task: {
    findMany: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let prismaService: MockPrismaService;

  const tokenPayload: PayloadTokenDto = {
    sub: 1,
    email: 'janiele@teste.com',
    iat: 0,
    exp: 0,
    aud: 'test',
    iss: 'test',
  };

  const taskFromDatabase = {
    id: 1,
    name: 'Estudar NestJS',
    description: 'Criar testes unitarios',
    completed: false,
    createAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    prismaService = module.get<MockPrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(tasksService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all tasks using the pagination values', async () => {
      const paginationDto: PaginationDto = {
        limit: 5,
        offset: 0,
      };
      const tasks = [taskFromDatabase];

      prismaService.task.findMany.mockResolvedValue(tasks);

      const result = await tasksService.findAll(paginationDto);

      expect(result).toEqual(tasks);
      expect(prismaService.task.findMany).toHaveBeenCalledWith({
        take: paginationDto.limit,
        skip: paginationDto.offset,
      });
    });

    it('should use default pagination values when none are provided', async () => {
      const tasks = [taskFromDatabase];

      prismaService.task.findMany.mockResolvedValue(tasks);

      const result = await tasksService.findAll({} as PaginationDto);

      expect(result).toEqual(tasks);
      expect(prismaService.task.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return one task by id', async () => {
      prismaService.task.findFirst.mockResolvedValue(taskFromDatabase);

      const result = await tasksService.findOne(1);

      expect(result).toEqual(taskFromDatabase);
      expect(prismaService.task.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
    });

    it('should throw when the task does not exist', async () => {
      prismaService.task.findFirst.mockResolvedValue(null);

      await expect(tasksService.findOne(1)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('create', () => {
    it('should create a task for the authenticated user', async () => {
      const createTaskDto: CreateTaskDto = {
        name: 'Estudar NestJS',
        description: 'Criar testes unitarios',
      };

      prismaService.task.create.mockResolvedValue(taskFromDatabase);

      const result = await tasksService.create(createTaskDto, tokenPayload);

      expect(result).toEqual(taskFromDatabase);
      expect(prismaService.task.create).toHaveBeenCalledWith({
        data: {
          name: createTaskDto.name,
          description: createTaskDto.description,
          userId: tokenPayload.sub,
        },
      });
    });

    it('should throw when prisma fails to create the task', async () => {
      const createTaskDto: CreateTaskDto = {
        name: 'Estudar NestJS',
        description: 'Criar testes unitarios',
      };

      prismaService.task.create.mockRejectedValue(new Error('database error'));

      await expect(
        tasksService.create(createTaskDto, tokenPayload),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('update', () => {
    it('should update a task when it belongs to the authenticated user', async () => {
      const updateTaskDto: UpdateTaskDto = {
        name: 'Estudar testes',
        description: 'Cobrir o modulo de tasks',
      };
      const updatedTask = {
        ...taskFromDatabase,
        ...updateTaskDto,
      };

      prismaService.task.findFirst.mockResolvedValue(taskFromDatabase);
      prismaService.task.update.mockResolvedValue(updatedTask);

      const result = await tasksService.update(1, updateTaskDto, tokenPayload);

      expect(result).toEqual(updatedTask);
      expect(prismaService.task.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
      expect(prismaService.task.update).toHaveBeenCalledWith({
        where: {
          id: taskFromDatabase.id,
        },
        data: {
          name: updateTaskDto.name,
          description: updateTaskDto.description,
          completed: taskFromDatabase.completed,
        },
      });
    });

    it('should update the completed status when it is provided', async () => {
      const updateTaskDto: UpdateTaskDto = {
        completed: true,
      };
      const updatedTask = {
        ...taskFromDatabase,
        completed: true,
      };

      prismaService.task.findFirst.mockResolvedValue(taskFromDatabase);
      prismaService.task.update.mockResolvedValue(updatedTask);

      const result = await tasksService.update(1, updateTaskDto, tokenPayload);

      expect(result).toEqual(updatedTask);
      expect(prismaService.task.update).toHaveBeenCalledWith({
        where: {
          id: taskFromDatabase.id,
        },
        data: {
          name: taskFromDatabase.name,
          description: taskFromDatabase.description,
          completed: true,
        },
      });
    });

    it('should keep the current task values when no values are provided', async () => {
      const updateTaskDto: UpdateTaskDto = {};

      prismaService.task.findFirst.mockResolvedValue(taskFromDatabase);
      prismaService.task.update.mockResolvedValue(taskFromDatabase);

      const result = await tasksService.update(1, updateTaskDto, tokenPayload);

      expect(result).toEqual(taskFromDatabase);
      expect(prismaService.task.update).toHaveBeenCalledWith({
        where: {
          id: taskFromDatabase.id,
        },
        data: {
          name: taskFromDatabase.name,
          description: taskFromDatabase.description,
          completed: taskFromDatabase.completed,
        },
      });
    });

    it('should throw when the task is not found', async () => {
      prismaService.task.findFirst.mockResolvedValue(null);

      await expect(
        tasksService.update(1, { name: 'Estudar testes' }, tokenPayload),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
      expect(prismaService.task.update).not.toHaveBeenCalled();
    });

    it('should throw when the task belongs to another user', async () => {
      prismaService.task.findFirst.mockResolvedValue({
        ...taskFromDatabase,
        userId: 2,
      });

      await expect(
        tasksService.update(1, { name: 'Estudar testes' }, tokenPayload),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
      expect(prismaService.task.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a task when it belongs to the authenticated user', async () => {
      prismaService.task.findFirst.mockResolvedValue(taskFromDatabase);
      prismaService.task.delete.mockResolvedValue(taskFromDatabase);

      const result = await tasksService.delete(1, tokenPayload);

      expect(result).toEqual({
        message: 'Tarefa deletada com sucesso!',
      });
      expect(prismaService.task.delete).toHaveBeenCalledWith({
        where: {
          id: taskFromDatabase.id,
        },
      });
    });

    it('should throw when the task is not found', async () => {
      prismaService.task.findFirst.mockResolvedValue(null);

      await expect(tasksService.delete(1, tokenPayload)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
      expect(prismaService.task.delete).not.toHaveBeenCalled();
    });

    it('should throw when the task belongs to another user', async () => {
      prismaService.task.findFirst.mockResolvedValue({
        ...taskFromDatabase,
        userId: 2,
      });

      await expect(tasksService.delete(1, tokenPayload)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
      expect(prismaService.task.delete).not.toHaveBeenCalled();
    });
  });
});
