import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import jwtConfig from './config/jwt.config';
import { HashingServiceProtocol } from './hash/hash.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

type MockPrismaService = {
  user: {
    findFirst: jest.Mock;
  };
};

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: MockPrismaService;
  let hashingService: jest.Mocked<HashingServiceProtocol>;
  let jwtService: jest.Mocked<JwtService>;

  const jwtConfiguration = {
    secret: 'secret_test',
    audience: 'audience_test',
    issuer: 'issuer_test',
    jwtTtl: '1h',
  };

  const signInDto: SignInDto = {
    email: 'janiele@teste.com',
    password: '123456',
  };

  const userFromDatabase = {
    id: 1,
    name: 'janiele',
    email: signInDto.email,
    passwordHash: 'password_hash',
    avatar: '1.png',
    active: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: HashingServiceProtocol,
          useValue: {
            hash: jest.fn(),
            compare: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: jwtConfiguration,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<MockPrismaService>(PrismaService);
    hashingService = module.get<jest.Mocked<HashingServiceProtocol>>(
      HashingServiceProtocol,
    );
    jwtService = module.get<jest.Mocked<JwtService>>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should authenticate an active user and return a token', async () => {
    prismaService.user.findFirst.mockResolvedValue(userFromDatabase);
    hashingService.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('token_mock');

    const result = await authService.authenticate(signInDto);

    expect(result).toEqual({
      id: userFromDatabase.id,
      name: userFromDatabase.name,
      avatar: userFromDatabase.avatar,
      email: userFromDatabase.email,
      token: 'token_mock',
    });
    expect(prismaService.user.findFirst).toHaveBeenCalledWith({
      where: {
        email: signInDto.email,
        active: true,
      },
    });
    expect(hashingService.compare).toHaveBeenCalledWith(
      signInDto.password,
      userFromDatabase.passwordHash,
    );
    expect(jwtService.sign).toHaveBeenCalledWith(
      {
        sub: userFromDatabase.id,
        email: userFromDatabase.email,
      },
      {
        secret: jwtConfiguration.secret,
        expiresIn: jwtConfiguration.jwtTtl,
        audience: jwtConfiguration.audience,
        issuer: jwtConfiguration.issuer,
      },
    );
  });

  it('should throw when the user is not found', async () => {
    prismaService.user.findFirst.mockResolvedValue(null);

    await expect(authService.authenticate(signInDto)).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
    expect(hashingService.compare).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('should throw when the password is invalid', async () => {
    prismaService.user.findFirst.mockResolvedValue(userFromDatabase);
    hashingService.compare.mockResolvedValue(false);

    await expect(authService.authenticate(signInDto)).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
