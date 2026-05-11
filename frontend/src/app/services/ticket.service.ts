import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private apiUrl = 'http://10.0.2.5:3000/api/tickets'; // Ensure this is your Backend VM IP

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-username': localStorage.getItem('username') || '',
      'x-role': localStorage.getItem('userRole') || ''
    });
  }

  getTickets(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  createTicket(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getAuthHeaders() });
  }

  updateStatus(id: string, state: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { state }, { headers: this.getAuthHeaders() });
  }

  deleteTicket(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
