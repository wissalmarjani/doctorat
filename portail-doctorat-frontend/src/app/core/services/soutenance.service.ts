import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SoutenanceService {

    // ✅ CORRIGÉ: environment.soutenanceServiceUrl contient déjà /api
    private baseUrl = `${environment.soutenanceServiceUrl}/soutenances`;

    constructor(private http: HttpClient) {
        console.log('🔧 SoutenanceService initialized - Base URL:', this.baseUrl);
    }

    // =====================================================
    // CRUD
    // =====================================================

    getAllSoutenances(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl);
    }

    getSoutenanceById(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/${id}`);
    }

    getSoutenanceByDoctorantId(doctorantId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/doctorant/${doctorantId}`);
    }

    getSoutenancesByDirecteur(directeurId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/directeur/${directeurId}`);
    }

    // =====================================================
    // SOUMISSION DOCTORANT
    // =====================================================

    soumettreDemande(data: any, files: { manuscrit: File; rapport: File }): Observable<any> {
        const formData = new FormData();
        formData.append('titre', data.titre);
        formData.append('doctorantId', data.doctorantId.toString());
        formData.append('directeurId', data.directeurId?.toString() || '');
        formData.append('manuscrit', files.manuscrit);
        formData.append('rapportAntiPlagiat', files.rapport);
        return this.http.post<any>(`${this.baseUrl}/soumettre`, formData);
    }

    // =====================================================
    // ÉTAPE 1: DIRECTEUR - Valide les prérequis
    // SOUMIS → PREREQUIS_VALIDES
    // =====================================================

    validerPrerequisDirecteur(soutenanceId: number, commentaire?: string): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/${soutenanceId}/valider-prerequis`, {
            commentaire: commentaire || 'Prérequis validés par le directeur'
        });
    }

    rejeterDemandeDirecteur(soutenanceId: number, commentaire: string): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/${soutenanceId}/rejeter-directeur`, {
            commentaire: commentaire
        });
    }

    // Alias pour compatibilité
    validerPrerequis(soutenanceId: number): Observable<any> {
        return this.validerPrerequisDirecteur(soutenanceId);
    }

    rejeterDemande(soutenanceId: number, commentaire: string): Observable<any> {
        return this.rejeterDemandeDirecteur(soutenanceId, commentaire);
    }

    // =====================================================
    // ÉTAPE 2: DIRECTEUR - Gestion du Jury
    // PREREQUIS_VALIDES → JURY_PROPOSE
    // =====================================================

    ajouterMembreJury(soutenanceId: number, membre: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/${soutenanceId}/jury`, membre);
    }

    getMembresJury(soutenanceId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/${soutenanceId}/jury`);
    }

    supprimerMembreJury(soutenanceId: number, membreId: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/${soutenanceId}/jury/${membreId}`);
    }

    proposerJury(soutenanceId: number): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/${soutenanceId}/proposer-jury`, {});
    }

    // =====================================================
    // MEMBRES JURY DISPONIBLES (pour sélection dropdown)
    // =====================================================

    /**
     * Récupérer tous les membres du jury disponibles (non assignés)
     */
    getMembresJuryDisponibles(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/jury/disponibles`);
    }

    /**
     * Récupérer les membres du jury disponibles par rôle
     * @param role - PRESIDENT, RAPPORTEUR, EXAMINATEUR, INVITE
     */
    getMembresJuryByRole(role: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/jury/disponibles/${role}`);
    }

    // =====================================================
    // ÉTAPE 3: ADMIN - Valide ou refuse le jury
    // JURY_PROPOSE → AUTORISEE
    // =====================================================

    validerJury(soutenanceId: number, commentaire?: string): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/${soutenanceId}/valider-jury`, {
            commentaire: commentaire
        });
    }

    refuserJury(soutenanceId: number, commentaire: string): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/${soutenanceId}/refuser-jury`, {
            commentaire: commentaire
        });
    }

    // =====================================================
    // ÉTAPE 4: DIRECTEUR - Propose date de soutenance
    // =====================================================

    proposerDateSoutenance(soutenanceId: number, data: {
        dateSoutenance: string;
        heureSoutenance?: string;
        lieuSoutenance?: string;
    }): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/${soutenanceId}/proposer-date`, data);
    }

    // =====================================================
    // ÉTAPE 5: ADMIN - Planifie la soutenance
    // AUTORISEE → PLANIFIEE
    // =====================================================

    planifierSoutenance(soutenanceId: number, data: {
        dateSoutenance: string;
        heureSoutenance?: string;
        lieuSoutenance?: string;
    }): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/${soutenanceId}/planifier`, data);
    }

    refuserPlanification(soutenanceId: number, commentaire: string): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/${soutenanceId}/refuser-planification`, {
            commentaire: commentaire
        });
    }

    // =====================================================
    // ÉTAPE 6: RÉSULTAT
    // PLANIFIEE → TERMINEE
    // =====================================================

    enregistrerResultat(soutenanceId: number, data: {
        note?: number;
        mention?: string;
        felicitations?: boolean;
    }): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/${soutenanceId}/resultat`, data);
    }

    // =====================================================
    // AUTRES
    // =====================================================

    rejeterSoutenance(soutenanceId: number, motif: string): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/${soutenanceId}/rejeter`, { motif });
    }

    autoriserSoutenance(soutenanceId: number): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/${soutenanceId}/autoriser`, {});
    }

    // =====================================================
    // DOCUMENTS - URL CORRIGÉE
    // =====================================================

    /**
     * Obtenir l'URL pour afficher/télécharger un document
     * Le backend stocke: "uploads/soutenances/manuscrit_xxx.pdf"
     * L'URL doit être: /api/soutenances/files/manuscrit_xxx.pdf
     */
    getDocumentUrl(filepath: string): string {
        if (!filepath) return '';

        // Si c'est déjà une URL complète, la retourner
        if (filepath.startsWith('http')) return filepath;

        // Extraire juste le nom du fichier du chemin complet
        let filename = filepath;

        // Si le chemin contient "uploads/soutenances/", extraire le nom du fichier
        if (filepath.includes('uploads/soutenances/')) {
            filename = filepath.substring(filepath.lastIndexOf('uploads/soutenances/') + 'uploads/soutenances/'.length);
        } else if (filepath.includes('/')) {
            // Sinon prendre le dernier segment
            filename = filepath.substring(filepath.lastIndexOf('/') + 1);
        } else if (filepath.includes('\\')) {
            filename = filepath.substring(filepath.lastIndexOf('\\') + 1);
        }

        // Construire l'URL vers le FileController
        return `${this.baseUrl}/files/${encodeURIComponent(filename)}`;
    }

    /**
     * Télécharger un document en tant que Blob
     */
    downloadDocument(filepath: string): Observable<Blob> {
        const url = this.getDocumentUrl(filepath);
        return this.http.get(url, { responseType: 'blob' });
    }

    /**
     * Ouvrir un document dans un nouvel onglet
     */
    openDocument(filepath: string): void {
        const url = this.getDocumentUrl(filepath);
        window.open(url, '_blank');
    }

    // =====================================================
    // STATISTIQUES
    // =====================================================

    getStatistiques(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/statistiques`);
    }
}