import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TASKS_API_URL } from '../config/api.config';
import { Task } from '../models/task.model';
import { Совунья } from './sovunya.service';

describe('Совунья', () => {
  let service: Совунья;
  let httpMock: HttpTestingController;

  const sample: Task[] = [
    {
      id: 2,
      title: 'Старая',
      status: 'new',
      createdAt: '2026-09-01T10:00:00.000Z',
    },
    {
      id: 1,
      title: 'Новая задача',
      status: 'new',
      createdAt: '2026-10-01T10:00:00.000Z',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Совунья);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('запрашивает список без параметров и сортирует новые сверху', () => {
    let result: Task[] | undefined;

    service.getTasks().subscribe((tasks) => (result = tasks));

    const req = httpMock.expectOne(TASKS_API_URL);
    expect(req.request.method).toBe('GET');
    req.flush(sample);

    expect(result?.map((task) => task.id)).toEqual([1, 2]);
  });

  it('передаёт status и title_like в query', () => {
    service.getTasks({ status: 'done', title: 'отчёт' }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === TASKS_API_URL &&
        r.params.get('status') === 'done' &&
        r.params.get('title_like') === 'отчёт'
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('создаёт задачу через POST', () => {
    const payload = {
      title: 'Тест',
      status: 'new' as const,
      createdAt: '2026-10-01T09:30:00.000Z',
    };

    service.createTask(payload).subscribe();

    const req = httpMock.expectOne(TASKS_API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 10, ...payload });
  });

  it('меняет статус через PATCH', () => {
    service.updateStatus(3, 'in_progress').subscribe();

    const req = httpMock.expectOne(`${TASKS_API_URL}/3`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'in_progress' });
    req.flush({
      id: 3,
      title: 'X',
      status: 'in_progress',
      createdAt: '2026-10-01T09:30:00.000Z',
    });
  });
});
