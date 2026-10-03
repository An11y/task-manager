import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Subject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  finalize,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { TaskFiltersComponent } from '../../components/task-filters/task-filters.component';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import {
  NewTaskDraft,
  StatusFilter,
  Task,
  TaskListQuery,
} from '../../models/task.model';
import { Совунья } from '../../services/sovunya.service';
import { Бараш } from '../../utils/barash';
import { Лосяш } from '../../utils/losyash';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [TaskFormComponent, TaskFiltersComponent, TaskListComponent],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
})
export class TasksPageComponent implements OnInit {
  private readonly api = inject(Совунья);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly taskForm = viewChild.required(TaskFormComponent);

  readonly tasks = signal<Task[]>([]);
  readonly loading = signal(false);
  readonly listError = signal<string | null>(null);
  readonly createError = signal<string | null>(null);
  readonly createSuccess = signal<string | null>(null);
  readonly statusErrors = signal<Readonly<Record<number, string>>>({});
  readonly updatingIds = signal<ReadonlySet<number>>(new Set());
  readonly creating = signal(false);
  readonly statusFilter = signal<StatusFilter>('all');
  readonly searchQuery = signal('');

  private readonly reload$ = new Subject<void>();

  ngOnInit(): void {
    this.bindQueryParams();
    this.bindTaskLoading();
  }

  onStatusFilterChange(value: StatusFilter): void {
    this.createSuccess.set(null);
    this.patchQuery({ status: value === 'all' ? null : value });
  }

  onSearchChange(title: string): void {
    this.createSuccess.set(null);
    this.patchQuery({ title: title || null });
  }

  onCreate(draft: NewTaskDraft): void {
    if (this.creating()) {
      return;
    }

    const form = this.taskForm();
    this.creating.set(true);
    this.createError.set(null);
    this.createSuccess.set(null);
    form.setDisabled(true);

    this.api
      .createTask({
        ...draft,
        status: 'new',
        createdAt: new Date().toISOString(),
      })
      .pipe(
        finalize(() => {
          this.creating.set(false);
          form.setDisabled(false);
        })
      )
      .subscribe({
        next: (created) => {
          form.reset();
          this.handleCreatedTask(created);
        },
        error: () => {
          this.createError.set(
            'Не удалось создать задачу. Проверьте, что mock API запущен, и попробуйте снова.'
          );
        },
      });
  }

  onAdvanceStatus(task: Task): void {
    const next = Бараш.getNext(task.status);
    if (!next || this.updatingIds().has(task.id)) {
      return;
    }

    const previousStatus = task.status;
    const snapshot = this.tasks();
    const filterAtStart = this.statusFilter();
    const searchAtStart = this.searchQuery();

    this.clearStatusError(task.id);
    this.setUpdating(task.id, true);

    const optimistic: Task = { ...task, status: next };
    this.applyTaskToList(optimistic, filterAtStart, searchAtStart);

    this.api
      .updateStatus(task.id, next)
      .pipe(finalize(() => this.setUpdating(task.id, false)))
      .subscribe({
        next: (updated) => {
          this.applyTaskToList(
            updated,
            this.statusFilter(),
            this.searchQuery()
          );
        },
        error: () => {
          this.tasks.set(snapshot);
          this.setStatusError(
            task.id,
            `Не удалось перевести задачу из «${Бараш.label(previousStatus)}». Попробуйте ещё раз.`
          );
        },
      });
  }

  retryLoad(): void {
    this.reload$.next();
  }

  emptyListMessage(): string {
    return Лосяш.emptyListMessage(this.statusFilter(), this.searchQuery());
  }

  private handleCreatedTask(created: Task): void {
    const statusFilter = this.statusFilter();
    const search = this.searchQuery();

    if (Лосяш.taskVisibleInList(created, statusFilter, search)) {
      this.tasks.update((list) => Лосяш.sortByNewestFirst([created, ...list]));
      this.createSuccess.set('Задача создана.');
      return;
    }

    if (statusFilter !== 'all') {
      this.createSuccess.set(
        `Задача «${created.title}» создана со статусом «Новая». Сейчас выбран фильтр «${Бараш.label(statusFilter)}», поэтому в списке её нет.`
      );
      return;
    }

    this.createSuccess.set(
      `Задача «${created.title}» создана, но не попадает под текущий поиск и не показана в списке.`
    );
  }

  private applyTaskToList(
    task: Task,
    statusFilter: StatusFilter,
    search: string
  ): void {
    if (Лосяш.taskVisibleInList(task, statusFilter, search)) {
      this.tasks.update((list) => {
        const without = list.filter((item) => item.id !== task.id);
        return Лосяш.sortByNewestFirst([task, ...without]);
      });
      return;
    }

    this.tasks.update((list) => list.filter((item) => item.id !== task.id));
  }

  private bindQueryParams(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.statusFilter.set(Бараш.parseFilter(params.get('status')));
        this.searchQuery.set(params.get('title') ?? '');
      });
  }

  private bindTaskLoading(): void {
    const query$ = this.route.queryParamMap.pipe(
      map(
        (params): TaskListQuery => ({
          status: Бараш.toApiStatus(Бараш.parseFilter(params.get('status'))),
          title: params.get('title')?.trim() || null,
        })
      ),
      distinctUntilChanged(
        (a, b) => a.status === b.status && a.title === b.title
      )
    );

    combineLatest([query$, this.reload$.pipe(startWith(undefined))])
      .pipe(
        switchMap(([query]) => {
          this.loading.set(true);
          this.listError.set(null);

          return this.api.getTasks(query).pipe(
            catchError(() => {
              this.listError.set(
                'Не удалось загрузить задачи. Убедитесь, что mock API запущен на порту 3000.'
              );
              return of<Task[]>([]);
            }),
            finalize(() => this.loading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((tasks) => this.tasks.set(tasks));
  }

  private patchQuery(patch: {
    status?: string | null;
    title?: string | null;
  }): void {
    const current = this.route.snapshot.queryParamMap;
    const status =
      patch.status !== undefined ? patch.status : current.get('status');
    const title =
      patch.title !== undefined ? patch.title : current.get('title');

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: status || null,
        title: title || null,
      },
    });
  }

  private setUpdating(id: number, value: boolean): void {
    this.updatingIds.update((current) => {
      const next = new Set(current);
      if (value) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  private setStatusError(id: number, message: string): void {
    this.statusErrors.update((current) => ({ ...current, [id]: message }));
  }

  private clearStatusError(id: number): void {
    this.statusErrors.update((current) => {
      if (!(id in current)) {
        return current;
      }
      const next = { ...current };
      delete next[id];
      return next;
    });
  }
}
