import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-candidature',
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Ma Candidature</h1>
        <p>Suivez l'état de votre candidature au doctorat</p>
      </div>

      <div class="status-card" *ngIf="currentUser" [ngClass]="getStatusClass()">
        <div class="status-header">
          <span class="status-icon">📋</span>
          <h3>Statut de votre candidature</h3>
        </div>
        <div class="status-content">
          <span class="status-badge" [ngClass]="getStatusClass()">{{ getStatusText() }}</span>
          
          <div class="status-timeline">
            <div class="step" [class.completed]="isStepCompleted(1)" [class.active]="isStepActive(1)">
              <div class="step-marker">{{ isStepCompleted(1) ? '✓' : '1' }}</div>
              <span>Dossier soumis</span>
            </div>
            <div class="step-line" [class.completed]="isStepCompleted(2)"></div>
            <div class="step" [class.completed]="isStepCompleted(2)" [class.active]="isStepActive(2)">
              <div class="step-marker">{{ isStepCompleted(2) ? '✓' : '2' }}</div>
              <span>Validation Admin</span>
            </div>
            <div class="step-line" [class.completed]="isStepCompleted(3)"></div>
            <div class="step" [class.completed]="isStepCompleted(3)" [class.active]="isStepActive(3)">
              <div class="step-marker">{{ isStepCompleted(3) ? '✓' : '3' }}</div>
              <span>Validation Directeur</span>
            </div>
            <div class="step-line" [class.completed]="isStepCompleted(4)"></div>
            <div class="step" [class.completed]="isStepCompleted(4)">
              <div class="step-marker">{{ isStepCompleted(4) ? '✓' : '4' }}</div>
              <span>Accepté</span>
            </div>
          </div>

          <p class="status-message" *ngIf="currentUser.etat === 'EN_ATTENTE_ADMIN'">
            ⏳ Votre dossier est en cours d'examen par l'administration.
          </p>
          <p class="status-message" *ngIf="currentUser.etat === 'EN_ATTENTE_DIRECTEUR'">
            ⏳ Votre candidature est en attente de validation par votre directeur de thèse.
          </p>
          <p class="status-message success" *ngIf="currentUser.etat === 'VALIDE'">
            🎉 Félicitations ! Votre candidature a été acceptée.
          </p>
          <div class="status-message error" *ngIf="currentUser.motifRefus">
            <strong>⚠️ Motif du refus:</strong><br>{{ currentUser.motifRefus }}
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-container { padding: var(--spacing-xl); max-width: 800px; margin: 0 auto; }
    .page-header h1 { font-size: var(--font-size-3xl); margin-bottom: var(--spacing-xs); }
    .page-header p { color: var(--neutral-500); margin-bottom: var(--spacing-xl); }
    
    .status-card { background: white; border-radius: var(--radius-2xl); padding: var(--spacing-2xl); box-shadow: var(--shadow-card); border-left: 4px solid var(--primary-500); }
    .status-card.status-success { border-left-color: var(--success-500); }
    .status-card.status-warning { border-left-color: var(--warning-500); }
    .status-card.status-error { border-left-color: var(--error-500); }
    
    .status-header { display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-xl); }
    .status-header .status-icon { font-size: 2rem; }
    .status-header h3 { margin: 0; }
    
    .status-badge { display: inline-block; padding: var(--spacing-sm) var(--spacing-lg); border-radius: var(--radius-full); font-weight: 600; margin-bottom: var(--spacing-xl); }
    .status-badge.status-success { background: var(--success-100); color: var(--success-600); }
    .status-badge.status-warning { background: var(--warning-100); color: var(--warning-600); }
    .status-badge.status-error { background: var(--error-100); color: var(--error-600); }
    .status-badge.status-info { background: var(--primary-100); color: var(--primary-600); }
    
    .status-timeline { display: flex; align-items: center; justify-content: center; margin-bottom: var(--spacing-xl); flex-wrap: wrap; gap: var(--spacing-sm); }
    .step { display: flex; flex-direction: column; align-items: center; gap: var(--spacing-xs); }
    .step-marker { width: 36px; height: 36px; border-radius: var(--radius-full); background: var(--neutral-200); display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--neutral-500); }
    .step.active .step-marker { background: var(--primary-500); color: white; }
    .step.completed .step-marker { background: var(--success-500); color: white; }
    .step span { font-size: var(--font-size-xs); color: var(--neutral-500); text-align: center; }
    .step.active span, .step.completed span { color: var(--neutral-700); font-weight: 500; }
    .step-line { width: 40px; height: 3px; background: var(--neutral-200); margin-bottom: 24px; }
    .step-line.completed { background: var(--success-500); }
    
    .status-message { padding: var(--spacing-lg); background: var(--neutral-50); border-radius: var(--radius-lg); line-height: 1.6; }
    .status-message.success { background: var(--success-50); color: var(--success-700); }
    .status-message.error { background: var(--error-50); color: var(--error-700); }
  `]
})
export class CandidatureComponent implements OnInit {
    currentUser: User | null = null;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;
    }

    getStatusClass(): string {
        switch (this.currentUser?.etat) {
            case 'VALIDE': return 'status-success';
            case 'REFUSE': case 'REJETE': return 'status-error';
            case 'EN_ATTENTE_ADMIN': case 'EN_ATTENTE_DIRECTEUR': return 'status-warning';
            default: return 'status-info';
        }
    }

    getStatusText(): string {
        switch (this.currentUser?.etat) {
            case 'VALIDE': return '✅ Candidature acceptée';
            case 'REFUSE': case 'REJETE': return '❌ Candidature refusée';
            case 'EN_ATTENTE_ADMIN': return '⏳ En attente de validation admin';
            case 'EN_ATTENTE_DIRECTEUR': return '⏳ En attente de validation directeur';
            default: return 'En cours';
        }
    }

    isStepCompleted(step: number): boolean {
        const etat = this.currentUser?.etat;
        if (step === 1) return true; // Dossier toujours soumis
        if (step === 2) return etat === 'EN_ATTENTE_DIRECTEUR' || etat === 'VALIDE';
        if (step === 3) return etat === 'VALIDE';
        if (step === 4) return etat === 'VALIDE';
        return false;
    }

    isStepActive(step: number): boolean {
        const etat = this.currentUser?.etat;
        if (step === 2) return etat === 'EN_ATTENTE_ADMIN';
        if (step === 3) return etat === 'EN_ATTENTE_DIRECTEUR';
        return false;
    }
}
