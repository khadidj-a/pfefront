import { TestBed } from '@angular/core/testing';

import { TypeService } from './typeeq.service';

describe('TypeeqService', () => {
  let service: TypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
