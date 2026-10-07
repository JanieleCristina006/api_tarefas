import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageService } from '../storage/storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, StorageService],
})
export class UsersModule {}
