import { TestBed } from '@angular/core/testing';

import { GroupeidentiqueService } from './groupeidentique.service';

describe('GroupeidentiqueService', () => {
  let service: GroupeidentiqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupeidentiqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
