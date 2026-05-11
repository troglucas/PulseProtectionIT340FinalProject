import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-new-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-ticket.html'
})
export class NewTicketComponent {

  subject: string = '';
  description: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(private ticketService: TicketService, private router: Router) {}

  submitTicket(): void {
    // Basic validation
    if (!this.subject || !this.description) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.ticketService.createTicket(this.subject, this.description).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'Ticket submitted successfully!';
        // Clear the form
        this.subject = '';
        this.description = '';
        // Redirect to dashboard after 2 seconds
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to submit ticket. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}