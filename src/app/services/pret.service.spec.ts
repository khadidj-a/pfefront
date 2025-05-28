import { TestBed } from '@angular/core/testing';

import { PretService } from './pret.service';

describe('PretService', () => {
  let service: PretService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PretService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
