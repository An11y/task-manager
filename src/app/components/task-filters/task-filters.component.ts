import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { StatusFilter } from '../../models/task.model';
import { Бараш } from '../../utils/barash';

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './task-filters.component.html',
  styleUrl: './task-filters.component.scss',
})
export class TaskFiltersComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly status = input.required<StatusFilter>();
  readonly search = input<string>('');

  readonly statusChange = output<StatusFilter>();
  readonly searchChange = output<string>();

  readonly filterOptions = Бараш.filterOptions;
  readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    effect(() => {
      const next = this.search();
      untracked(() => {
        if (this.searchControl.value !== next) {
          this.searchControl.setValue(next, { emitEvent: false });
        }
      });
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(350),
        map((value) => value.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => this.searchChange.emit(value));
  }

  onStatusClick(value: StatusFilter): void {
    if (value !== this.status()) {
      this.statusChange.emit(value);
    }
  }
}
