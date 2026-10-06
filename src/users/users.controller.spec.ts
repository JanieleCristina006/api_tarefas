import 'multer';
import { Test, TestingModule } from '@nestjs/testing';
import { PayloadTokenDto } from '../auth/dto/payload-token.dto';
import { UsersService } from './users.service';
import { createUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';

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

type MockUsersService = {
  findOne: jest.Mock;
  createUser: jest.Mock;
  updateUser: jest.Mock;
  deleteUser: jest.Mock;
  uploadAvatarImage: jest.Mock;
};

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: MockUsersService;

  const tokenPayload: PayloadTokenDto = {
    sub: 1,
    email: 'janiele@teste.com',
    iat: 0,
    exp: 0,
    aud: 'test',
    iss: 'test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            uploadAvatarImage: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<MockUsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('findOneUser', () => {
    it('should return one user by id', async () => {
      const user = {
        id: 1,
        name: 'janiele',
        email: 'janiele@teste.com',
        Task: [],
      };

      usersService.findOne.mockResolvedValue(user);

      const result = await usersController.findOneUser(1);

      expect(result).toEqual(user);
      expect(usersService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: createUserDto = {
        name: 'janiele',
        email: 'janiele@teste.com',
        password: '123456',
      };
      const createdUser = {
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
      };

      usersService.createUser.mockResolvedValue(createdUser);

      const result = await usersController.createUser(createUserDto);

      expect(result).toEqual(createdUser);
      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Janiele Silva',
        password: '1234567',
      };
      const updatedUser = {
        id: 1,
        name: updateUserDto.name,
        email: 'janiele@teste.com',
      };

      usersService.updateUser.mockResolvedValue(updatedUser);

      const result = await usersController.updateUser(
        1,
        updateUserDto,
        tokenPayload,
      );

      expect(result).toEqual(updatedUser);
      expect(usersService.updateUser).toHaveBeenCalledWith(
        1,
        updateUserDto,
        tokenPayload,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const deletedUserResponse = {
        message: 'Usuario deletado com sucesso!',
      };

      usersService.deleteUser.mockResolvedValue(deletedUserResponse);

      const result = await usersController.deleteUser(1, tokenPayload);

      expect(result).toEqual(deletedUserResponse);
      expect(usersService.deleteUser).toHaveBeenCalledWith(1, tokenPayload);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload the user avatar', async () => {
      const file = {
        originalname: 'avatar.png',
        buffer: Buffer.from('image'),
      } as Express.Multer.File;
      const updatedUser = {
        id: 1,
        name: 'janiele',
        email: 'janiele@teste.com',
        avatar: '1.png',
      };

      usersService.uploadAvatarImage.mockResolvedValue(updatedUser);

      const result = await usersController.uploadAvatar(tokenPayload, file);

      expect(result).toEqual(updatedUser);
      expect(usersService.uploadAvatarImage).toHaveBeenCalledWith(
        tokenPayload,
        file,
      );
    });
  });
});
