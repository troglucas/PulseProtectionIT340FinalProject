import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  username = '';
  role = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.username = this.authService.getUsername() || 'User';
    this.role = this.authService.getRole() || 'user';
  }

  isUser(): boolean {
    return this.role === 'user';
  }

  isITAssistant(): boolean {
    return this.role === 'it';
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  getRoleLabel(): string {
    if (this.isAdmin()) return 'Admin';
    if (this.isITAssistant()) return 'IT Assistant';
    return 'User';
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
