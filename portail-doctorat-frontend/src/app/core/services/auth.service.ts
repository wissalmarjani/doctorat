import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User, Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private authUrl = environment.userServiceUrl;

  // Initialisation du signal avec les données du localStorage
  private currentUserSignal = signal<User | null>(this.loadUserFromStorage());

  // Signaux dérivés (Computed)
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly userRole = computed(() => this.currentUserSignal()?.role);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === Role.ADMIN);
  readonly isDoctorant = computed(() => this.currentUserSignal()?.role === Role.DOCTORANT);
  readonly isDirecteur = computed(() => this.currentUserSignal()?.role === Role.DIRECTEUR_THESE);

  constructor(
      private http: HttpClient,
      private router: Router
  ) {}

  // Inscription simple (JSON uniquement)
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/auth/register`, request)
        .pipe(
            tap(response => this.handleAuthResponse(response)),
            catchError(this.handleError)
        );
  }

  // ✅ Inscription Candidat avec Fichiers (FormData)
  registerWithFiles(formData: FormData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/auth/register-with-files`, formData)
        .pipe(
            catchError(this.handleError)
        );
  }

  // Connexion
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/auth/login`, request)
        .pipe(
            tap(response => this.handleAuthResponse(response)),
            catchError(this.handleError)
        );
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  // Rafraîchir le token
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    return this.http.post<AuthResponse>(`${this.authUrl}/auth/refresh`, { refreshToken })
        .pipe(
            tap(response => this.handleAuthResponse(response)),
            catchError(error => {
              this.logout();
              return throwError(() => error);
            })
        );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  hasRole(role: Role | Role[]): boolean {
    const userRole = this.currentUserSignal()?.role;
    if (!userRole) return false;

    if (Array.isArray(role)) {
      return role.includes(userRole as Role);
    }
    return userRole === role;
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.authUrl}/auth/me`);
  }

  // ✅ NOUVELLE MÉTHODE : Mettre à jour l'utilisateur manuellement
  // Appelée par PendingApprovalComponent après avoir récupéré le profil frais
  updateUserStorage(user: User): void {
    // 1. Mettre à jour le LocalStorage (persistance)
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    // 2. Mettre à jour le signal (réactivité immédiate de l'UI)
    this.currentUserSignal.set(user);
  }

  // --- Gestion interne ---

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

    // On construit un objet User minimal à partir de la réponse de login
    const user: User = {
      id: response.userId,
      username: response.username,
      email: response.email,
      nom: response.nom,
      prenom: response.prenom,
      role: response.role,
      enabled: true,
      telephone: response.telephone
      // Note: etat et motifRefus ne sont pas toujours dans AuthResponse,
      // c'est pourquoi on appelle getProfile() ensuite dans les composants critiques.
    };

    this.updateUserStorage(user);
  }

  private loadUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  private handleError(error: any) {
    let errorMessage = 'Une erreur est survenue';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}