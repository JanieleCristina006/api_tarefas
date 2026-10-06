import { Test, TestingModule } from '@nestjs/testing';
import { PayloadTokenDto } from '../auth/dto/payload-token.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

jest.mock('../auth/guard/auth-token.guard', () => ({
  AuthTokenGuard: class AuthTokenGuard {
    canActivate() {
      return true;
    }
  },
}));

type MockTasksService = {
  findAll: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: MockTasksService;

  const tokenPayload: PayloadTokenDto = {
    sub: 1,
    email: 'janiele@teste.com',
    iat: 0,
    exp: 0,
    aud: 'test',
    iss: 'test',
  };

  const task = {
    id: 1,
    name: 'Estudar NestJS',
    description: 'Criar testes unitarios',
    completed: false,
    createAt: new Date('2026-01-01T00:00:00.000Z'),
    userId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    tasksController = module.get<TasksController>(TasksController);
    tasksService = module.get<MockTasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(tasksController).toBeDefined();
  });

  describe('findAllTasks', () => {
    it('should return all tasks', async () => {
      const paginationDto: PaginationDto = {
        limit: 10,
        offset: 0,
      };
      const tasks = [task];

      tasksService.findAll.mockResolvedValue(tasks);

      const result = await tasksController.findAllTasks(paginationDto);

      expect(result).toEqual(tasks);
      expect(tasksService.findAll).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('findOneTask', () => {
    it('should return one task by id', async () => {
      tasksService.findOne.mockResolvedValue(task);

      const result = await tasksController.findOneTask(1);

      expect(result).toEqual(task);
      expect(tasksService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const createTaskDto: CreateTaskDto = {
        name: 'Estudar NestJS',
        description: 'Criar testes unitarios',
      };

      tasksService.create.mockResolvedValue(task);

      const result = await tasksController.createTask(
        createTaskDto,
        tokenPayload,
      );

      expect(result).toEqual(task);
      expect(tasksService.create).toHaveBeenCalledWith(
        createTaskDto,
        tokenPayload,
      );
    });
  });

  describe('updatedTask', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        name: 'Estudar testes',
        description: 'Cobrir o modulo de tasks',
      };
      const updatedTask = {
        ...task,
        ...updateTaskDto,
      };

      tasksService.update.mockResolvedValue(updatedTask);

      const result = await tasksController.updatedTask(
        1,
        updateTaskDto,
        tokenPayload,
      );

      expect(result).toEqual(updatedTask);
      expect(tasksService.update).toHaveBeenCalledWith(
        1,
        updateTaskDto,
        tokenPayload,
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const deletedTaskResponse = {
        message: 'Tarefa deletada com sucesso!',
      };

      tasksService.delete.mockResolvedValue(deletedTaskResponse);

      const result = await tasksController.deleteTask(1, tokenPayload);

      expect(result).toEqual(deletedTaskResponse);
      expect(tasksService.delete).toHaveBeenCalledWith(1, tokenPayload);
    });
  });
});
