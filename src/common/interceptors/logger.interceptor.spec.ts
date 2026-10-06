import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggerInterceptor } from './logger.interceptor';

describe('LoggerInterceptor', () => {
  let interceptor: LoggerInterceptor;

  beforeEach(() => {
    interceptor = new LoggerInterceptor();
  });

  it('should continue the request', () => {
    const context = {} as ExecutionContext;
    const stream = of('ok');
    const next = {
      handle: jest.fn().mockReturnValue(stream),
    } as CallHandler;

    const result = interceptor.intercept(context, next);

    expect(result).toBe(stream);
    expect(next.handle).toHaveBeenCalledTimes(1);
  });
});
