import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { inscriptionCompleteGuard } from './core/guards/inscription-complete.guard';

export const routes: Routes = [
  // Redirection par défaut
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Auth
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },

  // Page d'attente
  {
    path: 'auth/pending-approval',
    loadComponent: () => import('./features/auth/pending-approval/pending-approval.component')
        .then(m => m.PendingApprovalComponent)
  },

  // --- DASHBOARD (Commun à tous les utilisateurs authentifiés) ---
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, inscriptionCompleteGuard]
  },

  // --- INSCRIPTIONS ---
  {
    path: 'inscriptions',
    loadChildren: () => import('./features/inscriptions/inscriptions.routes').then(m => m.INSCRIPTIONS_ROUTES),
    canActivate: [authGuard]
  },

  // --- PROFIL (Commun à tous les utilisateurs authentifiés) ---
  {
    path: 'profil',
    loadComponent: () => import('./features/profil/profil.component').then(m => m.ProfilComponent),
    canActivate: [authGuard]
  },

  // --- ESPACE DOCTORANT (nécessite inscription complète) ---
  {
    path: 'soutenances',
    loadChildren: () => import('./features/soutenances/soutenances.routes').then(m => m.SOUTENANCES_ROUTES),
    canActivate: [authGuard, inscriptionCompleteGuard]
  },
  {
    path: 'derogations',
    loadChildren: () => import('./features/derogations/derogations.routes').then(m => m.DEROGATIONS_ROUTES),
    canActivate: [authGuard, inscriptionCompleteGuard]
  },

  // --- ESPACE DIRECTEUR DE THÈSE ---
  {
    path: 'validations',
    loadComponent: () => import('./features/directeur/validation/director-validation.component')
        .then(m => m.DirectorValidationComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTEUR_THESE'] }
  },
  // ❌ SUPPRIMÉ: /my-students (non conforme au CDC)
  {
    path: 'director/soutenances',
    loadComponent: () => import('./features/directeur/soutenances/director-soutenance.component')
        .then(m => m.DirectorSoutenanceComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTEUR_THESE'] }
  },

  // --- ESPACE ADMIN ---
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },

  // --- ESPACE GESTION CAMPAGNES ---
  {
    path: 'campagnes',
    loadChildren: () => import('./features/campagnes/campagnes.routes').then(m => m.CAMPAGNES_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'RESPONSABLE_CEDOC'] }
  },

  // --- 404 ---
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];