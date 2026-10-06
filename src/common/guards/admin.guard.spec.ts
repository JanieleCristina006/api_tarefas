import { ExecutionContext } from '@nestjs/common';
import { AuthAdminGuard } from './admin.guard';

describe('AuthAdminGuard', () => {
  let guard: AuthAdminGuard;

  const createExecutionContext = (request: Record<string, unknown>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as ExecutionContext;

  beforeEach(() => {
    guard = new AuthAdminGuard();
  });

  it('should allow admin users', () => {
    const request = {
      user: {
        role: 'admin',
      },
    };

    expect(guard.canActivate(createExecutionContext(request))).toBe(true);
  });

  it('should block non admin users', () => {
    const request = {
      user: {
        role: 'user',
      },
    };

    expect(guard.canActivate(createExecutionContext(request))).toBe(false);
  });

  it('should block requests without a user', () => {
    expect(guard.canActivate(createExecutionContext({}))).toBe(false);
  });
});
