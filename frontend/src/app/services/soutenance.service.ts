import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Soutenance, MembreJury, JuryDisponible, PlanificationRequest, ResultatRequest } from '../models/soutenance.model';

@Injectable({
    providedIn: 'root'
})
export class SoutenanceService {
    private apiUrl = `${environment.soutenanceServiceUrl}/api/soutenances`;

    constructor(private http: HttpClient) { }

    // ===================== CRUD =====================
    create(soutenance: Soutenance): Observable<Soutenance> {
        return this.http.post<Soutenance>(this.apiUrl, soutenance);
    }

    soumettreDemande(titre: string, doctorantId: number, directeurId: number,
        manuscrit: File, rapportAntiPlagiat: File, autorisation?: File): Observable<Soutenance> {
        const formData = new FormData();
        formData.append('titre', titre);
        formData.append('doctorantId', doctorantId.toString());
        formData.append('directeurId', directeurId.toString());
        formData.append('manuscrit', manuscrit);
        formData.append('rapportAntiPlagiat', rapportAntiPlagiat);
        if (autorisation) {
            formData.append('autorisation', autorisation);
        }
        return this.http.post<Soutenance>(`${this.apiUrl}/soumettre`, formData);
    }

    getAll(): Observable<Soutenance[]> {
        return this.http.get<Soutenance[]>(this.apiUrl);
    }

    getById(id: number): Observable<Soutenance> {
        return this.http.get<Soutenance>(`${this.apiUrl}/${id}`);
    }

    update(id: number, soutenance: Partial<Soutenance>): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.apiUrl}/${id}`, soutenance);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // ===================== Requêtes spécifiques =====================
    getByDoctorant(doctorantId: number): Observable<Soutenance[]> {
        return this.http.get<Soutenance[]>(`${this.apiUrl}/doctorant/${doctorantId}`);
    }

    getByDirecteur(directeurId: number): Observable<Soutenance[]> {
        return this.http.get<Soutenance[]>(`${this.apiUrl}/directeur/${directeurId}`);
    }

    getByStatut(statut: string): Observable<Soutenance[]> {
        return this.http.get<Soutenance[]>(`${this.apiUrl}/statut/${statut}`);
    }

    // ===================== Workflow Directeur =====================
    validerPrerequis(id: number, commentaire?: string): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.apiUrl}/${id}/valider-prerequis`, { commentaire });
    }

    rejeterParDirecteur(id: number, commentaire: string): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.apiUrl}/${id}/rejeter-directeur`, { commentaire });
    }

    // ===================== Workflow Admin =====================
    autoriserSoutenance(id: number, commentaire?: string): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.apiUrl}/${id}/autoriser`, { commentaire });
    }

    // ===================== Gestion du Jury =====================
    getJurysDisponibles(): Observable<JuryDisponible[]> {
        return this.http.get<JuryDisponible[]>(`${this.apiUrl}/jury/disponibles`);
    }

    getJuryDisponiblesByRole(role: string): Observable<JuryDisponible[]> {
        return this.http.get<JuryDisponible[]>(`${this.apiUrl}/jury/disponibles/${role}`);
    }

    ajouterMembreJury(soutenanceId: number, membre: MembreJury): Observable<Soutenance> {
        return this.http.post<Soutenance>(`${this.apiUrl}/${soutenanceId}/jury`, membre);
    }

    getMembresJury(soutenanceId: number): Observable<MembreJury[]> {
        return this.http.get<MembreJury[]>(`${this.apiUrl}/${soutenanceId}/jury`);
    }

    supprimerMembreJury(soutenanceId: number, membreId: number): Observable<Soutenance> {
        return this.http.delete<Soutenance>(`${this.apiUrl}/${soutenanceId}/jury/${membreId}`);
    }

    proposerJury(id: number): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.apiUrl}/${id}/proposer-jury`, {});
    }

    validerJury(id: number, commentaire?: string): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.apiUrl}/${id}/valider-jury`, { commentaire });
    }

    refuserJury(id: number, commentaire: string): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.apiUrl}/${id}/refuser-jury`, { commentaire });
    }

    // ===================== Planification =====================
    proposerDate(id: number, planification: PlanificationRequest): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.apiUrl}/${id}/proposer-date`, planification);
    }

    planifierSoutenance(id: number, planification: PlanificationRequest): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.apiUrl}/${id}/planifier`, planification);
    }

    refuserPlanification(id: number, commentaire: string): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.apiUrl}/${id}/refuser-planification`, { commentaire });
    }

    // ===================== Résultat =====================
    enregistrerResultat(id: number, resultat: ResultatRequest): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.apiUrl}/${id}/resultat`, resultat);
    }

    rejeterSoutenance(id: number, motif: string): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.apiUrl}/${id}/rejeter`, { motif });
    }

    // ===================== Rapports =====================
    soumettreRapport(soutenanceId: number, membreJuryId: number, avisFavorable: boolean, commentaire?: string): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.apiUrl}/${soutenanceId}/jury/${membreJuryId}/rapport`, {
            avisFavorable,
            commentaire
        });
    }
}
