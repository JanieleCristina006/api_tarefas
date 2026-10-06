import { validate } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { DeleteTaskResponseDto, ResponseTaskDto } from './response-task-dto';
import { UpdateTaskDto } from './update-task.dto';

describe('Tasks DTOs', () => {
  it('should validate a valid create task dto', async () => {
    const dto = new CreateTaskDto();
    Object.assign(dto, {
      name: 'Estudar NestJS',
      description: 'Criar testes unitarios',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('should return validation errors for an invalid create task dto', async () => {
    const dto = new CreateTaskDto();
    Object.assign(dto, {
      name: 'N',
      description: '',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(2);
    expect(errors[0].property).toBe('name');
    expect(errors[1].property).toBe('description');
  });

  it('should validate a partial update task dto', async () => {
    const dto = new UpdateTaskDto();
    dto.completed = true;

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('should create task response dtos', () => {
    const responseDto = new ResponseTaskDto();
    Object.assign(responseDto, {
      id: 1,
      name: 'Estudar NestJS',
      description: 'Criar testes unitarios',
      completed: false,
      userId: 1,
    });

    const deleteResponseDto = new DeleteTaskResponseDto();
    deleteResponseDto.message = 'Tarefa deletada com sucesso!';

    expect(responseDto.id).toBe(1);
    expect(deleteResponseDto.message).toBe('Tarefa deletada com sucesso!');
  });
});
