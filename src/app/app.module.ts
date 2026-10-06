import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { LoggerMiddleware } from '../common/middlewares/logger.middleware';
import { APP_GUARD } from '@nestjs/core';
import { AuthAdminGuard } from '../common/guards/admin.guard';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TasksModule,
    UsersModule,
    AuthModule,
     ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'files'),
      serveRoot: '/files',
    }),
  ],

  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthAdminGuard
    // }

  ],
  // Provider cria, Export compartilha, Import consome.
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer.apply(LoggerMiddleware)
      .forRoutes({
        path: "*",
        method: RequestMethod.ALL
      })
  }
}


// 1. Criar o service em providers
// ↓
// 2. Compartilhar em exports
// ↓
// 3. Importar o módulo em imports
// ↓
// 4. Injetar o service no constructor
