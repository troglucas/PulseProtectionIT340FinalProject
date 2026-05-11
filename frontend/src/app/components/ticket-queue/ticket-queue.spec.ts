import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketQueue } from './ticket-queue';

describe('TicketQueue', () => {
  let component: TicketQueue;
  let fixture: ComponentFixture<TicketQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketQueue],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketQueue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
