import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inscription, Campagne } from '../models/inscription.model';

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  // ✅ CORRIGÉ: environment.inscriptionServiceUrl contient déjà /api
  // Donc on n'ajoute PAS /api ici
  private readonly API_URL = `${environment.inscriptionServiceUrl}/inscriptions`;
  private readonly CAMPAGNE_URL = `${environment.inscriptionServiceUrl}/campagnes`;

  constructor(private http: HttpClient) {
    console.log('📌 InscriptionService API_URL:', this.API_URL);
    console.log('📌 InscriptionService CAMPAGNE_URL:', this.CAMPAGNE_URL);
  }

  // =============================================================
  // CRUD INSCRIPTIONS
  // =============================================================

  create(inscription: any): Observable<Inscription> {
    return this.http.post<Inscription>(this.API_URL, inscription);
  }

  /**
   * Récupère toutes les inscriptions (pour admin)
   */
  getAll(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(this.API_URL);
  }

  /**
   * Alias pour getAll() - pour compatibilité avec les composants existants
   */
  getAllInscriptions(): Observable<Inscription[]> {
    return this.getAll();
  }

  /**
   * Récupère une inscription par son ID
   */
  getById(id: number): Observable<Inscription> {
    return this.http.get<Inscription>(`${this.API_URL}/${id}`);
  }

  /**
   * Alias pour getById() - pour compatibilité avec les composants existants
   */
  getInscriptionById(id: number): Observable<Inscription> {
    return this.getById(id);
  }

  update(id: number, inscription: any): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.API_URL}/${id}`, inscription);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // =============================================================
  // REQUÊTES SPÉCIFIQUES
  // =============================================================

  getByDoctorant(doctorantId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.API_URL}/doctorant/${doctorantId}`);
  }

  /**
   * Récupère les inscriptions du doctorant connecté
   */
  getMyInscriptions(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.API_URL}/mes-inscriptions`);
  }

  /**
   * Récupère les inscriptions supervisées par un directeur
   */
  getInscriptionsByDirecteur(directeurId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.API_URL}/directeur/${directeurId}`);
  }

  /**
   * Alias pour getInscriptionsByDirecteur
   */
  getByDirecteur(directeurId: number): Observable<Inscription[]> {
    return this.getInscriptionsByDirecteur(directeurId);
  }

  getByStatut(statut: string): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.API_URL}/statut/${statut}`);
  }

  getByCampagne(campagneId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.API_URL}/campagne/${campagneId}`);
  }

  getByType(type: string): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.API_URL}/type/${type}`);
  }

  // =============================================================
  // WORKFLOW - SOUMISSION
  // =============================================================

  soumettre(id: number): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.API_URL}/${id}/soumettre`, {});
  }

  // =============================================================
  // WORKFLOW - VALIDATION DIRECTEUR
  // =============================================================

  validerParDirecteur(id: number, commentaire?: string): Observable<Inscription> {
    const params = commentaire ? `?commentaire=${encodeURIComponent(commentaire)}` : '';
    return this.http.put<Inscription>(`${this.API_URL}/${id}/valider-directeur${params}`, {});
  }

  rejeterParDirecteur(id: number, motif: string): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.API_URL}/${id}/rejeter-directeur?motif=${encodeURIComponent(motif)}`, {});
  }

  // =============================================================
  // WORKFLOW - VALIDATION ADMIN
  // =============================================================

  validerParAdmin(id: number, commentaire?: string): Observable<Inscription> {
    const params = commentaire ? `?commentaire=${encodeURIComponent(commentaire)}` : '';
    return this.http.put<Inscription>(`${this.API_URL}/${id}/valider-admin${params}`, {});
  }

  rejeterParAdmin(id: number, motif: string): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.API_URL}/${id}/rejeter-admin?motif=${encodeURIComponent(motif)}`, {});
  }

  // =============================================================
  // ENDPOINTS SPÉCIAUX - DIRECTEUR
  // =============================================================

  /**
   * Réinscriptions en attente de validation par un directeur
   */
  getReinscritionsEnAttenteDirecteur(directeurId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.API_URL}/directeur/${directeurId}/reinscriptions-en-attente`);
  }

  // =============================================================
  // ENDPOINTS SPÉCIAUX - ADMIN
  // =============================================================

  /**
   * Réinscriptions en attente de validation admin (après validation directeur)
   */
  getReinscritionsEnAttenteAdmin(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.API_URL}/admin/reinscriptions-en-attente`);
  }

  /**
   * Premières inscriptions en attente de validation admin
   */
  getPremieresInscriptionsEnAttenteAdmin(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.API_URL}/admin/premieres-inscriptions-en-attente`);
  }

  // =============================================================
  // CAMPAGNES
  // =============================================================

  getAllCampagnes(): Observable<Campagne[]> {
    return this.http.get<Campagne[]>(this.CAMPAGNE_URL);
  }

  getCampagneById(id: number): Observable<Campagne> {
    return this.http.get<Campagne>(`${this.CAMPAGNE_URL}/${id}`);
  }

  getCampagneActive(): Observable<Campagne> {
    return this.http.get<Campagne>(`${this.CAMPAGNE_URL}/active`);
  }

  createCampagne(campagne: any): Observable<Campagne> {
    return this.http.post<Campagne>(this.CAMPAGNE_URL, campagne);
  }

  updateCampagne(id: number, campagne: any): Observable<Campagne> {
    return this.http.put<Campagne>(`${this.CAMPAGNE_URL}/${id}`, campagne);
  }

  activerCampagne(id: number): Observable<Campagne> {
    return this.http.put<Campagne>(`${this.CAMPAGNE_URL}/${id}/activer`, {});
  }

  deleteCampagne(id: number): Observable<void> {
    return this.http.delete<void>(`${this.CAMPAGNE_URL}/${id}`);
  }
}