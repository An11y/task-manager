import { Component, inject, input, output } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NewTaskDraft } from '../../models/task.model';
import { Лосяш } from '../../utils/losyash';
import { titleRequiredValidator } from '../../utils/validators';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly submitting = input(false);
  readonly error = input<string | null>(null);
  readonly success = input<string | null>(null);

  readonly create = output<NewTaskDraft>();

  readonly form = this.fb.nonNullable.group({
    title: ['', [titleRequiredValidator, Validators.maxLength(100)]],
    description: [''],
  });

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) {
      return;
    }

    const title = Лосяш.normalizeTitle(this.form.controls.title.value);
    const description = this.form.controls.description.value.trim();

    this.create.emit({
      title,
      ...(description ? { description } : {}),
    });
  }

  /** Вызывается родителем после успешного создания. */
  reset(): void {
    this.form.reset({ title: '', description: '' });
    this.form.markAsUntouched();
    this.form.markAsPristine();
  }

  setDisabled(disabled: boolean): void {
    if (disabled) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  titleError(): string | null {
    const control = this.form.controls.title;
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.errors['titleRequired']) {
      return 'Укажите название задачи';
    }
    if (control.errors['maxlength']) {
      return 'Название не длиннее 100 символов';
    }
    return null;
  }
}
