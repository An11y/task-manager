import { FormControl } from '@angular/forms';
import { titleRequiredValidator } from './validators';

describe('titleRequiredValidator', () => {
  it('отклоняет пустую строку и пробелы', () => {
    expect(titleRequiredValidator(new FormControl(''))).toEqual({
      titleRequired: true,
    });
    expect(titleRequiredValidator(new FormControl('   '))).toEqual({
      titleRequired: true,
    });
  });

  it('принимает непустое название', () => {
    expect(titleRequiredValidator(new FormControl('Задача'))).toBeNull();
  });
});
