import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebookComponent } from './scorebook.component';

describe('ScorebookComponent', () => {
  let component: ScorebookComponent;
  let fixture: ComponentFixture<ScorebookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScorebookComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
