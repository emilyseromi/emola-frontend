import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Congrats } from './congrats';

describe('Congrats', () => {
  let component: Congrats;
  let fixture: ComponentFixture<Congrats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Congrats],
    }).compileComponents();

    fixture = TestBed.createComponent(Congrats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
