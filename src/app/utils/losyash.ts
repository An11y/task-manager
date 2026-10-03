import { StatusFilter, Task, TaskStatus } from '../models/task.model';

/** Форматирование дат и вспомогательные преобразования для UI. */
export class Лосяш {
  /**
   * Локальное время пользователя в виде ДД.ММ.ГГГГ ЧЧ:ММ
   * (как в ТЗ: 2026-10-01T09:30:00.000Z → 01.10.2026 12:30 в Москве).
   */
  static formatDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return iso;
    }

    const pad = (value: number): string => String(value).padStart(2, '0');

    return [
      `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`,
      `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    ].join(' ');
  }

  static normalizeTitle(value: string): string {
    return value.trim();
  }

  static sortByNewestFirst<T extends { createdAt: string }>(items: T[]): T[] {
    return [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /** Частичное совпадение, как `title_like` в json-server 0.17. */
  static matchesTitleSearch(title: string, search: string): boolean {
    const query = search.trim();
    if (!query) {
      return true;
    }
    return title.toLowerCase().includes(query.toLowerCase());
  }

  static matchesStatusFilter(status: TaskStatus, filter: StatusFilter): boolean {
    return filter === 'all' || filter === status;
  }

  static taskVisibleInList(
    task: Pick<Task, 'title' | 'status'>,
    statusFilter: StatusFilter,
    searchQuery: string
  ): boolean {
    return (
      this.matchesStatusFilter(task.status, statusFilter) &&
      this.matchesTitleSearch(task.title, searchQuery)
    );
  }

  static emptyListMessage(
    statusFilter: StatusFilter,
    searchQuery: string
  ): string {
    if (searchQuery.trim()) {
      return 'Нет задач с выбранными условиями';
    }
    if (statusFilter !== 'all') {
      return 'Нет задач с выбранным статусом';
    }
    return 'Задач пока нет';
  }
}
