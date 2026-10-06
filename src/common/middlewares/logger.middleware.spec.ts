import { Request, Response } from 'express';
import { LoggerMiddleware } from './logger.middleware';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;

  beforeEach(() => {
    middleware = new LoggerMiddleware();
  });

  it('should add the user token and admin role when authorization exists', () => {
    const request = {
      headers: {
        authorization: 'Bearer token_mock',
      },
    } as Request;
    const response = {} as Response;
    const next = jest.fn();

    middleware.use(request, response, next);

    expect(request['user']).toEqual({
      token: 'Bearer token_mock',
      role: 'admin',
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should only call next when authorization is missing', () => {
    const request = {
      headers: {},
    } as Request;
    const response = {} as Response;
    const next = jest.fn();

    middleware.use(request, response, next);

    expect(request['user']).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
