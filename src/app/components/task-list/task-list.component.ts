import { Component, input, output } from '@angular/core';
import { Task, TaskStatus } from '../../models/task.model';
import { Бараш } from '../../utils/barash';
import { Лосяш } from '../../utils/losyash';

@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent {
  readonly tasks = input.required<Task[]>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly emptyMessage = input('Задач пока нет');
  readonly updatingIds = input<ReadonlySet<number>>(new Set());
  readonly statusErrors = input<Readonly<Record<number, string>>>({});

  readonly retry = output<void>();
  readonly advance = output<Task>();

  statusLabel(status: TaskStatus): string {
    return Бараш.label(status);
  }

  formatDate(iso: string): string {
    return Лосяш.formatDate(iso);
  }

  canAdvance(task: Task): boolean {
    return Бараш.canAdvance(task.status);
  }

  actionLabel(task: Task): string {
    return Бараш.actionLabel(task.status) ?? '';
  }

  isUpdating(taskId: number): boolean {
    return this.updatingIds().has(taskId);
  }

  statusError(taskId: number): string | null {
    return this.statusErrors()[taskId] ?? null;
  }
}
