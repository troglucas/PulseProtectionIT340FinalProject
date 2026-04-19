import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  username = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  // Joseph's API only accepts username + password.
  role: string = 'user';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onRegister() {
    // Clear any previous messages and show loading state
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    // Basic client-side check
    if (!this.username || !this.email || !this.dob || !this.password) {
  this.errorMessage = "Please fill in username, email, date of birth, and password.";
  this.isLoading = false;
  return;
}
    }

    // Call the backend to create the account
   this.authService.register(this.username, this.email, this.dob, this.password).subscribe({
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
      }
    });
  }
}