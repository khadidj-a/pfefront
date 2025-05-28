import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniteComponent } from './unite.component';

describe('UniteComponent', () => {
  let component: UniteComponent;
  let fixture: ComponentFixture<UniteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UniteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
