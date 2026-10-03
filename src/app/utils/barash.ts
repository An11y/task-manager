import { StatusFilter, TaskStatus } from '../models/task.model';

/** Логика статусов и подписей: допустимые переходы и отображение. */
export class Бараш {
  static readonly labels: Record<TaskStatus, string> = {
    new: 'Новая',
    in_progress: 'В работе',
    done: 'Готово',
  };

  static readonly filterOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Все задачи' },
    { value: 'new', label: 'Новая' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'done', label: 'Готово' },
  ];

  static readonly nextStatus: Partial<Record<TaskStatus, TaskStatus>> = {
    new: 'in_progress',
    in_progress: 'done',
  };

  static readonly actionLabels: Partial<Record<TaskStatus, string>> = {
    new: 'Взять в работу',
    in_progress: 'Завершить',
  };

  static label(status: TaskStatus): string {
    return this.labels[status];
  }

  static getNext(status: TaskStatus): TaskStatus | null {
    return this.nextStatus[status] ?? null;
  }

  static actionLabel(status: TaskStatus): string | null {
    return this.actionLabels[status] ?? null;
  }

  static canAdvance(status: TaskStatus): boolean {
    return this.getNext(status) !== null;
  }

  static parseFilter(value: string | null | undefined): StatusFilter {
    if (value === 'new' || value === 'in_progress' || value === 'done') {
      return value;
    }
    return 'all';
  }

  static toApiStatus(filter: StatusFilter): TaskStatus | null {
    return filter === 'all' ? null : filter;
  }
}
