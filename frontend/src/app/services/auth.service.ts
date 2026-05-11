import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://10.0.2.5:3000/auth';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private async sha256(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  login(username: string, password: string): Observable<any> {
    return from(this.sha256(password)).pipe(
      switchMap((passwordHash: string) =>
        this.http.post(this.apiUrl, {
          action: 'login',
          username,
          password: passwordHash,
        }),
      ),
    );
  }

  verifyMfa(username: string, code: string): Observable<any> {
    return this.http.post(this.apiUrl, {
      action: 'verifyMfa',
      username,
      code,
    });
  }

  register(
    username: string,
    email: string,
    dob: string,
    password: string,
    deviceModel: string,
    role: string,
  ): Observable<any> {
    return from(this.sha256(password)).pipe(
      switchMap((passwordHash: string) =>
        this.http.post(this.apiUrl, {
          action: 'register',
          username,
          email,
          dob,
          password: passwordHash,
          deviceModel,
          role,
        }),
      ),
    );
  }

  completeLogin(username: string, role: string): void {
    if (this.isBrowser()) {
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('username', username);
      sessionStorage.setItem('role', role || 'user');
    }
  }

  getRole(): string {
    if (this.isBrowser()) return sessionStorage.getItem('role') || '';
    return '';
  }

  getUsername(): string {
    if (this.isBrowser()) return sessionStorage.getItem('username') || '';
    return '';
  }

  isLoggedIn(): boolean {
    if (this.isBrowser()) return sessionStorage.getItem('isLoggedIn') === 'true';
    return false;
  }

  logout(): void {
    if (this.isBrowser()) {
      sessionStorage.clear();
    }
  }
}
