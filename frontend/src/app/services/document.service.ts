import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
    Document,
    DocumentMetadata,
    UploadedDocument,
    AttestationInscriptionRequest,
    AutorisationSoutenanceRequest,
    ProcesVerbalRequest,
    DocumentResponse,
    DocumentStats
} from '../models/document.model';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private apiUrl = `${environment.documentServiceUrl}/api/documents`;

    constructor(private http: HttpClient) { }

    // ===================== CRUD =====================
    getAll(): Observable<DocumentMetadata[]> {
        return this.http.get<Document[]>(this.apiUrl).pipe(
            map(docs => docs.map(d => ({
                id: d.id,
                nom: d.fileName,
                type: d.documentType,
                userId: d.userId || 0,
                createdAt: d.createdAt || new Date()
            })))
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // ===================== Upload =====================
    uploadDocument(file: File): Observable<UploadedDocument> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<UploadedDocument>(`${this.apiUrl}/upload`, formData);
    }

    getUploadedDocument(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}`, { responseType: 'blob' });
    }

    // ===================== Génération de documents =====================
    generateAttestationInscription(request: AttestationInscriptionRequest): Observable<DocumentResponse> {
        return this.http.post<DocumentResponse>(`${this.apiUrl}/attestation-inscription`, request);
    }

    generateInscriptionAttestation(userId: number): Observable<any> {
        return this.generateAttestationInscription({ userId, inscriptionId: 0 }); // Handle ID properly on backend
    }

    generateAutorisationSoutenance(request: AutorisationSoutenanceRequest): Observable<DocumentResponse> {
        return this.http.post<DocumentResponse>(`${this.apiUrl}/autorisation-soutenance`, request);
    }

    generateProcesVerbal(request: ProcesVerbalRequest): Observable<DocumentResponse> {
        return this.http.post<DocumentResponse>(`${this.apiUrl}/proces-verbal`, request);
    }

    // ===================== Téléchargement =====================
    downloadDocument(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/download/${id}`, { responseType: 'blob' });
    }

    download(id: number): Observable<Blob> {
        return this.downloadDocument(id).pipe(
            map(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `document_${id}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);
                return blob;
            })
        );
    }

    previewDocument(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/preview/${id}`, { responseType: 'blob' });
    }

    // ===================== Consultation =====================
    getDocumentInfo(id: number): Observable<Document> {
        return this.http.get<Document>(`${this.apiUrl}/info/${id}`);
    }

    getDocumentsByUser(userId: number): Observable<Document[]> {
        return this.http.get<Document[]>(`${this.apiUrl}/user/${userId}`);
    }

    getDocumentsByType(type: string): Observable<Document[]> {
        return this.http.get<Document[]>(`${this.apiUrl}/type/${type}`);
    }

    getDocumentsByReference(type: string, id: number): Observable<Document[]> {
        return this.http.get<Document[]>(`${this.apiUrl}/reference/${type}/${id}`);
    }

    // ===================== Statistiques =====================
    getStatistics(): Observable<DocumentStats> {
        return this.http.get<DocumentStats>(`${this.apiUrl}/stats`);
    }

    // ===================== Utilitaires =====================
    downloadAndSave(id: number, fileName: string): void {
        this.downloadDocument(id).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            window.URL.revokeObjectURL(url);
        });
    }

    openInNewTab(id: number): void {
        this.previewDocument(id).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        });
    }
}
