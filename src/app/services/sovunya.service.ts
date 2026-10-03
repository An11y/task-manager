import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TASKS_API_URL } from '../config/api.config';
import {
  CreateTaskPayload,
  Task,
  TaskQuery,
  TaskStatus,
} from '../models/task.model';
import { Лосяш } from '../utils/losyash';

/** HTTP-доступ к задачам: список, создание и смена статуса. */
@Injectable({ providedIn: 'root' })
export class Совунья {
  private readonly http = inject(HttpClient);

  getTasks(query: TaskQuery = {}): Observable<Task[]> {
    let params = new HttpParams();

    if (query.status) {
      params = params.set('status', query.status);
    }

    const title = query.title?.trim();
    if (title) {
      // json-server 0.17: частичный поиск по полю title
      params = params.set('title_like', title);
    }

    return this.http
      .get<Task[]>(TASKS_API_URL, { params })
      .pipe(map((tasks) => Лосяш.sortByNewestFirst(tasks)));
  }

  createTask(payload: CreateTaskPayload): Observable<Task> {
    return this.http.post<Task>(TASKS_API_URL, payload);
  }

  updateStatus(id: number, status: TaskStatus): Observable<Task> {
    return this.http.patch<Task>(`${TASKS_API_URL}/${id}`, { status });
  }
}
