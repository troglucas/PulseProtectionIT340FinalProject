import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  username = sessionStorage.getItem('username') || 'User';

  constructor(private router: Router) {}

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
