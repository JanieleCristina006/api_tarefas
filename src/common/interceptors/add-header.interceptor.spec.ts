import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { AddHeaderInterceptor } from './add-header.interceptor';

describe('AddHeaderInterceptor', () => {
  let interceptor: AddHeaderInterceptor;

  beforeEach(() => {
    interceptor = new AddHeaderInterceptor();
  });

  it('should add the custom header and continue the request', () => {
    const response = {
      setHeader: jest.fn(),
    };
    const context = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as ExecutionContext;
    const stream = of('ok');
    const next = {
      handle: jest.fn().mockReturnValue(stream),
    } as CallHandler;

    const result = interceptor.intercept(context, next);

    expect(result).toBe(stream);
    expect(response.setHeader).toHaveBeenCalledWith(
      'X-Custom',
      'Valor chave 123',
    );
    expect(next.handle).toHaveBeenCalledTimes(1);
  });
});
