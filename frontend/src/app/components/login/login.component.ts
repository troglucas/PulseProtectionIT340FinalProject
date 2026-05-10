import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  username = '';
  password = '';
  mfaCode = '';
  mfaRequired = false;
  mfaMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  // checks username is valid and not empty or sql injection
  private isValidUsername(username: string): boolean {
    return /^[A-Za-z0-9_]{3,30}$/.test(username);
  }

  onLogin() {
    // Clear any previous error and show a loading state
    this.errorMessage = '';
    this.isLoading = true;

    // Basic client-side check — don't even bother hitting the server
    // if the user hasn't filled in both fields
    if (!this.isValidUsername(this.username) || !this.password || this.password.length > 128) {
      this.errorMessage = 'Invalid username or password format';
      this.isLoading = false;
      return;
    }

    // Call the AuthService, which sends the request to the backend
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.mfaRequired) {
          this.mfaRequired = true;
          this.mfaMessage = response.message;
          this.isLoading = false;
          this.cdr.detectChanges(); // Manually trigger change detection to update the UI
          return;
        }

        // Backend returned a successful response — route to the dashboard
        console.log('Login successful:', response);

        /*Starts a session 
        Clears automatically when broswer tab or window is closed*/
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', this.username);

        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // Backend returned an error OR we couldn't reach it at all
        console.error('Login failed:', err);
        this.isLoading = false;
        this.errorMessage = 'Invalid username or password.';
      },
    });
  }

  onVerifyMfa() {
    this.errorMessage = '';
    this.isLoading = true;

    if (!/^\d{5}$/.test(this.mfaCode)) {
      this.errorMessage = 'Enter the 5 digit code from your email.';
      this.isLoading = false;
      return;
    }

    this.authService.verifyMfa(this.username, this.mfaCode).subscribe({
      next: () => {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', this.username);

        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('MFA verification failed:', err);
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Invalid MFA code.';
      },
    });
  }
}
