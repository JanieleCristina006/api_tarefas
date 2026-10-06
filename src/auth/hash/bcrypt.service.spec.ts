import { BcryptService } from './bcrypt.service';

describe('BcryptService', () => {
  let bcryptService: BcryptService;

  beforeEach(() => {
    bcryptService = new BcryptService();
  });

  it('should hash a password', async () => {
    const passwordHash = await bcryptService.hash('123456');

    expect(passwordHash).not.toBe('123456');
    expect(passwordHash).toEqual(expect.any(String));
  });

  it('should compare a password with its hash', async () => {
    const passwordHash = await bcryptService.hash('123456');

    await expect(bcryptService.compare('123456', passwordHash)).resolves.toBe(
      true,
    );
    await expect(bcryptService.compare('invalid', passwordHash)).resolves.toBe(
      false,
    );
  });
});
