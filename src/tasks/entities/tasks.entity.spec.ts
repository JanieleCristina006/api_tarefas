import { Tasks } from './tasks.entity';

describe('Tasks entity', () => {
  it('should create a task entity', () => {
    const task = new Tasks();
    task.id = 1;
    task.name = 'Estudar NestJS';
    task.description = 'Criar testes unitarios';
    task.completed = false;
    task.createdAt = new Date('2026-01-01T00:00:00.000Z');

    expect(task).toEqual({
      id: 1,
      name: 'Estudar NestJS',
      description: 'Criar testes unitarios',
      completed: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
  });
});
