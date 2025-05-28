import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupeIdentiqueComponent } from './groupe-identique.component';

describe('GroupeidentiqueComponent', () => {
  let component: GroupeIdentiqueComponent;
  let fixture: ComponentFixture<GroupeIdentiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupeIdentiqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupeIdentiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
