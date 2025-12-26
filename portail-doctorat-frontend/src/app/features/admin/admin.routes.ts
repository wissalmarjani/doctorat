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
  // ======================================
  // ROUTE POUR AJOUTER UN DIRECTEUR
  // ======================================
  {
    path: 'users/new-director',
    loadComponent: () => import('./new-director/new-director.component')
        .then(m => m.NewDirectorComponent)
  },
  // ======================================
  // ROUTES CAMPAGNES (charge les routes enfants)
  // ======================================
  {
    path: 'campagnes',
    loadChildren: () => import('../campagnes/campagnes.routes')
        .then(m => m.CAMPAGNES_ROUTES)
  },
  {
    path: 'derogations',
    loadComponent: () => import('./derogation-management/derogation-management.component')
        .then(m => m.DerogationManagementComponent)
  },
  // ======================================
  // ROUTES SOUTENANCES
  // ======================================
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