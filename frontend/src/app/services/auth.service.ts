import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Base URL of Joseph's backend server. Double check if it's the correct one!
  private apiUrl = 'http://10.0.2.5:3000/auth'; //back end ip and port

  constructor(private http: HttpClient) {}
  // hashing algohrithim for password security
  private async sha256(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Sends a login request to the backend.
  login(username: string, password: string): Observable<any> {
    return from(this.sha256(password)).pipe(
      switchMap((passwordHash: string) =>
        this.http.post(this.apiUrl, {
          // to match with server {action, username, password}
          action: 'login',
          username,
          password: passwordHash,
        }),
      ),
    );
  }

  // Sends a register request to the backend.
  register(username: string, email: string, dob: string, password: string): Observable<any> {
    return from(this.sha256(password)).pipe(
      switchMap((passwordHash: string) =>
        this.http.post(this.apiUrl, {
          // to match with server {action, username, email, dob, password}
          action: 'register',
          username,
          email,
          dob,
          password: passwordHash,
        }),
      ),
    );
  }
}
