import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-all-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-tickets.html'
})
export class AllTicketsComponent implements OnInit {

  tickets: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;
  role: string = '';

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.loadAllTickets();
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  getPageTitle(): string {
    return this.isAdmin() ? 'All Tickets' : 'My Ticket';
  }

  getPageSubtitle(): string {
    return this.isAdmin() ? 'Admin view' : 'Your submitted tickets';
  }

  loadAllTickets(): void {
    this.ticketService.getTickets().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.tickets = response;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load tickets.';
      }
    });
  }

  deleteTicket(ticketId: string): void {
    if (!this.isAdmin()) {
      return;
    }

    this.ticketService.deleteTicket(ticketId).subscribe({
      next: (response: any) => {
        this.loadAllTickets();
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to delete ticket.';
      }
    });
  }

  getStatusBadge(status: string): string {
    if (status === 'open') return 'badge-active';
    if (status === 'inprogress') return 'badge-progress';
    return 'badge-resolved';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
