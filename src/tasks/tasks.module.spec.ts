import { Test, TestingModule } from '@nestjs/testing';
import { TaskUtils } from './tasks.utils';
import { TasksController } from './tasks.controller';
import { TasksModule } from './tasks.module';
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

describe('TasksModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TasksModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide the tasks controller, service and utils', () => {
    expect(module.get<TasksController>(TasksController)).toBeDefined();
    expect(module.get<TasksService>(TasksService)).toBeDefined();
    expect(module.get<TaskUtils>(TaskUtils)).toBeDefined();
  });
});
