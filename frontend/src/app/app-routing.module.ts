import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  // Public routes
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },

  // Protected routes
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },

  // Admin routes
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },

  // Directeur routes
  {
    path: 'directeur',
    loadChildren: () => import('./pages/directeur/directeur.module').then(m => m.DirecteurModule),
    canActivate: [AuthGuard],
    data: { roles: ['DIRECTEUR_THESE'] }
  },

  // Doctorant routes
  {
    path: 'doctorant',
    loadChildren: () => import('./pages/doctorant/doctorant.module').then(m => m.DoctorantModule),
    canActivate: [AuthGuard],
    data: { roles: ['DOCTORANT'] }
  },

  // Candidat routes
  {
    path: 'candidat',
    loadChildren: () => import('./pages/candidat/candidat.module').then(m => m.CandidatModule),
    canActivate: [AuthGuard],
    data: { roles: ['CANDIDAT'] }
  },

  // Profile
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [AuthGuard]
  },

  // Error pages
  {
    path: 'unauthorized',
    loadChildren: () => import('./pages/errors/errors.module').then(m => m.ErrorsModule)
  },

  // Wildcard
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
