import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, EtatCandidature } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private baseUrl = `${environment.userServiceUrl}/users`;

    constructor(private http: HttpClient) {}

    // ========================================================
    // CRUD
    // ========================================================

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.baseUrl);
    }

    getUsersByRole(role: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.baseUrl}/role/${role}`);
    }

    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}/${id}`);
    }

    getUsersByEtat(etat: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.baseUrl}/etat/${etat}`);
    }

    createUser(user: User): Observable<User> {
        return this.http.post<User>(this.baseUrl, user);
    }

    updateUser(id: number, user: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.baseUrl}/${id}`, user);
    }

    updateRole(id: number, newRole: string): Observable<User> {
        return this.http.put<User>(`${this.baseUrl}/${id}/role`, {}, {
            params: { newRole: newRole }
        });
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    // ========================================================
    // WORKFLOW ADMIN
    // ========================================================

    /**
     * L'Admin valide ET assigne un directeur de thèse
     */
    validerCandidatureAdminAvecDirecteur(userId: number, directeurId: number): Observable<User> {
        return this.http.put<User>(`${this.baseUrl}/${userId}/validate-admin`, {}, {
            params: { directeurId: directeurId.toString() }
        });
    }

    /**
     * L'Admin valide sans directeur (fallback)
     */
    validerCandidatureAdmin(id: number): Observable<User> {
        return this.http.put<User>(`${this.baseUrl}/${id}/validate-admin`, {});
    }

    /**
     * L'Admin refuse avec Motif
     */
    refuserCandidatureAdmin(id: number, motif: string): Observable<User> {
        return this.http.put<User>(`${this.baseUrl}/${id}/refuse`, {}, {
            params: { motif: motif }
        });
    }

    // ========================================================
    // WORKFLOW DIRECTEUR
    // ========================================================

    /**
     * Le Directeur valide : VALIDE + rôle DOCTORANT
     */
    validerCandidatureDirecteur(id: number): Observable<User> {
        return this.http.put<User>(`${this.baseUrl}/${id}/validate-directeur`, {});
    }

    /**
     * Le Directeur refuse avec Motif
     */
    refuserCandidatureDirecteur(id: number, motif: string): Observable<User> {
        return this.http.put<User>(`${this.baseUrl}/${id}/refuse-directeur`, {}, {
            params: { motif: motif }
        });
    }

    // ========================================================
    // UTILITAIRES
    // ========================================================

    /**
     * URL pour télécharger/voir un document
     */
    getDocumentUrl(filename: string): string {
        return `${environment.userServiceUrl}/files/${filename}`;
    }
}