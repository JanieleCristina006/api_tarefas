import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { PayloadTokenDto } from '../auth/dto/payload-token.dto';
import { HashingServiceProtocol } from '../auth/hash/hash.service';
import { PrismaService } from '../prisma/prisma.service';
import { createUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

jest.mock('node:fs/promises', () => ({
  writeFile: jest.fn(),
}));

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

type MockPrismaService = {
  user: {
    create: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe('UsersService', () => {
  let userService: UsersService;
  let prismaService: MockPrismaService;
  let hashingService: jest.Mocked<HashingServiceProtocol>;
  let writeFileMock: jest.MockedFunction<typeof fs.writeFile>;
  const originalProtectedUserEmail = process.env.PROTECTED_USER_EMAIL;

  const tokenPayload: PayloadTokenDto = {
    sub: 1,
    email: 'janiele@teste.com',
    iat: 0,
    exp: 0,
    aud: 'test',
    iss: 'test',
  };

  const userFromDatabase = {
    id: 1,
    name: 'janiele',
    email: 'janiele@teste.com',
    passwordHash: 'old_hash',
  };

  const protectedTokenPayload: PayloadTokenDto = {
    ...tokenPayload,
    email: 'protegido@email.com',
  };

  const protectedUserFromDatabase = {
    ...userFromDatabase,
    name: 'Usuario Protegido',
    email: 'protegido@email.com',
  };

  beforeEach(async () => {
    process.env.PROTECTED_USER_EMAIL = 'protegido@email.com';
    writeFileMock = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>;
    writeFileMock.mockResolvedValue();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
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
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    prismaService = module.get<MockPrismaService>(PrismaService);
    hashingService = module.get<jest.Mocked<HashingServiceProtocol>>(
      HashingServiceProtocol,
    );
  });

  afterEach(() => {
    if (originalProtectedUserEmail === undefined) {
      delete process.env.PROTECTED_USER_EMAIL;
    } else {
      process.env.PROTECTED_USER_EMAIL = originalProtectedUserEmail;
    }

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = {
        id: 1,
        name: 'janiele',
        email: 'janiele@teste.com',
        Task: [],
      };

      prismaService.user.findFirst.mockResolvedValue(user);

      const result = await userService.findOne(1);

      expect(result).toEqual(user);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        select: {
          id: true,
          name: true,
          email: true,
          Task: true,
        },
      });
    });

    it('should throw when the user does not exist', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(userService.findOne(1)).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto: createUserDto = {
        email: 'janiele@teste.com',
        name: 'janiele',
        password: '123456',
      };
      const createdUser = {
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
      };

      hashingService.hash.mockResolvedValue('Hash_mock_exemplo');
      prismaService.user.create.mockResolvedValue(createdUser);

      const result = await userService.createUser(createUserDto);

      expect(result).toEqual(createdUser);
      expect(hashingService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          passwordHash: 'Hash_mock_exemplo',
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    });

    it('should throw when prisma fails to create the user', async () => {
      const createUserDto: createUserDto = {
        email: 'janiele@teste.com',
        name: 'janiele',
        password: '123456',
      };

      hashingService.hash.mockResolvedValue('Hash_mock_exemplo');
      prismaService.user.create.mockRejectedValue(new Error('database error'));

      await expect(userService.createUser(createUserDto)).rejects.toMatchObject(
        {
          status: HttpStatus.BAD_REQUEST,
        },
      );
    });
  });

  describe('updateUser', () => {
    it('should update the name and keep the current password when no password is provided', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Janiele Silva',
      };
      const updatedUser = {
        id: 1,
        name: 'Janiele Silva',
        email: 'janiele@teste.com',
      };

      prismaService.user.findFirst.mockResolvedValue(userFromDatabase);
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(
        1,
        updateUserDto,
        tokenPayload,
      );

      expect(result).toEqual(updatedUser);
      expect(hashingService.hash).not.toHaveBeenCalled();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: {
          id: userFromDatabase.id,
        },
        data: {
          name: updateUserDto.name,
          passwordHash: userFromDatabase.passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    });

    it('should update the password when a new password is provided', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Janiele Silva',
        password: '1234567',
      };
      const updatedUser = {
        id: 1,
        name: 'Janiele Silva',
        email: 'janiele@teste.com',
      };

      prismaService.user.findFirst.mockResolvedValue(userFromDatabase);
      prismaService.user.update.mockResolvedValue(updatedUser);
      hashingService.hash.mockResolvedValue('new_hash');

      const result = await userService.updateUser(
        1,
        updateUserDto,
        tokenPayload,
      );

      expect(result).toEqual(updatedUser);
      expect(hashingService.hash).toHaveBeenCalledWith(updateUserDto.password);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: {
          id: userFromDatabase.id,
        },
        data: {
          name: updateUserDto.name,
          passwordHash: 'new_hash',
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    });

    it('should throw when the user is not found', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        userService.updateUser(1, { name: 'Janiele Silva' }, tokenPayload),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw when the token user is different from the updated user', async () => {
      prismaService.user.findFirst.mockResolvedValue(userFromDatabase);

      await expect(
        userService.updateUser(
          1,
          { name: 'Janiele Silva' },
          {
            ...tokenPayload,
            sub: 2,
          },
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw when trying to update the protected user', async () => {
      prismaService.user.findFirst.mockResolvedValue(protectedUserFromDatabase);

      await expect(
        userService.updateUser(
          1,
          { name: 'Outro Nome', password: '1234567' },
          protectedTokenPayload,
        ),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
      expect(hashingService.hash).not.toHaveBeenCalled();
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete the user and return a success message', async () => {
      prismaService.user.findFirst.mockResolvedValue(userFromDatabase);
      prismaService.user.delete.mockResolvedValue(userFromDatabase);

      const result = await userService.deleteUser(1, tokenPayload);

      expect(result).toEqual({
        message: 'Usuário deletado com sucesso!',
      });
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: {
          id: userFromDatabase.id,
        },
      });
    });

    it('should throw when the user is not found', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        userService.deleteUser(1, tokenPayload),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
      expect(prismaService.user.delete).not.toHaveBeenCalled();
    });

    it('should throw when the token user is different from the deleted user', async () => {
      prismaService.user.findFirst.mockResolvedValue(userFromDatabase);

      await expect(
        userService.deleteUser(1, {
          ...tokenPayload,
          sub: 2,
        }),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
      expect(prismaService.user.delete).not.toHaveBeenCalled();
    });

    it('should throw when trying to delete the protected user', async () => {
      prismaService.user.findFirst.mockResolvedValue(protectedUserFromDatabase);

      await expect(
        userService.deleteUser(1, protectedTokenPayload),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
      expect(prismaService.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('uploadAvatarImage', () => {
    it('should save the avatar image and update the user avatar', async () => {
      const file = {
        originalname: 'avatar.PNG',
        buffer: Buffer.from('image'),
      } as Express.Multer.File;
      const updatedUser = {
        id: 1,
        name: 'janiele',
        email: 'janiele@teste.com',
        avatar: '1.png',
      };

      prismaService.user.findFirst.mockResolvedValue(userFromDatabase);
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await userService.uploadAvatarImage(tokenPayload, file);

      expect(result).toEqual(updatedUser);
      expect(writeFileMock).toHaveBeenCalledWith(
        path.resolve(process.cwd(), 'files', '1.png'),
        file.buffer,
      );
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: tokenPayload.sub,
        },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: {
          id: userFromDatabase.id,
        },
        data: {
          avatar: '1.png',
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      });
    });

    it('should throw when the avatar cannot be saved', async () => {
      const file = {
        originalname: 'avatar.png',
        buffer: Buffer.from('image'),
      } as Express.Multer.File;

      writeFileMock.mockRejectedValue(new Error('file error'));

      await expect(
        userService.uploadAvatarImage(tokenPayload, file),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
      expect(prismaService.user.findFirst).not.toHaveBeenCalled();
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw when the user is not found after saving the avatar', async () => {
      const file = {
        originalname: 'avatar.png',
        buffer: Buffer.from('image'),
      } as Express.Multer.File;

      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        userService.uploadAvatarImage(tokenPayload, file),
      ).rejects.toMatchObject({
        status: HttpStatus.BAD_REQUEST,
      });
      expect(writeFileMock).toHaveBeenCalledWith(
        path.resolve(process.cwd(), 'files', '1.png'),
        file.buffer,
      );
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw before saving the avatar when the authenticated user is protected', async () => {
      const file = {
        originalname: 'avatar.png',
        buffer: Buffer.from('image'),
      } as Express.Multer.File;

      await expect(
        userService.uploadAvatarImage(protectedTokenPayload, file),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
      expect(writeFileMock).not.toHaveBeenCalled();
      expect(prismaService.user.findFirst).not.toHaveBeenCalled();
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });
  });
});
