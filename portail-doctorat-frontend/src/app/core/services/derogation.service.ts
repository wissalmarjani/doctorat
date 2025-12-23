import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Derogation, EligibiliteReinscription } from '../models/derogation.model';

@Injectable({
  providedIn: 'root'
})
export class DerogationService {
  // Pointe vers le port 8082 (Inscription Service qui gère les dérogations)
  // ou 8080 (Gateway)
  private apiUrl = `${environment.inscriptionServiceUrl}/derogations`;

  constructor(private http: HttpClient) {}

  // --- PARTIE DOCTORANT ---

  verifierEligibilite(doctorantId: number): Observable<EligibiliteReinscription> {
    return this.http.get<EligibiliteReinscription>(`${this.apiUrl}/eligibilite/${doctorantId}`);
  }

  demanderDerogation(data: any): Observable<Derogation> {
    return this.http.post<Derogation>(this.apiUrl, data);
  }

  getMesDerogations(doctorantId: number): Observable<Derogation[]> {
    return this.http.get<Derogation[]>(`${this.apiUrl}/doctorant/${doctorantId}`);
  }

  // --- PARTIE ADMIN (C'est ce qui manquait !) ---

  /** Récupérer TOUTES les dérogations */
  getAllDerogations(): Observable<Derogation[]> {
    return this.http.get<Derogation[]>(this.apiUrl);
  }

  /** Valider une dérogation */
  validerDerogation(id: number, commentaire: string): Observable<Derogation> {
    return this.http.put<Derogation>(`${this.apiUrl}/${id}/valider`, { commentaire });
  }

  /** Refuser une dérogation */
  refuserDerogation(id: number, commentaire: string): Observable<Derogation> {
    return this.http.put<Derogation>(`${this.apiUrl}/${id}/refuser`, { commentaire });
  }
}