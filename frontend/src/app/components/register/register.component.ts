import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  username = '';
  email = '';
  dob = '';
  password = '';
  deviceModel = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  // Joseph's API only accepts username + password.
  role: string = 'user';

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}
  // checks to make sure the input is vaild not empty or sql injection
  private isSafeText(value: unknown, max = 120): value is string {
    return typeof value === 'string' && value.length > 0 && value.length <= max;
  }

  private isValidUsername(username: string): boolean {
    return /^[A-Za-z0-9_]{3,30}$/.test(username);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidDob(dob: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(dob);
  }

  onRegister() {
    // Clear any previous messages and show loading state
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // Basic client-side check using the functions defined above
    if (!this.isSafeText(this.username, 30) || !this.isValidUsername(this.username)) {
      this.errorMessage = 'Username must be 3-30 chars (letters, numbers, underscore).';
      this.isLoading = false;
      return;
    }

    if (!this.isSafeText(this.email, 120) || !this.isValidEmail(this.email)) {
      this.errorMessage = 'Enter a valid email address.';
      this.isLoading = false;
      return;
    }

    if (!this.isSafeText(this.dob, 10) || !this.isValidDob(this.dob)) {
      this.errorMessage = 'Date of birth must be YYYY-MM-DD.';
      this.isLoading = false;
      return;
    }

    if (!this.isSafeText(this.password, 128)) {
      this.errorMessage = 'Password is required.';
      this.isLoading = false;
      return;
    }

    // Call the backend to create the account
    this.authService
      .register(this.username, this.email, this.dob, this.password, this.deviceModel)
      .subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.isLoading = false;
          this.successMessage = 'Account created! Redirecting to login...';

          // Brief pause so the user sees the success message,
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (err) => {
          console.error('Registration failed:', err);
          this.isLoading = false;
          this.errorMessage = 'Could not create account. The username may already be taken.';
        },
      });
  }
}
