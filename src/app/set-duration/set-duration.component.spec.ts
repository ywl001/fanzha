import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetDurationComponent } from './set-duration.component';

describe('SetDurationComponent', () => {
  let component: SetDurationComponent;
  let fixture: ComponentFixture<SetDurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetDurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetDurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
