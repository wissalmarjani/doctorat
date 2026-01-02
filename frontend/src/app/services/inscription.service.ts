import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inscription, Campagne, Derogation } from '../models/inscription.model';

@Injectable({
    providedIn: 'root'
})
export class InscriptionService {
    private apiUrl = `${environment.inscriptionServiceUrl}/api/inscriptions`;
    private campagneUrl = `${environment.inscriptionServiceUrl}/api/campagnes`;
    private derogationUrl = `${environment.inscriptionServiceUrl}/api/derogations`;

    constructor(private http: HttpClient) { }

    // ===================== CRUD Inscriptions =====================
    create(inscription: Inscription): Observable<Inscription> {
        return this.http.post<Inscription>(this.apiUrl, inscription);
    }

    getAll(): Observable<Inscription[]> {
        return this.http.get<Inscription[]>(this.apiUrl);
    }

    getById(id: number): Observable<Inscription> {
        return this.http.get<Inscription>(`${this.apiUrl}/${id}`);
    }

    update(id: number, inscription: Partial<Inscription>): Observable<Inscription> {
        return this.http.put<Inscription>(`${this.apiUrl}/${id}`, inscription);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // ===================== Requêtes spécifiques =====================
    getByDoctorant(doctorantId: number): Observable<Inscription[]> {
        return this.http.get<Inscription[]>(`${this.apiUrl}/doctorant/${doctorantId}`);
    }

    getByDirecteur(directeurId: number): Observable<Inscription[]> {
        return this.http.get<Inscription[]>(`${this.apiUrl}/directeur/${directeurId}`);
    }

    getByStatut(statut: string): Observable<Inscription[]> {
        return this.http.get<Inscription[]>(`${this.apiUrl}/statut/${statut}`);
    }

    getByCampagne(campagneId: number): Observable<Inscription[]> {
        return this.http.get<Inscription[]>(`${this.apiUrl}/campagne/${campagneId}`);
    }

    getByType(type: string): Observable<Inscription[]> {
        return this.http.get<Inscription[]>(`${this.apiUrl}/type/${type}`);
    }

    // ===================== Workflow =====================
    soumettre(id: number): Observable<Inscription> {
        return this.http.put<Inscription>(`${this.apiUrl}/${id}/soumettre`, {});
    }

    validerParDirecteur(id: number, commentaire?: string): Observable<Inscription> {
        let url = `${this.apiUrl}/${id}/valider-directeur`;
        if (commentaire) {
            url += `?commentaire=${encodeURIComponent(commentaire)}`;
        }
        return this.http.put<Inscription>(url, {});
    }

    rejeterParDirecteur(id: number, motif: string): Observable<Inscription> {
        return this.http.put<Inscription>(`${this.apiUrl}/${id}/rejeter-directeur?motif=${encodeURIComponent(motif)}`, {});
    }

    validerParAdmin(id: number, commentaire?: string): Observable<Inscription> {
        let url = `${this.apiUrl}/${id}/valider-admin`;
        if (commentaire) {
            url += `?commentaire=${encodeURIComponent(commentaire)}`;
        }
        return this.http.put<Inscription>(url, {});
    }

    rejeterParAdmin(id: number, motif: string): Observable<Inscription> {
        return this.http.put<Inscription>(`${this.apiUrl}/${id}/rejeter-admin?motif=${encodeURIComponent(motif)}`, {});
    }

    // ===================== Endpoints spéciaux =====================
    getReinscriptionsEnAttenteDirecteur(directeurId: number): Observable<Inscription[]> {
        return this.http.get<Inscription[]>(`${this.apiUrl}/directeur/${directeurId}/reinscriptions-en-attente`);
    }

    getReinscriptionsEnAttenteAdmin(): Observable<Inscription[]> {
        return this.http.get<Inscription[]>(`${this.apiUrl}/admin/reinscriptions-en-attente`);
    }

    getPremieresInscriptionsEnAttenteAdmin(): Observable<Inscription[]> {
        return this.http.get<Inscription[]>(`${this.apiUrl}/admin/premieres-inscriptions-en-attente`);
    }

    // ===================== Campagnes =====================
    getAllCampagnes(): Observable<Campagne[]> {
        return this.http.get<Campagne[]>(this.campagneUrl);
    }

    getCampagneActive(): Observable<Campagne> {
        return this.http.get<Campagne>(`${this.campagneUrl}/active`);
    }

    createCampagne(campagne: Campagne): Observable<Campagne> {
        return this.http.post<Campagne>(this.campagneUrl, campagne);
    }

    updateCampagne(id: number, campagne: Partial<Campagne>): Observable<Campagne> {
        return this.http.put<Campagne>(`${this.campagneUrl}/${id}`, campagne);
    }

    // ===================== Dérogations =====================
    getAllDerogations(): Observable<Derogation[]> {
        return this.http.get<Derogation[]>(this.derogationUrl);
    }

    createDerogation(derogation: Derogation): Observable<Derogation> {
        return this.http.post<Derogation>(this.derogationUrl, derogation);
    }

    accepterDerogation(id: number, commentaire?: string): Observable<Derogation> {
        return this.http.put<Derogation>(`${this.derogationUrl}/${id}/accepter`, { commentaire });
    }

    refuserDerogation(id: number, commentaire: string): Observable<Derogation> {
        return this.http.put<Derogation>(`${this.derogationUrl}/${id}/refuser`, { commentaire });
    }
}
