import { TestBed } from '@angular/core/testing';

import { OrganeService } from './organe.service';

describe('OrganeService', () => {
  let service: OrganeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
