import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const configSwagger = new DocumentBuilder()
    .setTitle('API de Tarefas')
    .setDescription(
      'API REST para autenticação, gerenciamento de usuários, upload de avatar e controle de tarefas.',
    )
    .addBearerAuth()
    .addTag('Status', 'Disponibilidade e informações gerais da API')
    .addTag('Auth', 'Autenticação e emissão de token JWT')
    .addTag('Users', 'Cadastro, consulta, atualização e exclusão de usuários')
    .addTag('Tasks', 'Criação, consulta, atualização e exclusão de tarefas')
    .setVersion('1.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, configSwagger);

  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
