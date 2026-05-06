import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NewTicketComponent } from './components/new-ticket/new-ticket';
import { TicketQueueComponent } from './components/ticket-queue/ticket-queue';
import { AllTicketsComponent } from './components/all-tickets/all-tickets';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'new-ticket', component: NewTicketComponent },
  { path: 'ticket-queue', component: TicketQueueComponent },
  { path: 'all-tickets', component: AllTicketsComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];