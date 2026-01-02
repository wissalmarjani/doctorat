import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.userServiceUrl}/api/users`;

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    getUserByUsername(username: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/username/${username}`);
    }

    getUsersByRole(role: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/role/${role}`);
    }

    getUsersByEtat(etat: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/etat/${etat}`);
    }

    updateUser(id: number, user: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user);
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Workflow Admin
    validateByAdmin(id: number, directeurId?: number): Observable<User> {
        let url = `${this.apiUrl}/${id}/validate-admin`;
        if (directeurId) {
            url += `?directeurId=${directeurId}`;
        }
        return this.http.put<User>(url, {});
    }

    refuseByAdmin(id: number, motif: string): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}/refuse?motif=${encodeURIComponent(motif)}`, {});
    }

    // Workflow Directeur
    validateByDirecteur(id: number, sujetThese?: string): Observable<User> {
        let url = `${this.apiUrl}/${id}/validate-directeur`;
        if (sujetThese) {
            url += `?sujetThese=${encodeURIComponent(sujetThese)}`;
        }
        return this.http.put<User>(url, {});
    }

    refuseByDirecteur(id: number, motif: string): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}/refuse-directeur?motif=${encodeURIComponent(motif)}`, {});
    }

    // Doctorants d'un directeur
    getDoctorantsByDirecteur(directeurId: number): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/directeur/${directeurId}/doctorants`);
    }

    // Changer le rôle
    changeRole(id: number, newRole: string): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}/role?newRole=${newRole}`, {});
    }

    // Directeurs disponibles
    getDirecteurs(): Observable<User[]> {
        return this.getUsersByRole('DIRECTEUR_THESE');
    }

    // Candidats en attente
    getCandidatsEnAttente(): Observable<User[]> {
        return this.getUsersByEtat('EN_ATTENTE_ADMIN');
    }
}
