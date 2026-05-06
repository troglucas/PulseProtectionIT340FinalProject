import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  username: string = '';
  role: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Grab the logged in user's info when the dashboard loads
    this.username = this.authService.getUsername();
    this.role = this.authService.getRole();

    // If nobody is logged in, send them back to login
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  // Check role helpers for the HTML to use
  isUser(): boolean { return this.role === 'user'; }
  isITAssistant(): boolean { return this.role === 'itassistant'; }
  isAdmin(): boolean { return this.role === 'admin'; }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}