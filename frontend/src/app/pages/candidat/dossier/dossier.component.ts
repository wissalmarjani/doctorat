import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-dossier',
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Mon Dossier</h1>
        <p>Consultez les documents de votre candidature</p>
      </div>

      <div class="dossier-grid" *ngIf="currentUser">
        <div class="info-card">
          <h4>👤 Informations personnelles</h4>
          <div class="info-row">
            <span class="label">Nom complet</span>
            <span class="value">{{ currentUser.prenom }} {{ currentUser.nom }}</span>
          </div>
          <div class="info-row">
            <span class="label">Email</span>
            <span class="value">{{ currentUser.email }}</span>
          </div>
          <div class="info-row">
            <span class="label">Téléphone</span>
            <span class="value">{{ currentUser.telephone || 'Non renseigné' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Matricule</span>
            <span class="value">{{ currentUser.matricule }}</span>
          </div>
        </div>

        <div class="documents-card">
          <h4>📁 Documents soumis</h4>
          <div class="document-item" [class.available]="currentUser.cv">
            <span class="doc-icon">📄</span>
            <div class="doc-info">
              <span class="doc-name">CV</span>
              <span class="doc-status">{{ currentUser.cv ? 'Téléchargé' : 'Non fourni' }}</span>
            </div>
            <button class="btn btn-sm btn-secondary" *ngIf="currentUser.cv">Voir</button>
          </div>
          <div class="document-item" [class.available]="currentUser.diplome">
            <span class="doc-icon">🎓</span>
            <div class="doc-info">
              <span class="doc-name">Diplôme</span>
              <span class="doc-status">{{ currentUser.diplome ? 'Téléchargé' : 'Non fourni' }}</span>
            </div>
            <button class="btn btn-sm btn-secondary" *ngIf="currentUser.diplome">Voir</button>
          </div>
          <div class="document-item" [class.available]="currentUser.lettreMotivation">
            <span class="doc-icon">✉️</span>
            <div class="doc-info">
              <span class="doc-name">Lettre de motivation</span>
              <span class="doc-status">{{ currentUser.lettreMotivation ? 'Téléchargé' : 'Optionnel' }}</span>
            </div>
            <button class="btn btn-sm btn-secondary" *ngIf="currentUser.lettreMotivation">Voir</button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-container { padding: var(--spacing-xl); max-width: 900px; margin: 0 auto; }
    .page-header h1 { font-size: var(--font-size-3xl); margin-bottom: var(--spacing-xs); }
    .page-header p { color: var(--neutral-500); margin-bottom: var(--spacing-xl); }
    
    .dossier-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: var(--spacing-xl); }
    
    .info-card, .documents-card { background: white; border-radius: var(--radius-xl); padding: var(--spacing-xl); box-shadow: var(--shadow-card); }
    .info-card h4, .documents-card h4 { margin-bottom: var(--spacing-lg); color: var(--neutral-700); }
    
    .info-row { display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--neutral-100); }
    .info-row:last-child { border-bottom: none; }
    .info-row .label { color: var(--neutral-500); font-size: var(--font-size-sm); }
    .info-row .value { font-weight: 500; }
    
    .document-item { display: flex; align-items: center; gap: var(--spacing-md); padding: var(--spacing-md); background: var(--neutral-50); border-radius: var(--radius-lg); margin-bottom: var(--spacing-sm); }
    .document-item.available { background: var(--success-50); }
    .document-item:last-child { margin-bottom: 0; }
    .doc-icon { font-size: 1.5rem; }
    .doc-info { flex: 1; }
    .doc-name { display: block; font-weight: 500; }
    .doc-status { font-size: var(--font-size-xs); color: var(--neutral-500); }
    .document-item.available .doc-status { color: var(--success-600); }
  `]
})
export class DossierComponent implements OnInit {
    currentUser: User | null = null;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;
    }
}
