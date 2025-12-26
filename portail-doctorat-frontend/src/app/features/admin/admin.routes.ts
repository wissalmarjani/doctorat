import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./user-management/user-management.component')
        .then(m => m.UserManagementComponent)
  },
  {
    path: 'derogations',
    loadComponent: () => import('./derogation-management/derogation-management.component')
        .then(m => m.DerogationManagementComponent)
  },
  {
    path: 'soutenances',
    loadComponent: () => import('./soutenance-list/soutenance-list.component')
        .then(m => m.SoutenanceListComponent)
  },
  {
    path: 'soutenances/:id',
    loadComponent: () => import('./soutenance-detail/soutenance-detail.component')
        .then(m => m.SoutenanceDetailComponent)
  }
];