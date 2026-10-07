import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingServiceProtocol } from '../auth/hash/hash.service';
import { PayloadTokenDto } from '../auth/dto/payload-token.dto';
import { StorageService } from '../storage/storage.service';

import * as path from 'node:path';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
    private readonly storageService: StorageService,
  ) {}

  private getProtectedUserEmail() {
    return process.env.PROTECTED_USER_EMAIL;
  }

  private isProtectedUser(email: string) {
    const protectedUserEmail = this.getProtectedUserEmail();

    return (
      !!protectedUserEmail &&
      email.toLowerCase() === protectedUserEmail.toLowerCase()
    );
  }

  private throwIfProtectedUser(email: string, message: string) {
    if (this.isProtectedUser(email)) {
      throw new HttpException(message, HttpStatus.FORBIDDEN);
    }
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        Task: true,
      },
    });

    if (user) return user;

    throw new HttpException('Usuário não encontrado!', HttpStatus.BAD_REQUEST);
  }

  async createUser(data: createUserDto) {
    const passwordHash = await this.hashingService.hash(data.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      if (user) return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Falha ao cadastrar usuário!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateUser(
    id: number,
    data: UpdateUserDto,
    tokenPayload: PayloadTokenDto,
  ) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: id,
        },
      });

      if (!user) {
        throw new HttpException(
          'Usuário não encontrado!',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (user.id !== tokenPayload.sub) {
        throw new HttpException('Acesso negado!', HttpStatus.BAD_REQUEST);
      }

      this.throwIfProtectedUser(
        user.email,
        'Esta conta nao pode ser modificada!',
      );

      const dataUser: { name?: string; passwordHash?: string } = {
        name: data.name ? data.name : user.name,
      };

      if (data?.password) {
        const passwordHash = await this.hashingService.hash(data?.password);
        dataUser.passwordHash = passwordHash;
      }

      const updateUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: dataUser.name,
          passwordHash: dataUser?.passwordHash
            ? dataUser.passwordHash
            : user.passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return updateUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Falha ao atualizar usuário!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteUser(id: number, tokenPayload: PayloadTokenDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: id,
        },
      });

      if (!user) {
        throw new HttpException(
          'Usuário não encontrado!',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (user.id !== tokenPayload.sub) {
        throw new HttpException('Acesso negado!', HttpStatus.BAD_REQUEST);
      }

      this.throwIfProtectedUser(
        user.email,
        'Esta conta nao pode ser deletada!',
      );

      await this.prisma.user.delete({
        where: {
          id: user.id,
        },
      });

      return {
        message: 'Usuário deletado com sucesso!',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Falha ao deletar usuário!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadAvatarImage(
    tokenPayload: PayloadTokenDto,
    file: Express.Multer.File,
  ) {
    try {
      this.throwIfProtectedUser(
        tokenPayload.email,
        'Esta conta nao pode ser modificada!',
      );

      const fileExtension = path
        .extname(file.originalname)
        .toLowerCase()
        .substring(1);

      const avatarKey = `avatars/${tokenPayload.sub}.${fileExtension}`;

      const user = await this.prisma.user.findFirst({
        where: {
          id: tokenPayload.sub,
        },
      });

      if (!user) {
        throw new HttpException(
          'Usuário não encontrado!',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.storageService.uploadFile({
        key: avatarKey,
        body: file.buffer,
        contentType: file.mimetype,
      });
      const avatarUrl = this.storageService.getPublicUrl(avatarKey);

      const updatedUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          avatar: avatarUrl,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Falha ao atualizar o avatar do usuário!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
