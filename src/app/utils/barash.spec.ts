import { Бараш } from './barash';

describe('Бараш', () => {
  it('возвращает понятные подписи статусов', () => {
    expect(Бараш.label('new')).toBe('Новая');
    expect(Бараш.label('in_progress')).toBe('В работе');
    expect(Бараш.label('done')).toBe('Готово');
  });

  it('разрешает только переход на один шаг вперёд', () => {
    expect(Бараш.getNext('new')).toBe('in_progress');
    expect(Бараш.getNext('in_progress')).toBe('done');
    expect(Бараш.getNext('done')).toBeNull();
  });

  it('не предлагает действие для завершённой задачи', () => {
    expect(Бараш.canAdvance('done')).toBeFalse();
    expect(Бараш.actionLabel('done')).toBeNull();
    expect(Бараш.actionLabel('new')).toBe('Взять в работу');
  });

  it('парсит фильтр из URL и в API-параметр', () => {
    expect(Бараш.parseFilter('in_progress')).toBe('in_progress');
    expect(Бараш.parseFilter('unknown')).toBe('all');
    expect(Бараш.toApiStatus('all')).toBeNull();
    expect(Бараш.toApiStatus('done')).toBe('done');
  });
});
