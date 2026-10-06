import 'reflect-metadata';
import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { REQUEST_TOKEN_PAYLOAD_NAME } from '../common/auth.constants';
import { TokenPayloadParam } from './token-payload.param';

describe('TokenPayloadParam', () => {
  it('should return the token payload from the request', () => {
    const payload = {
      sub: 1,
      email: 'janiele@teste.com',
    };

    class TestController {
      test(@TokenPayloadParam() _payload: unknown) {
        return undefined;
      }
    }

    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'test',
    );
    const paramMetadata = metadata[Object.keys(metadata)[0]];
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          [REQUEST_TOKEN_PAYLOAD_NAME]: payload,
        }),
      }),
    } as ExecutionContext;

    expect(paramMetadata.factory(undefined, context)).toEqual(payload);
  });
});
