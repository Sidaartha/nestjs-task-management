import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './tasks-status.enum';
import { FilterTaskDto } from './dto/filter-tasks.dto';
import { User } from 'src/auth/user.entity';

@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {
  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.save(task);
    return task;
  }

  async getTasks(filterDto: FilterTaskDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.createQueryBuilder('task');
    query.where({ user });

    if (status) {
      query.andWhere('task.status = :s', { s: status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:s) OR LOWER(task.description) LIKE LOWER(:s))',
        {
          s: `%${search}%`,
        },
      );
    }

    const tasks = await query.getMany();
    return tasks;
  }
}
