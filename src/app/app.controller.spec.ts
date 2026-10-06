import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

type MockAppService = {
  getHello: jest.Mock;
};

describe('AppController', () => {
  let appController: AppController;
  let appService: MockAppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<MockAppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the hello message from the service', () => {
    appService.getHello.mockReturnValue('Hello World!');

    expect(appController.getHello()).toBe('Hello World!');
    expect(appService.getHello).toHaveBeenCalledTimes(1);
  });

  it('should return the test route message', () => {
    expect(appController.getTest()).toBe('Rota de teste');
  });
});
