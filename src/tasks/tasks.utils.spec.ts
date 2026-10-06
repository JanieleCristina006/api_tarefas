import { TaskUtils } from './tasks.utils';

describe('TaskUtils', () => {
  let taskUtils: TaskUtils;

  beforeEach(() => {
    taskUtils = new TaskUtils();
  });

  it('should split a string by spaces', () => {
    expect(taskUtils.splitString('estudar nestjs hoje')).toEqual([
      'estudar',
      'nestjs',
      'hoje',
    ]);
  });
});
