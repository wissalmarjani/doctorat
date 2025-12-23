import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { InscriptionService } from '../services/inscription.service';
import { Role } from '../models/user.model';
import { map, catchError, of } from 'rxjs';

export const inscriptionCompleteGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const inscriptionService = inject(InscriptionService);
    const user = authService.currentUser();

    // 1. Si ce n'est pas un DOCTORANT, on laisse passer tout le monde (Admin, Prof...)
    if (user?.role !== Role.DOCTORANT) {
        return true;
    }

    // 2. Si l'utilisateur est déjà sur une page liée au formulaire d'inscription, on laisse passer
    // Cela évite la boucle infinie de redirection
    const url = state.url;
    if (url.includes('/inscriptions/nouveau') ||
        url.includes('/inscriptions/edit') ||
        url === '/inscriptions') {
        return true;
    }

    // 3. Vérification : Est-ce qu'il a déjà soumis un dossier ?
    return inscriptionService.getMyLatestInscription().pipe(
        map((inscription) => {
            // Si une inscription est trouvée et qu'elle a un ID valide
            if (inscription && inscription.id) {
                return true; // ✅ Accès autorisé au Dashboard
            }

            // Cas théorique où l'objet est vide
            return router.createUrlTree(['/inscriptions/nouveau']);
        }),
        catchError((err) => {
            // 🛑 Erreur (ex: 404 Not Found venant du backend) -> Pas d'inscription
            // On redirige de force vers le formulaire de création
            return of(router.createUrlTree(['/inscriptions/nouveau']));
        })
    );
};