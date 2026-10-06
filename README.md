# Primeiro App

API REST criada com NestJS, Prisma e SQLite para estudo de usuários, autenticação JWT, upload de avatar e gerenciamento de tarefas.

## Tecnologias

- Node.js
- NestJS 11
- TypeScript
- Prisma 7
- SQLite com `@prisma/adapter-better-sqlite3`
- JWT com `@nestjs/jwt`
- BcryptJS para hash de senhas
- Swagger com `@nestjs/swagger`
- Jest para testes unitários

## Funcionalidades

- Cadastro, consulta, atualização e remoção de usuários.
- Login com email e senha.
- Geração e validação de token JWT.
- Upload de avatar do usuário autenticado.
- CRUD de tarefas vinculadas ao usuário autenticado.
- Validação global de DTOs com `class-validator`.
- Documentação interativa com Swagger.
- Testes unitários para controllers, services, modules, DTOs, guards, interceptors, middleware, filtro, PrismaService e bootstrap.

## Estrutura do projeto

```text
src/
  app/              Módulo principal e rotas básicas
  auth/             Login, JWT, guard de token, hash de senha e payload do token
  common/           DTOs compartilhados, guards, filters, interceptors e middleware
  prisma/           PrismaService e PrismaModule
  tasks/            CRUD de tarefas
  users/            CRUD de usuários e upload de avatar
prisma/
  schema.prisma     Modelos User e Task
files/              Arquivos servidos publicamente em /files
```

## Pré-requisitos

- Node.js instalado
- npm instalado

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Crie ou ajuste o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
JWT_SECRET="sua_chave_secreta"
JW_TOKEN_AUDIENCE="http://localhost:3000"
JWT_TOKEN_ISSUER="http://localhost:3000"
JWT_TTL="30d"
```

Observação: a variável de audiência está como `JW_TOKEN_AUDIENCE` porque esse é o nome lido em `src/auth/config/jwt.config.ts`.

3. Gere o client do Prisma e aplique as migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

## Executando o projeto

```bash
# modo normal
npm run start

# modo watch
npm run start:dev

# modo debug
npm run start:debug

