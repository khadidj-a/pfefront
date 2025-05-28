import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReaffectationComponent } from './reaffectation-management.component';

describe('ReaffectationManagementComponent', () => {
  let component: ReaffectationComponent;
  let fixture: ComponentFixture<ReaffectationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReaffectationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReaffectationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
