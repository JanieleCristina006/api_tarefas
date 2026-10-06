import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationDto } from './pagination.dto';

describe('PaginationDto', () => {
  it('should transform and validate pagination values', async () => {
    const dto = plainToInstance(PaginationDto, {
      limit: '10',
      offset: '0',
    });

    expect(dto.limit).toBe(10);
    expect(dto.offset).toBe(0);
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('should return validation errors for invalid pagination values', async () => {
    const dto = plainToInstance(PaginationDto, {
      limit: '-1',
      offset: '-1',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(2);
    expect(errors[0].property).toBe('limit');
    expect(errors[1].property).toBe('offset');
  });
});
