import { Лосяш } from './losyash';

describe('Лосяш', () => {
  it('форматирует ISO-дату в локальном виде ДД.ММ.ГГГГ ЧЧ:ММ', () => {
    const formatted = Лосяш.formatDate('2026-10-01T09:30:00.000Z');
    expect(formatted).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
    expect(formatted).not.toContain('T');
    expect(formatted).not.toContain(',');
  });

  it('сортирует задачи от новых к старым', () => {
    const sorted = Лосяш.sortByNewestFirst([
      { createdAt: '2026-09-01T00:00:00.000Z' },
      { createdAt: '2026-10-01T00:00:00.000Z' },
    ]);
    expect(sorted[0].createdAt).toBe('2026-10-01T00:00:00.000Z');
  });

  it('обрезает пробелы в названии', () => {
    expect(Лосяш.normalizeTitle('  задача  ')).toBe('задача');
  });

  it('проверяет видимость задачи в списке с фильтром и поиском', () => {
    const task = { title: 'Подготовить отчёт', status: 'new' as const };

    expect(Лосяш.taskVisibleInList(task, 'all', '')).toBeTrue();
    expect(Лосяш.taskVisibleInList(task, 'done', '')).toBeFalse();
    expect(Лосяш.taskVisibleInList(task, 'new', 'отч')).toBeTrue();
    expect(Лосяш.taskVisibleInList(task, 'new', 'readme')).toBeFalse();
  });

  it('возвращает тексты пустого списка по ТЗ', () => {
    expect(Лосяш.emptyListMessage('all', '')).toBe('Задач пока нет');
    expect(Лосяш.emptyListMessage('done', '')).toBe(
      'Нет задач с выбранным статусом'
    );
    expect(Лосяш.emptyListMessage('all', 'test')).toBe(
      'Нет задач с выбранными условиями'
    );
  });
});
