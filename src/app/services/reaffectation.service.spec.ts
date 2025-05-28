import { TestBed } from '@angular/core/testing';

import { ReaffectationService } from './reaffectation.service';

describe('ReaffectationService', () => {
  let service: ReaffectationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReaffectationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
