import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ApiExceptionFilter } from './exception-filter';

describe('ApiExceptionFilter', () => {
  let filter: ApiExceptionFilter;
  let response: {
    status: jest.Mock;
    json: jest.Mock;
  };

  const createHost = (url = '/tasks') =>
    ({
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({
          url,
        }),
      }),
    }) as ArgumentsHost;

  beforeEach(() => {
    filter = new ApiExceptionFilter();
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should format an http exception response', () => {
    const exception = new HttpException(
      'Erro de teste',
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, createHost('/users'));

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      message: 'Erro de teste',
      path: '/users',
    });
  });

  it('should use the fallback message when the exception response is empty', () => {
    const exception = new HttpException('', HttpStatus.BAD_REQUEST);

    filter.catch(exception, createHost());

    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      message: 'Erro ao realizar operação',
      path: '/tasks',
    });
  });
});
