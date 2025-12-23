import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
// 👇 Assurez-vous que l'import est bien là
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

  // ✅ DASHBOARD (Déjà protégé, ça fonctionne)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, inscriptionCompleteGuard]
  },

  // ✅ INSCRIPTIONS : NE PAS PROTÉGER AVEC inscriptionCompleteGuard
  // Sinon boucle infinie (car c'est ici qu'on redirige l'utilisateur bloqué)
  {
    path: 'inscriptions',
    loadChildren: () => import('./features/inscriptions/inscriptions.routes').then(m => m.INSCRIPTIONS_ROUTES),
    canActivate: [authGuard]
  },

  // Validation (si accessible au doctorant, protéger aussi)
  {
    path: 'validations',
    loadComponent: () => import('./features/inscriptions/inscription-validation/inscription-validation.component')
        .then(m => m.InscriptionValidationComponent),
    canActivate: [authGuard] // Souvent réservé aux admins/profs, donc pas besoin de bloquer le doctorant ici s'il n'y a pas accès
  },

  // 🔒 SOUTENANCES : AJOUTER LE GUARD ICI
  {
    path: 'soutenances',
    loadChildren: () => import('./features/soutenances/soutenances.routes').then(m => m.SOUTENANCES_ROUTES),
    canActivate: [authGuard, inscriptionCompleteGuard] // 👈 AJOUT ICI
  },

  // 🔒 DEROGATIONS : AJOUTER LE GUARD ICI
  {
    path: 'derogations',
    loadChildren: () => import('./features/derogations/derogations.routes').then(m => m.DEROGATIONS_ROUTES),
    canActivate: [authGuard, inscriptionCompleteGuard] // 👈 AJOUT ICI
  },

  // ✅ ADMIN (Déjà protégé par roleGuard)
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },

  // ✅ CAMPAGNES
  {
    path: 'campagnes',
    loadChildren: () => import('./features/campagnes/campagnes.routes').then(m => m.CAMPAGNES_ROUTES),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'RESPONSABLE_CEDOC'] }
  },

  // Profil
  {
    path: 'profil',
    loadComponent: () => import('./features/profil/profil.component').then(m => m.ProfilComponent),
    canActivate: [authGuard]
  },

  // 404
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];