import { Component, OnInit } from '@angular/core';
import { TicketService } from '../services/ticket.service'; // Ensure path is correct

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  role: string = '';
  username: string = '';
  tickets: any[] = [];
  currentViewLabel: string = 'All Tickets';
  stats = { total: 0, active: 0, resolved: 0 };

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.role = localStorage.getItem('userRole') || 'user';
    this.username = localStorage.getItem('username') || 'Guest';
    this.loadTickets();
  }

  // RBAC Helper Methods
  isUser() { return this.role === 'user'; }
  isITAssistant() { return this.role === 'it'; }
  isAdmin() { return this.role === 'admin'; }

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.updateStats();
      },
      error: (err) => console.error('Failed to load tickets', err)
    });
  }

  updateStats() {
    this.stats.total = this.tickets.length;
    this.stats.active = this.tickets.filter(t => t.status === 'inprogress').length;
    this.stats.resolved = this.tickets.filter(t => t.status === 'completed' || t.status === 'resolved').length;
  }

  onClaim(id: string) {
    this.ticketService.updateStatus(id, 'inprogress').subscribe(() => this.loadTickets());
  }

  onDelete(id: string) {
    if(confirm('Are you sure you want to delete this ticket?')) {
      this.ticketService.deleteTicket(id).subscribe(() => this.loadTickets());
    }
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}
