import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { BodyCreateTaskInterceptor } from './body-create-task.interceptor';

describe('BodyCreateTaskInterceptor', () => {
  let interceptor: BodyCreateTaskInterceptor;

  beforeEach(() => {
    interceptor = new BodyCreateTaskInterceptor();
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
