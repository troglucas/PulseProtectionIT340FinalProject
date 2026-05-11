import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  // Base URL for ticket endpoints 
  private apiUrl = 'http://10.0.2.5:3000/api/tickets';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getHeaders() {
    const username = this.isBrowser() ? sessionStorage.getItem('username') || '' : '';
    const role = this.isBrowser() ? sessionStorage.getItem('role') || '' : '';
    return { headers: { 'x-username': username, 'x-role': role } };
  }

  // Get all tickets (admin sees all, user sees their own)
  getTickets(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders());
  }

  // Get tickets assigned to the IT assistant
  getAssignedTickets(): Observable<any> {
    return this.http.get(`${this.apiUrl}/assigned`, this.getHeaders());
  }

  // Create a new ticket (user only)
  createTicket(subject: string, description: string): Observable<any> {
    const body = { subject, description };
    return this.http.post(this.apiUrl, body, this.getHeaders());
  }

  // Update ticket state (IT assistant only)
  // state can be: 'open', 'inprogress', 'resolved'
  updateTicketState(ticketId: string, state: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${ticketId}`, { state }, this.getHeaders());
  }

  // Delete a ticket (admin only)
  deleteTicket(ticketId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${ticketId}`, this.getHeaders());
  }
}
