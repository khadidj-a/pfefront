import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReformeComponent } from './reforme-management.component';

describe('ReformeManagementComponent', () => {
  let component: ReformeComponent;
  let fixture: ComponentFixture<ReformeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReformeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReformeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
