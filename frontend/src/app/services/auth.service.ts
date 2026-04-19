import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Base URL of Joseph's backend server. Double check if it's the correct one!
  private apiUrl = 'http://10.0.2.5:3000/auth'; //back end ip and port

  constructor(private http: HttpClient) {}

  // Sends a login request to the backend.
  login(username: string, password: string): Observable<any> {
    const body = {
      // to match with server {action, username, password}
      action: 'login',
      username,
      password,
    };
    return this.http.post(this.apiUrl, body);
  }

  // Sends a register request to the backend.
  register(username: string, email: string, dob: string, password: string): Observable<any> {
    const body = {
      // to match with server {action, username, email, dob, password}
      action: 'register',
      username,
      email,
      dob,
      password,
    };
    return this.http.post(this.apiUrl, body);
  }
}
