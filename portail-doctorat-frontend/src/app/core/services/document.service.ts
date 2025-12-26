import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthService } from './auth.service'; // pour récupérer le JWT

@Injectable({ providedIn: 'root' })
export class DocumentService {

  // Pointe vers ton micro-service Document
  private apiUrl = environment.documentServiceUrl || 'http://localhost:8081/api/files';

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Récupère un PDF depuis le backend avec JWT
   * @param filename Nom du fichier stocké dans la DB
   */
  getFile(filename: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.get(`${this.apiUrl}/${filename}`, {
      responseType: 'blob',
      headers
    });
  }

  /**
   * Ouvre un fichier PDF dans un nouvel onglet
   * @param filename Nom du fichier
   */
  openFile(filename: string) {
    this.getFile(filename).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Erreur ouverture PDF :', err)
    });
  }

  /**
   * Télécharge un fichier PDF
   * @param filename Nom du fichier
   */
  downloadFile(filename: string) {
    this.getFile(filename).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Erreur téléchargement PDF :', err)
    });
  }

  /**
   * Pour uploader un fichier (existant)
   */
  upload(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.post<any>(`${this.apiUrl}/upload`, formData, { headers });
  }
}
