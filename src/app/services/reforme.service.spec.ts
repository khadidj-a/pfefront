import { TestBed } from '@angular/core/testing';

import { ReformeService } from './reforme.service';

describe('ReformeService', () => {
  let service: ReformeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReformeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
