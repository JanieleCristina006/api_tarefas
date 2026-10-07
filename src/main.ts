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
      'API REST para autenticacao, gerenciamento de usuarios, upload de avatar e controle de tarefas.',
    )
    .addBearerAuth()
    .addTag('Status', 'Disponibilidade e informacoes gerais da API')
    .addTag('Auth', 'Autenticacao e emissao de token JWT')
    .addTag('Users', 'Cadastro, consulta, atualizacao e exclusao de usuarios')
    .addTag('Tasks', 'Criacao, consulta, atualizacao e exclusao de tarefas')
    .setVersion('1.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, configSwagger);

  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
