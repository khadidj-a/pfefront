import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeEqptComponent } from './typeeq.component';

describe('TypeeqComponent', () => {
  let component: TypeEqptComponent;
  let fixture: ComponentFixture<TypeEqptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeEqptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeEqptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
