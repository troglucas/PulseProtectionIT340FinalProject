import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private router: Router) {}

  onLogin() {
    console.log('Login attempt:', this.username);
    // This matches the (click)="onLogin()" in your HTML
    this.router.navigate(['/dashboard']);
  }
}
