import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // URLs publiques qui ne nécessitent pas de token
  const publicUrls = ['/auth/login', '/auth/register', '/auth/refresh'];
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  // Récupérer le token
  const token = authService.getToken();

  // Debug logs
  console.log('🔐 ══════════════════════════════════════');
  console.log('🔐 Interceptor - URL:', req.url);
  console.log('🔐 Interceptor - Method:', req.method);
  console.log('🔐 Interceptor - Is Public URL:', isPublicUrl);
  console.log('🔐 Interceptor - Token exists:', !!token);
  if (token) {
    console.log('🔐 Interceptor - Token (first 50 chars):', token.substring(0, 50) + '...');
  }

  // Ajouter le token si disponible et URL non publique
  if (token && !isPublicUrl) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('🔐 Interceptor - ✅ Header Authorization ajouté');
  } else if (!token && !isPublicUrl) {
    console.warn('🔐 Interceptor - ⚠️ Pas de token pour une URL protégée!');
  }
  console.log('🔐 ══════════════════════════════════════');

  return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('🔐 Interceptor - ❌ Erreur HTTP:', error.status, error.statusText);
        console.error('🔐 Interceptor - URL qui a échoué:', error.url);

        // Si erreur 401, déconnecter l'utilisateur
        if (error.status === 401 && !isPublicUrl) {
          console.error('🔐 Interceptor - 401 Unauthorized - Redirection vers login');
          authService.logout();
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url }
          });
        }

        // Si erreur 403, afficher plus d'infos
        if (error.status === 403) {
          console.error('🔐 Interceptor - 403 Forbidden - Vérifiez:');
          console.error('   1. Le token est-il valide ?');
          console.error('   2. L\'utilisateur a-t-il le bon rôle (ADMIN) ?');
          console.error('   3. L\'endpoint est-il autorisé dans SecurityConfig ?');
        }

        return throwError(() => error);
      })
  );
};