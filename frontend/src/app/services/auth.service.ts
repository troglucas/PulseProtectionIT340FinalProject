import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Base URL of Joseph's backend server. Double check if it's the correct one!
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) { }

  // Sends a login request to the backend.
  login(username: string, password: string): Observable<any> {
    const body = {
      username: username,
      password: password,
      'check/registering': 'check'
    };
    return this.http.post(this.apiUrl, body);
  }

  // Sends a register request to the backend.
  register(username: string, password: string): Observable<any> {
    const body = {
      username: username,
      password: password,
      'check/registering': 'registering'
    };
    return this.http.post(this.apiUrl, body);
  }
}