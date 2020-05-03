import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLowerComponent } from './add-lower.component';

describe('AddLowerComponent', () => {
  let component: AddLowerComponent;
  let fixture: ComponentFixture<AddLowerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddLowerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
