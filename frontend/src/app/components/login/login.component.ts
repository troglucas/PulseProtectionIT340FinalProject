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

  private isValidUsername(username: string): boolean {
    return /^[A-Za-z0-9_]{3,30}$/.test(username);
  }

  onLogin() {
    this.errorMessage = '';
    this.isLoading = true;

    if (!this.isValidUsername(this.username) || !this.password || this.password.length > 128) {
      this.errorMessage = 'Invalid username or password format';
      this.isLoading = false;
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.mfaRequired) {
          this.mfaRequired = true;
          this.mfaMessage = response.message;
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.isLoading = false;
        this.errorMessage = 'MFA is required before login can complete.';
      },
      error: (err) => {
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
      next: (response) => {
        this.authService.completeLogin(response.username || this.username, response.role || 'user');
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
