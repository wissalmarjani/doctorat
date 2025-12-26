import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { InscriptionService } from '../services/inscription.service';
import { Role, EtatCandidature } from '../models/user.model';
import { map, catchError, of } from 'rxjs';

export const inscriptionCompleteGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const inscriptionService = inject(InscriptionService);
    const user = authService.currentUser();

    // 1. Si pas connecté, rediriger vers login
    if (!user) {
        return router.createUrlTree(['/auth/login']);
    }

    // 2. Si c'est un ADMIN ou DIRECTEUR, toujours laisser passer
    if (user.role === Role.ADMIN || user.role === Role.DIRECTEUR_THESE) {
        return true;
    }

    // 3. Si c'est un CANDIDAT (pas encore validé), rediriger vers pending-approval
    if (user.role === Role.CANDIDAT) {
        // Vérifier son état
        if (user.etat === EtatCandidature.REFUSE) {
            return router.createUrlTree(['/auth/pending-approval']);
        }
        if (user.etat === EtatCandidature.EN_ATTENTE_ADMIN ||
            user.etat === EtatCandidature.EN_ATTENTE_DIRECTEUR) {
            return router.createUrlTree(['/auth/pending-approval']);
        }
        // Si pas d'état défini, c'est qu'il vient de s'inscrire
        return router.createUrlTree(['/auth/pending-approval']);
    }

    // 4. Si c'est un DOCTORANT (validé), laisser passer partout
    if (user.role === Role.DOCTORANT) {
        return true;
    }

    // Par défaut, laisser passer
    return true;
};