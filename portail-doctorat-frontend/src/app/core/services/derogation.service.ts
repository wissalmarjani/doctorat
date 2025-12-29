import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Derogation, EligibiliteReinscription, DemandeDerogationRequest } from '../models/derogation.model';

@Injectable({
  providedIn: 'root'
})
export class DerogationService {
  // ✅ CORRIGÉ: environment.inscriptionServiceUrl contient déjà /api
  private apiUrl = `${environment.inscriptionServiceUrl}/derogations`;

  constructor(private http: HttpClient) {
    console.log('📌 DerogationService API_URL:', this.apiUrl);
  }

  // ==================== DOCTORANT ====================

  verifierEligibilite(doctorantId: number): Observable<EligibiliteReinscription> {
    return this.http.get<EligibiliteReinscription>(`${this.apiUrl}/eligibilite/${doctorantId}`);
  }

  demanderDerogation(data: DemandeDerogationRequest): Observable<Derogation> {
    return this.http.post<Derogation>(this.apiUrl, data);
  }

  getMesDerogations(doctorantId: number): Observable<Derogation[]> {
    return this.http.get<Derogation[]>(`${this.apiUrl}/doctorant/${doctorantId}`);
  }

  // ==================== DIRECTEUR ====================

  /**
   * Récupérer les dérogations en attente pour un directeur
   */
  getDerogationsDirecteur(directeurId: number): Observable<Derogation[]> {
    return this.http.get<Derogation[]>(`${this.apiUrl}/directeur/${directeurId}`);
  }

  /**
   * Directeur valide une dérogation
   */
  validerParDirecteur(derogationId: number, directeurId: number, commentaire?: string): Observable<Derogation> {
    return this.http.put<Derogation>(`${this.apiUrl}/${derogationId}/valider-directeur`, {
      directeurId,
      commentaire
    });
  }

  /**
   * Directeur refuse une dérogation
   */
  refuserParDirecteur(derogationId: number, directeurId: number, commentaire: string): Observable<Derogation> {
    return this.http.put<Derogation>(`${this.apiUrl}/${derogationId}/refuser-directeur`, {
      directeurId,
      commentaire
    });
  }

  // ==================== ADMIN ====================

  /**
   * Récupérer toutes les dérogations
   */
  getAllDerogations(): Observable<Derogation[]> {
    return this.http.get<Derogation[]>(this.apiUrl);
  }

  /**
   * Récupérer les dérogations en attente admin
   */
  getDerogationsEnAttenteAdmin(): Observable<Derogation[]> {
    return this.http.get<Derogation[]>(`${this.apiUrl}/en-attente-admin`);
  }

  /**
   * Récupérer toutes les dérogations en attente
   */
  getDerogationsEnAttente(): Observable<Derogation[]> {
    return this.http.get<Derogation[]>(`${this.apiUrl}/en-attente`);
  }

  /**
   * Admin approuve une dérogation
   */
  approuverDerogation(derogationId: number, decideurId: number, commentaire?: string): Observable<Derogation> {
    return this.http.put<Derogation>(`${this.apiUrl}/${derogationId}/approuver`, {
      decideurId,
      commentaire
    });
  }

  /**
   * Admin refuse une dérogation
   */
  refuserDerogation(derogationId: number, decideurId: number, commentaire: string): Observable<Derogation> {
    return this.http.put<Derogation>(`${this.apiUrl}/${derogationId}/refuser`, {
      decideurId,
      commentaire
    });
  }

  // ==================== COMMUN ====================

  /**
   * Récupérer une dérogation par ID
   */
  getDerogationById(id: number): Observable<Derogation> {
    return this.http.get<Derogation>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer les statistiques
   */
  getStatistiques(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}