import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { InscriptionService } from '@core/services/inscription.service';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-inscription-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="page-container">

        <!-- Hero Header -->
        <div class="hero-section">
          <div class="hero-content">
            <a routerLink="/inscriptions" class="back-btn">
              <i class="bi bi-arrow-left"></i>
            </a>
            <div class="hero-icon">
              <i class="bi bi-journal-plus"></i>
            </div>
            <div>
              <h1 class="hero-title">Demande de Réinscription</h1>
              <p class="hero-subtitle">Année universitaire {{ getCurrentAcademicYear() }}</p>
            </div>
          </div>
          <div class="hero-decoration">
            <div class="decoration-circle c1"></div>
            <div class="decoration-circle c2"></div>
          </div>
        </div>

        <!-- Alerte si pas de campagne active -->
        @if (!activeCampagne() && !isLoading()) {
          <div class="alert-banner error">
            <div class="alert-icon">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <div class="alert-content">
              <strong>Aucune campagne d'inscription ouverte</strong>
              <p>Les inscriptions sont actuellement fermées. Veuillez réessayer lorsqu'une nouvelle campagne sera ouverte.</p>
            </div>
          </div>
        }

        <!-- Info Banner avec infos campagne -->
        @if (activeCampagne()) {
          <div class="info-banner">
            <div class="info-icon">
              <i class="bi bi-info-circle"></i>
            </div>
            <div class="info-content">
              <strong>Réinscription pour la {{ getNextYear() }}ème année</strong>
              <p>
                Campagne active : <strong>{{ activeCampagne()?.titre }}</strong>
              </p>
              <p class="campagne-dates">
                <i class="bi bi-calendar-range"></i>
                Du <strong>{{ getCampagneDateOuverture() | date:'dd MMM yyyy' }}</strong>
                au <strong>{{ getCampagneDateFermeture() | date:'dd MMM yyyy' }}</strong>
              </p>
            </div>
          </div>

          <!-- Workflow Steps -->
          <div class="workflow-steps">
            <div class="step active">
              <div class="step-number">1</div>
              <div class="step-info">
                <span class="step-title">Soumission</span>
                <span class="step-desc">Vous êtes ici</span>
              </div>
            </div>
            <div class="step-connector"></div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-info">
                <span class="step-title">Validation Admin</span>
                <span class="step-desc">Vérification dossier</span>
              </div>
            </div>
            <div class="step-connector"></div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-info">
                <span class="step-title">Validation Directeur</span>
                <span class="step-desc">Approbation finale</span>
              </div>
            </div>
          </div>
        }

        <!-- Form Card -->
        @if (activeCampagne()) {
          <div class="form-card">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">

              <!-- Section: Informations de thèse -->
              <div class="form-section">
                <h3 class="section-title">
                  <i class="bi bi-journal-text"></i>
                  Informations de Thèse
                </h3>

                <div class="readonly-field">
                  <label class="field-label">Sujet de thèse</label>
                  <div class="field-value">{{ currentUser()?.sujetThese || currentUser()?.titreThese || 'À définir par votre directeur' }}</div>
                </div>

                <div class="form-row two-cols">
                  <div class="readonly-field">
                    <label class="field-label">Directeur de thèse</label>
                    <div class="field-value">{{ directeurName() }}</div>
                  </div>
                  <div class="readonly-field">
                    <label class="field-label">Année de thèse</label>
                    <div class="field-value">{{ getNextYear() }}ème année</div>
                  </div>
                </div>
              </div>

              <!-- Section: Laboratoire -->
              <div class="form-section">
                <h3 class="section-title">
                  <i class="bi bi-building"></i>
                  Laboratoire d'Accueil
                </h3>

                <div class="form-group">
                  <label class="form-label">Laboratoire <span class="required">*</span></label>
                  <input type="text" class="form-input" formControlName="laboratoireAccueil"
                         placeholder="Ex: LRIT - Laboratoire de Recherche en Informatique"
                         [class.error]="isFieldInvalid('laboratoireAccueil')">
                  @if (isFieldInvalid('laboratoireAccueil')) {
                    <span class="error-msg"><i class="bi bi-exclamation-circle"></i> Le laboratoire est obligatoire</span>
                  }
                </div>

                <div class="form-group">
                  <label class="form-label">Collaboration externe (optionnel)</label>
                  <input type="text" class="form-input" formControlName="collaborationExterne"
                         placeholder="Ex: Partenariat avec l'Université de Paris">
                </div>
              </div>

              <!-- Section: Avancement -->
              <div class="form-section">
                <h3 class="section-title">
                  <i class="bi bi-graph-up"></i>
                  Avancement des Travaux
                </h3>

                <div class="form-group">
                  <label class="form-label">Résumé de l'avancement</label>
                  <textarea class="form-input textarea" formControlName="resumeAvancement" rows="4"
                            placeholder="Décrivez brièvement l'avancement de vos travaux..."></textarea>
                </div>

                <!-- Prérequis actuels -->
                <div class="progress-section">
                  <h4 class="progress-title">Vos prérequis actuels</h4>
                  <div class="progress-grid">
                    <div class="progress-item" [class.complete]="(currentUser()?.nbPublications || 0) >= 2">
                      <div class="progress-header">
                        <span class="progress-label">Publications Q1/Q2</span>
                        <span class="progress-value">{{ currentUser()?.nbPublications || 0 }} / 2</span>
                      </div>
                      <div class="progress-bar-container">
                        <div class="progress-bar-fill" [style.width]="getProgressWidth(currentUser()?.nbPublications || 0, 2)"></div>
                      </div>
                    </div>
                    <div class="progress-item" [class.complete]="(currentUser()?.nbConferences || 0) >= 2">
                      <div class="progress-header">
                        <span class="progress-label">Conférences</span>
                        <span class="progress-value">{{ currentUser()?.nbConferences || 0 }} / 2</span>
                      </div>
                      <div class="progress-bar-container">
                        <div class="progress-bar-fill" [style.width]="getProgressWidth(currentUser()?.nbConferences || 0, 2)"></div>
                      </div>
                    </div>
                    <div class="progress-item" [class.complete]="(currentUser()?.heuresFormation || 0) >= 200">
                      <div class="progress-header">
                        <span class="progress-label">Heures de formation</span>
                        <span class="progress-value">{{ currentUser()?.heuresFormation || 0 }} / 200h</span>
                      </div>
                      <div class="progress-bar-container">
                        <div class="progress-bar-fill" [style.width]="getProgressWidth(currentUser()?.heuresFormation || 0, 200)"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="form-actions">
                <a routerLink="/inscriptions" class="btn-cancel"><i class="bi bi-x-lg"></i> Annuler</a>
                <button type="submit" class="btn-submit" [disabled]="form.invalid || isSubmitting()">
                  @if (isSubmitting()) {
                    <span class="spinner"></span> Envoi en cours...
                  } @else {
                    <i class="bi bi-send"></i> Soumettre la demande
                  }
                </button>
              </div>
            </form>
          </div>
        }

        @if (toast().show) {
          <div class="toast" [class.success]="toast().type === 'success'" [class.error]="toast().type === 'error'">
            <i class="bi" [class.bi-check-circle-fill]="toast().type === 'success'" [class.bi-x-circle-fill]="toast().type === 'error'"></i>
            {{ toast().message }}
          </div>
        }
      </div>
    </app-main-layout>
  `,
  styles: [`
    .page-container { max-width: 800px; margin: 0 auto; padding: 0 1.5rem 3rem; }
    .hero-section { background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 24px; padding: 2rem; margin-bottom: 1.5rem; position: relative; overflow: hidden; }
    .hero-content { display: flex; align-items: center; gap: 1rem; position: relative; z-index: 2; }
    .back-btn { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; }
    .hero-icon { width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; }
    .hero-title { color: white; font-size: 1.5rem; font-weight: 800; margin: 0; }
    .hero-subtitle { color: rgba(255,255,255,0.9); margin: 0.25rem 0 0; font-size: 0.9rem; }
    .hero-decoration { position: absolute; right: 0; top: 0; bottom: 0; width: 200px; }
    .decoration-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.1); }
    .c1 { width: 100px; height: 100px; top: -20px; right: 30px; }
    .c2 { width: 60px; height: 60px; bottom: -10px; right: 100px; }
    .alert-banner { display: flex; gap: 1rem; padding: 1.25rem; border-radius: 16px; margin-bottom: 1.5rem; }
    .alert-banner.error { background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 1px solid #fca5a5; }
    .alert-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
    .alert-banner.error .alert-icon { background: #ef4444; color: white; }
    .alert-content { color: #991b1b; }
    .alert-content strong { display: block; margin-bottom: 0.25rem; }
    .alert-content p { margin: 0; font-size: 0.875rem; }
    .info-banner { display: flex; gap: 1rem; padding: 1.25rem; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 1px solid #6ee7b7; border-radius: 16px; margin-bottom: 1.5rem; }
    .info-icon { width: 44px; height: 44px; background: #10b981; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; }
    .info-content { color: #065f46; flex: 1; }
    .info-content strong { margin-bottom: 0.25rem; }
    .info-content p { margin: 0; font-size: 0.875rem; line-height: 1.5; }
    .campagne-dates { display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.6); border-radius: 8px; font-size: 0.8rem !important; }
    .campagne-dates i { color: #059669; }
    .workflow-steps { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1.5rem; background: white; border-radius: 16px; margin-bottom: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; }
    .step { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 12px; background: #f8fafc; }
    .step.active { background: #ecfdf5; }
    .step-number { width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; color: #64748b; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .step.active .step-number { background: #10b981; color: white; }
    .step-info { display: flex; flex-direction: column; }
    .step-title { font-weight: 600; font-size: 0.875rem; color: #1e293b; }
    .step-desc { font-size: 0.75rem; color: #64748b; }
    .step-connector { width: 40px; height: 2px; background: #e2e8f0; }
    .form-card { background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; padding: 2rem; }
    .form-section { margin-bottom: 2rem; }
    .section-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0 0 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid #f1f5f9; }
    .section-title i { color: #10b981; }
    .readonly-field { margin-bottom: 1rem; }
    .field-label { display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 0.35rem; }
    .field-value { font-size: 1rem; font-weight: 600; color: #1e293b; padding: 0.75rem 1rem; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; }
    .form-row.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 1.25rem; }
    .form-label { font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; }
    .required { color: #ef4444; }
    .form-input { padding: 0.875rem 1rem; font-size: 0.95rem; border: 2px solid #e2e8f0; border-radius: 12px; background: #f8fafc; outline: none; transition: all 0.2s; }
    .form-input:focus { border-color: #10b981; background: white; box-shadow: 0 0 0 4px rgba(16,185,129,0.1); }
    .form-input.error { border-color: #ef4444; background: #fef2f2; }
    .form-input.textarea { resize: vertical; min-height: 100px; font-family: inherit; }
    .error-msg { display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: #ef4444; margin-top: 0.5rem; }
    .progress-section { margin-top: 1.5rem; padding: 1.25rem; background: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; }
    .progress-title { font-size: 0.9rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem; }
    .progress-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .progress-item { padding: 0.75rem; background: white; border-radius: 10px; border: 1px solid #e2e8f0; }
    .progress-item.complete { background: #f0fdf4; border-color: #86efac; }
    .progress-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
    .progress-label { font-size: 0.75rem; color: #64748b; }
    .progress-value { font-size: 0.75rem; font-weight: 600; color: #1e293b; }
    .progress-bar-container { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #10b981, #059669); border-radius: 3px; }
    .form-actions { display: flex; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid #f1f5f9; margin-top: 2rem; }
    .btn-cancel { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem 1.25rem; background: white; border: 2px solid #e2e8f0; border-radius: 12px; color: #64748b; font-weight: 600; text-decoration: none; }
    .btn-submit { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(16,185,129,0.35); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 0.75rem; font-weight: 500; box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 1000; }
    .toast.success { background: #10b981; color: white; }
    .toast.error { background: #ef4444; color: white; }
    @media (max-width: 640px) { .form-row.two-cols, .progress-grid { grid-template-columns: 1fr; } .workflow-steps { flex-direction: column; } .step-connector { width: 2px; height: 20px; } }
  `]
})
export class InscriptionFormComponent implements OnInit {
  form: FormGroup;
  isSubmitting = signal(false);
  isLoading = signal(true);
  currentUser = signal<any>(null);
  directeurName = signal('Non assigné');
  activeCampagne = signal<any>(null);
  toast = signal<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private inscriptionService: InscriptionService,
      private authService: AuthService,
      private userService: UserService
  ) {
    this.form = this.fb.group({
      laboratoireAccueil: ['', [Validators.required]],
      collaborationExterne: [''],
      resumeAvancement: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserFromDB();
    this.loadDirecteurInfo();
    this.loadActiveCampagne();
  }

  loadUserFromDB(): void {
    const user = this.authService.currentUser();
    if (user?.id) {
      this.userService.getUserById(user.id).subscribe({
        next: (freshUser) => this.currentUser.set(freshUser),
        error: () => this.currentUser.set(user)
      });
    } else {
      this.currentUser.set(user);
    }
  }

  loadActiveCampagne(): void {
    this.isLoading.set(true);
    this.inscriptionService.getAllCampagnes().subscribe({
      next: (campagnes) => {
        const active = campagnes.find((c: any) => c.active);
        this.activeCampagne.set(active || null);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadDirecteurInfo(): void {
    const user = this.authService.currentUser();
    if (user?.directeurId) {
      this.userService.getUserById(user.directeurId).subscribe({
        next: (directeur) => this.directeurName.set(`${directeur.prenom} ${directeur.nom}`),
        error: () => this.directeurName.set('Votre directeur de thèse')
      });
    }
  }

  getCampagneDateOuverture(): string {
    const c = this.activeCampagne();
    return c?.dateOuverture || c?.dateDebut || '';
  }

  getCampagneDateFermeture(): string {
    const c = this.activeCampagne();
    return c?.dateFermeture || c?.dateFin || '';
  }

  getCurrentAcademicYear(): string {
    const now = new Date();
    const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    return `${year}-${year + 1}`;
  }

  getNextYear(): number {
    return (this.currentUser()?.anneeThese || 1) + 1;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getProgressWidth(current: number, max: number): string {
    return `${Math.min((current / max) * 100, 100)}%`;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast.set({show: true, message, type});
    setTimeout(() => this.toast.set({show: false, message: '', type: 'success'}), 4000);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.activeCampagne()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const user = this.currentUser();
    const campagne = this.activeCampagne();

    const inscriptionData = {
      doctorantId: user?.id,
      directeurId: user?.directeurId,
      campagne: { id: campagne?.id },
      typeInscription: 'REINSCRIPTION',
      sujetThese: user?.sujetThese || user?.titreThese || 'Sujet à définir',
      laboratoireAccueil: this.form.value.laboratoireAccueil,
      collaborationExterne: this.form.value.collaborationExterne || null,
      anneeInscription: this.getNextYear()
    };

    this.inscriptionService.create(inscriptionData).subscribe({
      next: (inscription) => {
        this.inscriptionService.soumettre(inscription.id).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.showToast('Demande de réinscription soumise avec succès !', 'success');
            setTimeout(() => this.router.navigate(['/inscriptions']), 1500);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.showToast('Inscription créée mais erreur lors de la soumission', 'error');
            setTimeout(() => this.router.navigate(['/inscriptions']), 1500);
          }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.showToast('Erreur: ' + (err.error?.message || 'Vérifiez les données'), 'error');
      }
    });
  }
}