import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PretManagementComponent } from './pret-management.component';

describe('PretManagementComponent', () => {
  let component: PretManagementComponent;
  let fixture: ComponentFixture<PretManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PretManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PretManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
