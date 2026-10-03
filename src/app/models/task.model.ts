export type TaskStatus = 'new' | 'in_progress' | 'done';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
}

/** Данные из формы создания до обогащения status/createdAt. */
export interface NewTaskDraft {
  title: string;
  description?: string;
}

export interface TaskQuery {
  status?: TaskStatus | null;
  title?: string | null;
}

export type StatusFilter = TaskStatus | 'all';

export interface TaskListQuery {
  status: TaskStatus | null;
  title: string | null;
}
