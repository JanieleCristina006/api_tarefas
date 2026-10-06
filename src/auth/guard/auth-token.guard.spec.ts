import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { REQUEST_TOKEN_PAYLOAD_NAME } from '../common/auth.constants';
import jwtConfig from '../config/jwt.config';
import { AuthTokenGuard } from './auth-token.guard';

jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

type MockPrismaService = {
  user: {
    findFirst: jest.Mock;
  };
};

describe('AuthTokenGuard', () => {
  let guard: AuthTokenGuard;
  let prismaService: MockPrismaService;
  let jwtService: jest.Mocked<JwtService>;

  const jwtConfiguration = {
    secret: 'secret_test',
    audience: 'audience_test',
    issuer: 'issuer_test',
    jwtTtl: '1h',
  };

  const payload = {
    sub: 1,
    email: 'janiele@teste.com',
  };

  const createExecutionContext = (request: Partial<Request>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokenGuard,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: jwtConfiguration,
        },
      ],
    }).compile();

    guard = module.get<AuthTokenGuard>(AuthTokenGuard);
    prismaService = module.get<MockPrismaService>(PrismaService);
    jwtService = module.get<jest.Mocked<JwtService>>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extract the bearer token from the authorization header', () => {
    const request = {
      headers: {
        authorization: 'Bearer token_mock',
      },
    } as Request;

    expect(guard.extractTokenHeader(request)).toBe('token_mock');
  });

  it('should return undefined when the authorization header is missing', () => {
    const request = {
      headers: {},
    } as Request;

    expect(guard.extractTokenHeader(request)).toBeUndefined();
  });

  it('should activate the request when the token is valid and the user is active', async () => {
    const request = {
      headers: {
        authorization: 'Bearer token_mock',
      },
    } as Partial<Request>;

    jwtService.verifyAsync.mockResolvedValue(payload);
    prismaService.user.findFirst.mockResolvedValue({
      id: payload.sub,
      active: true,
    });

    const result = await guard.canActivate(createExecutionContext(request));

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      'token_mock',
      jwtConfiguration,
    );
    expect(request[REQUEST_TOKEN_PAYLOAD_NAME]).toEqual(payload);
    expect(prismaService.user.findFirst).toHaveBeenCalledWith({
      where: {
        id: payload.sub,
      },
    });
  });

  it('should throw when the token is missing', async () => {
    const request = {
      headers: {},
    } as Partial<Request>;

    await expect(
      guard.canActivate(createExecutionContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should throw when the token is invalid', async () => {
    const request = {
      headers: {
        authorization: 'Bearer token_mock',
      },
    } as Partial<Request>;

    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(
      guard.canActivate(createExecutionContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prismaService.user.findFirst).not.toHaveBeenCalled();
  });

  it('should throw when the user is inactive', async () => {
    const request = {
      headers: {
        authorization: 'Bearer token_mock',
      },
    } as Partial<Request>;

    jwtService.verifyAsync.mockResolvedValue(payload);
    prismaService.user.findFirst.mockResolvedValue({
      id: payload.sub,
      active: false,
    });

    await expect(
      guard.canActivate(createExecutionContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
