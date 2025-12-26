import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Soutenance } from '../models/soutenance.model';

@Injectable({
    providedIn: 'root'
})
export class SoutenanceService {

    // URL de base vers le microservice soutenance
    private baseUrl = `${environment.userServiceUrl}/soutenances`;

    constructor(private http: HttpClient) {}

    // =====================================================
    // MÉTHODES GÉNÉRALES / ADMIN
    // =====================================================

    /** Récupérer toutes les soutenances */
    getAllSoutenances(): Observable<Soutenance[]> {
        return this.http.get<Soutenance[]>(this.baseUrl);
    }

    /** Récupérer une soutenance par son ID */
    getSoutenanceById(id: number): Observable<Soutenance> {
        return this.http.get<Soutenance>(`${this.baseUrl}/${id}`);
    }

    /** Mettre à jour une soutenance */
    updateSoutenance(id: number, data: Partial<Soutenance>): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.baseUrl}/${id}`, data);
    }

    /** Assigner un directeur à une soutenance (Admin) */
    assignerDirecteur(soutenanceId: number, directeurId: number): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.baseUrl}/${soutenanceId}/assigner-directeur`, { directeurId });
    }

    /** Valider les prérequis d'une soutenance (Admin) */
    validerPrerequis(soutenanceId: number): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.baseUrl}/${soutenanceId}/valider-prerequis`, {});
    }

    /** Rejeter une demande de soutenance (Admin) */
    rejeterDemande(soutenanceId: number, motif: string): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.baseUrl}/${soutenanceId}/rejeter`, { motif });
    }

    /** Planifier une soutenance (Admin) */
    planifierSoutenance(soutenanceId: number, data: {
        dateSoutenance: string;
        heureSoutenance: string;
        lieuSoutenance: string;
    }): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.baseUrl}/${soutenanceId}/planifier`, data);
    }

    /** Autoriser une soutenance (Admin) */
    autoriserSoutenance(soutenanceId: number): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.baseUrl}/${soutenanceId}/autoriser`, {});
    }

    /** Marquer une soutenance comme terminée (Admin) */
    terminerSoutenance(soutenanceId: number, data: {
        mention: string;
        noteFinale?: number;
        felicitationsJury?: boolean;
    }): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.baseUrl}/${soutenanceId}/terminer`, data);
    }

    // =====================================================
    // MÉTHODES POUR LE DIRECTEUR DE THÈSE
    // =====================================================

    /** Récupérer uniquement les soutenances encadrées par ce directeur */
    getSoutenancesByDirecteur(directeurId: number): Observable<Soutenance[]> {
        return this.http.get<Soutenance[]>(`${this.baseUrl}/directeur/${directeurId}`);
    }

    /** Ajouter un membre au jury d'une soutenance spécifique */
    ajouterMembreJury(soutenanceId: number, membre: any): Observable<Soutenance> {
        return this.http.post<Soutenance>(`${this.baseUrl}/${soutenanceId}/jury`, membre);
    }

    /** Supprimer un membre du jury */
    supprimerMembreJury(soutenanceId: number, membreId: number): Observable<Soutenance> {
        return this.http.delete<Soutenance>(`${this.baseUrl}/${soutenanceId}/jury/${membreId}`);
    }

    /**
     * Valider la proposition de jury et envoyer le dossier à l'administration
     * (Passe le statut à JURY_PROPOSE)
     */
    proposerJury(soutenanceId: number): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.baseUrl}/${soutenanceId}/proposer-jury`, {});
    }

    // =====================================================
    // MÉTHODES POUR LE DOCTORANT
    // =====================================================

    /**
     * Permet au doctorant de soumettre sa demande initiale
     * (envoi multipart/form-data)
     */
    soumettreDemande(
        data: any,
        files: { manuscrit: File; rapport: File }
    ): Observable<Soutenance> {

        const formData = new FormData();

        // Données textuelles
        formData.append('titre', data.titre);
        formData.append('doctorantId', data.doctorantId.toString());
        formData.append('directeurId', data.directeurId.toString());

        // Fichiers
        formData.append('manuscrit', files.manuscrit);
        formData.append('rapportAntiPlagiat', files.rapport);

        return this.http.post<Soutenance>(
            `${this.baseUrl}/soumettre`,
            formData
        );
    }

    /** Récupérer la soutenance d'un doctorant spécifique */
    getSoutenanceByDoctorantId(id: number): Observable<Soutenance[]> {
        return this.http.get<Soutenance[]>(`${this.baseUrl}/doctorant/${id}`);
    }

    /** Créer une nouvelle demande de soutenance (brouillon) */
    creerDemande(data: {
        doctorantId: number;
        sujetThese: string;
        prerequis?: {
            nombreArticlesQ1Q2: number;
            nombreConferences: number;
            heuresFormation: number;
        };
    }): Observable<Soutenance> {
        return this.http.post<Soutenance>(this.baseUrl, data);
    }

    /** Soumettre une demande existante (passer de BROUILLON à SOUMIS) */
    soumettreDemandeExistante(soutenanceId: number): Observable<Soutenance> {
        return this.http.put<Soutenance>(`${this.baseUrl}/${soutenanceId}/soumettre`, {});
    }
}