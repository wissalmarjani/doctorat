import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User, LoginRequest, RegisterRequest, AuthResponse, ChangePasswordRequest } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.userServiceUrl}/api/auth`;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadStoredUser();
    }

    private loadStoredUser(): void {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            this.currentUserSubject.next(JSON.parse(user));
        }
    }

    login(request: LoginRequest): Observable<AuthResponse> {
        return this.http.post<any>(`${this.apiUrl}/login`, request).pipe(
            tap(response => {
                const res = response as any;
                const token = res.token || res.accessToken;
                const userObj: User = res.user || {
                    id: res.userId,
                    matricule: res.username || res.matricule,
                    email: res.email,
                    nom: res.nom,
                    prenom: res.prenom,
                    role: res.role,
                    etat: res.etat,
                    telephone: res.telephone,
                    enabled: true
                };

                if (token && userObj) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(userObj));
                    this.currentUserSubject.next(userObj);
                }
            })
        );
    }

    register(request: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request);
    }

    registerWithFiles(request: RegisterRequest, cv: File, diplome: File, lettre?: File): Observable<AuthResponse> {
        const formData = new FormData();
        formData.append('candidat', JSON.stringify(request));
        formData.append('cv', cv);
        formData.append('diplome', diplome);
        if (lettre) {
            formData.append('lettre', lettre);
        }
        return this.http.post<AuthResponse>(`${this.apiUrl}/register-with-files`, formData);
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    getCurrentUser(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`);
    }

    changePassword(request: ChangePasswordRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/change-password`, request);
    }

    validateToken(): Observable<any> {
        return this.http.get(`${this.apiUrl}/validate`);
    }

    get isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    get token(): string | null {
        return localStorage.getItem('token');
    }

    hasRole(role: string): boolean {
        const user = this.currentUserValue;
        return user?.role === role;
    }

    isAdmin(): boolean {
        return this.hasRole('ADMIN');
    }

    isDoctorant(): boolean {
        return this.hasRole('DOCTORANT');
    }

    isDirecteur(): boolean {
        return this.hasRole('DIRECTEUR_THESE');
    }

    isCandidat(): boolean {
        return this.hasRole('CANDIDAT');
    }
}
