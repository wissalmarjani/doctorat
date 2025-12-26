import { Routes } from '@angular/router';

export const SOUTENANCES_ROUTES: Routes = [
  {
    path: '',
    // ✅ CORRIGÉ: Pointe maintenant vers le composant du DOCTORANT (pas admin)
    loadComponent: () => import('../directeur/soutenances/doctorant-soutenance/doctorant-soutenance.component')
        .then(m => m.DoctorantSoutenanceComponent)
  }
];