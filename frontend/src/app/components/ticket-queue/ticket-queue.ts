import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-ticket-queue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-queue.html'
})
export class TicketQueueComponent implements OnInit {

  tickets: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;

  constructor(private ticketService: TicketService, private router: Router) {}

  ngOnInit(): void {
    this.loadOpenTickets();
  }

  loadOpenTickets(): void {
    this.ticketService.getTickets().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        // Filter to only show open tickets
        this.tickets = response.filter((t: any) => t.status === 'open');
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load tickets.';
      }
    });
  }

  pickUpTicket(ticketId: string): void {
    this.ticketService.updateTicketState(ticketId, 'inprogress').subscribe({
      next: (response: any) => {
        this.loadOpenTickets();
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to update ticket.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}