# produção
npm run build
npm run start:prod
```

Por padrão, a API sobe em:

```text
http://localhost:3000
```

A documentação Swagger fica em:

```text
http://localhost:3000/docs
```

## Scripts disponíveis

| Script                | Descrição                           |
| --------------------- | ----------------------------------- |
| `npm run start`       | Inicia a aplicação                  |
| `npm run start:dev`   | Inicia em modo watch                |
| `npm run start:debug` | Inicia em modo debug                |
| `npm run build`       | Gera os arquivos em `dist/`         |
| `npm run start:prod`  | Executa a build de produção         |
| `npm run seed:user`   | Cria ou atualiza um usuário inicial |
| `npm run format`      | Formata arquivos TypeScript         |
| `npm run test`        | Executa testes unitários            |
| `npm run test:watch`  | Executa testes em modo watch        |
| `npm run test:cov`    | Executa testes com cobertura        |
| `npm run test:e2e`    | Executa testes e2e                  |

## Autenticação

Rotas protegidas usam JWT no header:

```text
Authorization: Bearer jwt_token
```

O token é gerado em `POST /auth`. O guard valida o token e também verifica se o usuário está ativo.

## Banco de dados

O projeto usa SQLite via Prisma.

### User

| Campo          | Tipo        | Observação                     |
| -------------- | ----------- | ------------------------------ |
| `id`           | `Int`       | Chave primária autoincremental |
| `name`         | `String`    | Nome do usuário                |
| `email`        | `String`    | Email único                    |
| `passwordHash` | `String`    | Senha criptografada            |
| `createAt`     | `DateTime?` | Criado automaticamente         |
| `active`       | `Boolean`   | Padrão `true`                  |
| `avatar`       | `String?`   | Nome do arquivo de avatar      |
| `Task`         | `Task[]`    | Tarefas vinculadas ao usuário  |

### Task

| Campo         | Tipo        | Observação                              |
| ------------- | ----------- | --------------------------------------- |
| `id`          | `Int`       | Chave primária autoincremental          |
| `name`        | `String`    | Nome da tarefa                          |
| `description` | `String`    | Descrição da tarefa                     |
| `completed`   | `Boolean`   | Padrão `false`                          |
| `createAt`    | `DateTime?` | Criado automaticamente                  |
| `userId`      | `Int?`      | Usuário dono da tarefa                  |
| `user`        | `User?`     | Relação com usuário, com cascade delete |

## Rotas

### App

| Método | Rota     | Autenticação | Descrição               |
| ------ | -------- | ------------ | ----------------------- |
| `GET`  | `/`      | Não          | Retorna `Hello World!`  |
| `GET`  | `/teste` | Não          | Retorna `Rota de teste` |

### Auth

| Método | Rota    | Autenticação | Descrição                                  |
| ------ | ------- | ------------ | ------------------------------------------ |
| `POST` | `/auth` | Não          | Autentica o usuário e retorna um token JWT |

Body:

```json
{
  "email": "pedro@email.com",
  "password": "123456"
}
```

Retorno:

```json
{
  "id": 3,
  "name": "Pedro Henrique",
  "avatar": "3.png",
  "email": "pedro@email.com",
  "token": "jwt_token"
}
```

### Users

| Método   | Rota            | Autenticação | Descrição                                              |
| -------- | --------------- | ------------ | ------------------------------------------------------ |
| `POST`   | `/users`        | Não          | Cria um usuário                                        |
| `GET`    | `/users/:id`    | Não          | Busca um usuário por ID e retorna suas tarefas         |
| `PATCH`  | `/users/:id`    | Bearer token | Atualiza `name` e/ou `password` do usuário autenticado |
| `DELETE` | `/users/:id`    | Bearer token | Remove o usuário autenticado                           |
| `POST`   | `/users/upload` | Bearer token | Faz upload do avatar do usuário autenticado            |

Body para criar usuário:

```json
{
  "name": "Pedro Henrique",
  "email": "pedro@email.com",
  "password": "123456"
}
```

Retorno de `POST /users`:

```json
{
  "id": 3,
  "name": "Pedro Henrique",
  "email": "pedro@email.com"
}
```

Retorno de `GET /users/:id`:

```json
{
  "id": 3,
  "name": "Pedro Henrique",
  "email": "pedro@email.com",
  "Task": [
    {
      "id": 1,
      "name": "Estudar NestJS",
      "description": "Criar documentação da API com Swagger",
      "completed": false,
      "createAt": "2026-09-22T12:00:00.000Z",
      "userId": 3
    }
  ]
}
```

Body para atualizar usuário:

```json
{
  "name": "Pedro Henrique",
  "password": "novaSenha123"
}
```

Retorno de `PATCH /users/:id`:

```json
{
  "id": 3,
  "name": "Pedro Henrique",
  "email": "pedro@email.com"
}
```

Retorno de `DELETE /users/:id`:

```json
{
  "message": "Usuário deletado com sucesso!"
}
```

Upload de avatar:

- Campo do formulário: `file`
- Formatos aceitos: `jpg`, `jpeg`, `png`
- Tamanho máximo: `5MB`

Retorno de `POST /users/upload`:

```json
{
  "id": 3,
  "name": "Pedro Henrique",
  "email": "pedro@email.com",
  "avatar": "3.png"
}
```

As rotas de atualização, remoção e upload verificam se o `sub` do token JWT pertence ao usuário da operação.

### Tasks

| Método   | Rota                       | Autenticação | Descrição                                  |
| -------- | -------------------------- | ------------ | ------------------------------------------ |
| `GET`    | `/tasks?limit=10&offset=0` | Não          | Lista tarefas com paginação                |
| `GET`    | `/tasks/:id`               | Não          | Busca uma tarefa por ID                    |
| `POST`   | `/tasks`                   | Bearer token | Cria uma tarefa para o usuário autenticado |
| `PATCH`  | `/tasks/:id`               | Bearer token | Atualiza uma tarefa do usuário autenticado |
| `DELETE` | `/tasks/:id`               | Bearer token | Remove uma tarefa do usuário autenticado   |

Body para criar tarefa:

```json
{
  "name": "Estudar NestJS",
  "description": "Revisar controllers, services e modules"
}
```

Retorno de tarefa:

```json
{
  "id": 1,
  "name": "Estudar NestJS",
  "description": "Revisar controllers, services e modules",
  "completed": false,
  "createAt": "2026-09-22T12:00:00.000Z",
  "userId": 3
}
```

Body para atualizar tarefa:

```json
{
  "name": "Estudar Prisma",
  "description": "Revisar migrations e schema",
  "completed": true
}
```

Retorno de `DELETE /tasks/:id`:

```json
{
  "message": "Tarefa deletada com sucesso!"
}
```

Observação: ao criar uma tarefa, o `userId` vem do `sub` do token JWT. Por isso ele não deve ser enviado no body.

## Exemplos com cURL

Criar usuário:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Pedro Henrique\",\"email\":\"pedro@email.com\",\"password\":\"123456\"}"
```

Fazer login:

```bash
curl -X POST http://localhost:3000/auth \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"pedro@email.com\",\"password\":\"123456\"}"
```

Criar tarefa:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt_token" \
  -d "{\"name\":\"Estudar NestJS\",\"description\":\"Revisar controllers e services\"}"
```

Atualizar tarefa:

```bash
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jwt_token" \
  -d "{\"completed\":true}"
```

Upload de avatar:

```bash
curl -X POST http://localhost:3000/users/upload \
  -H "Authorization: Bearer jwt_token" \
  -F "file=@avatar.png"
```

## Validações

O projeto usa `ValidationPipe` global com `whitelist: true`, então propriedades que não existem nos DTOs são removidas automaticamente.

Principais validações:

- `name` de tarefa precisa ter no mínimo 5 caracteres.
- `description` de tarefa precisa ter no mínimo 5 caracteres.
- `completed` de tarefa precisa ser booleano quando enviado.
- `email` de usuário precisa ser válido.
- `password` de usuário precisa ter no mínimo 6 caracteres.
- `limit` da paginação deve ficar entre 0 e 50.
- `offset` da paginação deve ser maior ou igual a 0.

## Testes

```bash
# testes unitários
npm run test

# cobertura
npm run test:cov

# testes e2e
npm run test:e2e
```

Estado atual dos testes unitários:

```text
28 test suites
93 tests
```

## Observações de desenvolvimento

- O arquivo `dev.db` é o banco SQLite local usado em desenvolvimento.
- O client Prisma é gerado em `generated/prisma`.
- Senhas não são salvas em texto puro; o cadastro usa `BcryptService` para gerar `passwordHash`.
- Ao deletar um usuário, as tarefas relacionadas são removidas por cascade conforme o schema Prisma.
- Arquivos de avatar são salvos em `files/` e servidos publicamente em `/files`.
