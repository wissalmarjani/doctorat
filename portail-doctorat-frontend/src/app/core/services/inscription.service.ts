import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inscription, Campagne } from '../models/inscription.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = `${environment.apiUrl}/inscriptions`;
  private campagneUrl = `${environment.apiUrl}/campagnes`;

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  constructor() {}

  // --- GESTION DES CAMPAGNES (Méthodes manquantes ajoutées) ---

  getAllCampagnes(): Observable<Campagne[]> {
    return this.http.get<Campagne[]>(this.campagneUrl);
  }

  getCurrentCampagne(): Observable<Campagne> {
    return this.http.get<Campagne>(`${this.campagneUrl}/actuelle`);
  }

  getCampagneById(id: number): Observable<Campagne> {
    return this.http.get<Campagne>(`${this.campagneUrl}/${id}`);
  }

  createCampagne(campagne: any): Observable<Campagne> {
    return this.http.post<Campagne>(this.campagneUrl, campagne);
  }

  updateCampagne(id: number, campagne: any): Observable<Campagne> {
    return this.http.put<Campagne>(`${this.campagneUrl}/${id}`, campagne);
  }

  activerCampagne(id: number): Observable<Campagne> {
    return this.http.put<Campagne>(`${this.campagneUrl}/${id}/activer`, {});
  }

  // --- INSCRIPTIONS (Lecture) ---

  getAllInscriptions(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(this.apiUrl);
  }

  getInscriptionById(id: number): Observable<Inscription> {
    return this.http.get<Inscription>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupère toutes les inscriptions du doctorant connecté (basé sur le Token)
   */
  getMyInscriptions(): Observable<Inscription[]> {
    const userId = this.authService.currentUser()?.id;
    return this.http.get<Inscription[]>(`${this.apiUrl}/doctorant/${userId}`);
  }

  /**
   * Récupère la dernière inscription pour le Guard
   */
  getMyLatestInscription(): Observable<Inscription> {
    const userId = this.authService.currentUser()?.id;
    return this.http.get<Inscription>(`${this.apiUrl}/doctorant/${userId}/latest`);
  }

  /**
   * ✅ MÉTHODE AJOUTÉE : Récupérer les inscriptions d'un doctorant spécifique (Admin View)
   */
  getByDoctorant(doctorantId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/doctorant/${doctorantId}`);
  }

  /**
   * ✅ MÉTHODE AJOUTÉE : Récupérer les inscriptions pour un directeur
   */
  getInscriptionsByDirecteur(directeurId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/directeur/${directeurId}`);
  }

  getByStatut(statut: string): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/statut/${statut}`);
  }

  // --- INSCRIPTIONS (Écriture) ---

  create(inscription: any): Observable<Inscription> {
    return this.http.post<Inscription>(this.apiUrl, inscription);
  }

  update(id: number, inscription: any): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.apiUrl}/${id}`, inscription);
  }

  soumettre(id: number): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.apiUrl}/${id}/soumettre`, {});
  }

  // --- VALIDATION ADMIN / DIRECTEUR ---

  validerParDirecteur(id: number, commentaire: string): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.apiUrl}/${id}/valider-directeur`, { commentaire });
  }

  rejeterParDirecteur(id: number, commentaire: string): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.apiUrl}/${id}/rejeter-directeur`, { commentaire });
  }

  validerParAdmin(id: number, commentaire: string): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.apiUrl}/${id}/valider-admin`, { commentaire });
  }

  rejeterParAdmin(id: number, commentaire: string): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.apiUrl}/${id}/rejeter-admin`, { commentaire });
  }
}