import { ValidationPipe } from '@nestjs/common';

const mockSwaggerConfig = {
  title: 'Lista de tarefas',
};
const mockSwaggerDocument = {
  openapi: '3.0.0',
};
const mockDocumentBuilder = {
  setTitle: jest.fn().mockReturnThis(),
  setDescription: jest.fn().mockReturnThis(),
  addBearerAuth: jest.fn().mockReturnThis(),
  addTag: jest.fn().mockReturnThis(),
  setVersion: jest.fn().mockReturnThis(),
  build: jest.fn().mockReturnValue(mockSwaggerConfig),
};
const mockApp = {
  enableCors: jest.fn(),
  useGlobalPipes: jest.fn(),
  listen: jest.fn().mockResolvedValue(undefined),
};
const mockNestFactoryCreate = jest.fn().mockResolvedValue(mockApp);
const mockSwaggerCreateDocument = jest
  .fn()
  .mockReturnValue(mockSwaggerDocument);
const mockSwaggerSetup = jest.fn();

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: mockNestFactoryCreate,
  },
}));

jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockImplementation(() => mockDocumentBuilder),
  SwaggerModule: {
    createDocument: mockSwaggerCreateDocument,
    setup: mockSwaggerSetup,
  },
}));

jest.mock('./app/app.module', () => ({
  AppModule: class AppModule {},
}));

describe('main bootstrap', () => {
  const originalPort = process.env.PORT;

  afterAll(() => {
    process.env.PORT = originalPort;
  });

  it('should configure the app and start listening', async () => {
    delete process.env.PORT;

    require('./main');
    await Promise.resolve();
    await Promise.resolve();

    expect(mockNestFactoryCreate).toHaveBeenCalledTimes(1);
    expect(mockApp.enableCors).toHaveBeenCalledTimes(1);
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.any(ValidationPipe),
    );
    expect(mockDocumentBuilder.setTitle).toHaveBeenCalledWith(
      'Lista de tarefas',
    );
    expect(mockDocumentBuilder.setDescription).toHaveBeenCalledWith(
      'API para cadastro de usuários, autenticação JWT, upload de avatar e gerenciamento de tarefas.',
    );
    expect(mockDocumentBuilder.addBearerAuth).toHaveBeenCalledTimes(1);
    expect(mockDocumentBuilder.addTag).toHaveBeenCalledWith(
      'App',
      'Rotas básicas da aplicação',
    );
    expect(mockDocumentBuilder.addTag).toHaveBeenCalledWith(
      'Auth',
      'Autenticação e emissão de token JWT',
    );
    expect(mockDocumentBuilder.addTag).toHaveBeenCalledWith(
      'Users',
      'Cadastro, consulta, atualização e exclusão de usuários',
    );
    expect(mockDocumentBuilder.addTag).toHaveBeenCalledWith(
      'Tasks',
      'Criação, consulta, atualização e exclusão de tarefas',
    );
    expect(mockDocumentBuilder.setVersion).toHaveBeenCalledWith('1.0');
    expect(mockSwaggerSetup).toHaveBeenCalledWith(
      'docs',
      mockApp,
      expect.any(Function),
    );

    const documentFactory = mockSwaggerSetup.mock.calls[0][2];
    expect(documentFactory()).toBe(mockSwaggerDocument);
    expect(mockSwaggerCreateDocument).toHaveBeenCalledWith(
      mockApp,
      mockSwaggerConfig,
    );
    expect(mockApp.listen).toHaveBeenCalledWith(3000);
  });
});
