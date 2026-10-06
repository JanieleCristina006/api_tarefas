import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

type MockAuthService = {
  authenticate: jest.Mock;
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: MockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            authenticate: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<MockAuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should authenticate a user', async () => {
    const signInDto: SignInDto = {
      email: 'janiele@teste.com',
      password: '123456',
    };
    const authResponse = {
      id: 1,
      name: 'janiele',
      avatar: '1.png',
      email: signInDto.email,
      token: 'token_mock',
    };

    authService.authenticate.mockResolvedValue(authResponse);

    const result = await authController.signIn(signInDto);

    expect(result).toEqual(authResponse);
    expect(authService.authenticate).toHaveBeenCalledWith(signInDto);
  });
});
