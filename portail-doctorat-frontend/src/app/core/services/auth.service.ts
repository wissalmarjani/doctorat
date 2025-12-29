import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  telephone?: string;
  etat?: string;
  motifRefus?: string;
  directeurId?: number;
  titreThese?: string;
  sujetThese?: string;
  anneeThese?: number;
  nbPublications?: number;
  nbConferences?: number;
  heuresFormation?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  telephone?: string;
  etat?: string;
  motifRefus?: string;
  directeurId?: number;
  titreThese?: string;
  anneeThese?: number;
  nbPublications?: number;
  nbConferences?: number;
  heuresFormation?: number;
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  matricule: string;
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.userServiceUrl}/auth`;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(
      private http: HttpClient,
      private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        console.log('✅ User loaded from storage:', user.username);
      } catch (e) {
        console.error('Error parsing user from storage', e);
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
        tap(response => {
          if (response.accessToken) {
            this.saveTokens(response);
            this.saveUser(response);
            console.log('✅ Login successful:', response.username);
          }
        }),
        catchError(error => {
          console.error('❌ Login error:', error);
          return throwError(() => new Error(error.error?.message || 'Erreur de connexion'));
        })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
        tap(response => {
          if (response.accessToken) {
            this.saveTokens(response);
            this.saveUser(response);
          }
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Erreur lors de l\'inscription'));
        })
    );
  }

  registerWithFiles(formData: FormData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register-with-files`, formData).pipe(
        tap(response => {
          if (response.accessToken) {
            this.saveTokens(response);
            this.saveUser(response);
          }
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Erreur lors de l\'inscription'));
        })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    // ✅ CORRIGÉ: Redirige vers /login au lieu de /auth/login
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // =====================================================
  // HELPERS DE RÔLES (AJOUTÉS)
  // =====================================================

  /**
   * Vérifie si l'utilisateur connecté est un admin
   */
  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'ADMIN';
  }

  /**
   * Vérifie si l'utilisateur connecté est un directeur de thèse
   */
  isDirecteur(): boolean {
    const user = this.currentUser();
    return user?.role === 'DIRECTEUR_THESE' || user?.role === 'DIRECTEUR';
  }

  /**
   * Vérifie si l'utilisateur connecté est un doctorant/candidat
   */
  isDoctorant(): boolean {
    const user = this.currentUser();
    return user?.role === 'DOCTORANT' || user?.role === 'CANDIDAT';
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role;
  }

  /**
   * Vérifie si l'utilisateur a l'un des rôles spécifiés
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  // =====================================================
  // PROFIL
  // =====================================================

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`).pipe(
        tap(user => {
          const currentUser = this.currentUser();
          if (currentUser) {
            const updatedUser = { ...currentUser, ...user };
            this.currentUser.set(updatedUser);
            localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
          }
        })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
        tap(response => {
          if (response.accessToken) {
            this.saveTokens(response);
            this.saveUser(response);
          }
        })
    );
  }

  private saveTokens(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    }
  }

  /**
   * Met à jour les données utilisateur (appelé par le dashboard après refresh depuis la DB)
   * Permet de synchroniser les prérequis modifiés par l'admin
   */
  updateCurrentUser(updatedUser: Partial<User>): void {
    const currentUser = this.currentUser();
    if (currentUser) {
      const merged: User = {
        ...currentUser,
        ...updatedUser,
        sujetThese: updatedUser.titreThese || updatedUser.sujetThese || currentUser.sujetThese
      };
      localStorage.setItem(this.USER_KEY, JSON.stringify(merged));
      this.currentUser.set(merged);
      console.log('✅ Current user updated with fresh data');
    }
  }

  updateUserStorage(updatedUser: Partial<User>): void {
    this.updateCurrentUser(updatedUser);
  }

  private saveUser(response: AuthResponse): void {
    const user: User = {
      id: response.userId,
      username: response.username,
      email: response.email,
      nom: response.nom,
      prenom: response.prenom,
      role: response.role,
      telephone: response.telephone,
      etat: response.etat,
      motifRefus: response.motifRefus,
      directeurId: response.directeurId,
      titreThese: response.titreThese,
      sujetThese: response.titreThese,
      anneeThese: response.anneeThese,
      nbPublications: response.nbPublications,
      nbConferences: response.nbConferences,
      heuresFormation: response.heuresFormation
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }
}