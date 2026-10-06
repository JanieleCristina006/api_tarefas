import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth/auth.module';
import { HashingServiceProtocol } from '../auth/hash/hash.service';
import { UsersController } from './users.controller';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

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

describe('UsersModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule, UsersModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should compile the module with auth dependencies', () => {
    expect(module).toBeDefined();
    expect(module.get<UsersController>(UsersController)).toBeDefined();
    expect(module.get<UsersService>(UsersService)).toBeDefined();
    expect(
      module.get<HashingServiceProtocol>(HashingServiceProtocol),
    ).toBeDefined();
  });
});
