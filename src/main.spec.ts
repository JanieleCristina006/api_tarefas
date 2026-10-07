import { ValidationPipe } from '@nestjs/common';

const mockSwaggerConfig = {
  title: 'API de Tarefas',
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
      'API de Tarefas',
    );
    expect(mockDocumentBuilder.setDescription).toHaveBeenCalledWith(
      'API REST para autenticacao, gerenciamento de usuarios, upload de avatar e controle de tarefas.',
    );
    expect(mockDocumentBuilder.addBearerAuth).toHaveBeenCalledTimes(1);
    expect(mockDocumentBuilder.addTag).toHaveBeenCalledWith(
      'Status',
      'Disponibilidade e informacoes gerais da API',
    );
    expect(mockDocumentBuilder.addTag).toHaveBeenCalledWith(
      'Auth',
      'Autenticacao e emissao de token JWT',
    );
    expect(mockDocumentBuilder.addTag).toHaveBeenCalledWith(
      'Users',
      'Cadastro, consulta, atualizacao e exclusao de usuarios',
    );
    expect(mockDocumentBuilder.addTag).toHaveBeenCalledWith(
      'Tasks',
      'Criacao, consulta, atualizacao e exclusao de tarefas',
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
