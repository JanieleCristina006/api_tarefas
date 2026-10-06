import { validate } from 'class-validator';
import { ResponseAuthDto } from './response-auth.dto';
import { SignInDto } from './signin.dto';

describe('Auth DTOs', () => {
  it('should validate a valid sign in dto', async () => {
    const dto = new SignInDto();
    dto.email = 'janiele@teste.com';
    dto.password = '123456';

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('should return validation errors for an invalid sign in dto', async () => {
    const dto = new SignInDto();
    dto.email = 'invalid_email';
    dto.password = '';

    const errors = await validate(dto);

    expect(errors).toHaveLength(2);
    expect(errors[0].property).toBe('email');
    expect(errors[1].property).toBe('password');
  });

  it('should create a response auth dto', () => {
    const dto = new ResponseAuthDto();
    dto.id = 1;
    dto.name = 'janiele';
    dto.avatar = '1.png';
    dto.email = 'janiele@teste.com';
    dto.token = 'token_mock';

    expect(dto).toEqual({
      id: 1,
      name: 'janiele',
      avatar: '1.png',
      email: 'janiele@teste.com',
      token: 'token_mock',
    });
  });
});
