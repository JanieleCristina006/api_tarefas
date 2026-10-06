import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { HashingServiceProtocol } from './hash/hash.service';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide auth dependencies', () => {
    expect(module.get<AuthController>(AuthController)).toBeDefined();
    expect(module.get<AuthService>(AuthService)).toBeDefined();
    expect(
      module.get<HashingServiceProtocol>(HashingServiceProtocol),
    ).toBeDefined();
    expect(module.get<JwtService>(JwtService)).toBeDefined();
  });
});
