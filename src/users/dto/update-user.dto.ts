import { PartialType, PickType } from '@nestjs/swagger';

import { createUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  PickType(createUserDto, ['name', 'password'] as const),
) {}
