import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(username: string, password: string): Observable<any> {
    const body = {
      username: username,
      password: password,
      'check/registering': 'check'
    };
    return this.http.post(this.apiUrl, body).pipe(
      tap((response: any) => {
        if (this.isBrowser() && response && response.role) {
          localStorage.setItem('role', response.role);
          localStorage.setItem('username', username);
        }
      })
    );
  }

  register(username: string, password: string): Observable<any> {
    const body = {
      username: username,
      password: password,
      'check/registering': 'registering'
    };
    return this.http.post(this.apiUrl, body);
  }

  getRole(): string {
    if (this.isBrowser()) return localStorage.getItem('role') || '';
    return '';
  }

  getUsername(): string {
    if (this.isBrowser()) return localStorage.getItem('username') || '';
    return '';
  }

  isLoggedIn(): boolean {
    if (this.isBrowser()) return !!localStorage.getItem('role');
    return false;
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('role');
      localStorage.removeItem('username');
    }
  }
}