import { Routes } from '@angular/router';
import { Home } from './features/home/home/home';
import { Apply } from './features/apply/apply/apply';
import { Confirm } from './features/confirm/confirm/confirm';
import { Login } from './features/login/login/login';
import { Admin } from './features/admin/admin/admin';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    component: Home,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: 'apply-loan',
    component: Apply,
  },

  {
    path: 'confirm-loan',
    component: Confirm,
  },

  { path: 'login', component: Login },
  {
    path: 'admin',
    canActivate: [authGuard],
    component: Admin,
  },
];
