import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { InscriptionService } from '@core/services/inscription.service';
import { AuthService } from '@core/services/auth.service';

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

        <!-- Info Banner -->
        <div class="info-banner">
          <div class="info-icon">
            <i class="bi bi-info-circle"></i>
          </div>
          <div class="info-content">
            <strong>Réinscription pour la {{ getNextYear() }}ème année</strong>
            <p>
              Votre sujet de thèse a été défini lors de votre première inscription :
              <strong>"{{ currentUser()?.sujetThese || 'Non défini' }}"</strong>
            </p>
          </div>
        </div>

        <!-- Form Card -->
        <div class="form-card">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Section: Informations de thèse (readonly) -->
            <div class="form-section">
              <h3 class="section-title">
                <i class="bi bi-journal-text"></i>
                Informations de Thèse
              </h3>

              <div class="readonly-field">
                <label class="field-label">Sujet de thèse</label>
                <div class="field-value">{{ currentUser()?.sujetThese || 'À définir par votre directeur' }}</div>
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
                <label class="form-label">
                  Laboratoire
                  <span class="required">*</span>
                </label>
                <input
                    type="text"
                    class="form-input"
                    formControlName="laboratoireAccueil"
                    placeholder="Ex: LRIT - Laboratoire de Recherche en Informatique et Télécommunications"
                    [class.error]="isFieldInvalid('laboratoireAccueil')">
                @if (isFieldInvalid('laboratoireAccueil')) {
                  <span class="error-msg">
                    <i class="bi bi-exclamation-circle"></i>
                    Le laboratoire est obligatoire
                  </span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">
                  Collaboration externe (optionnel)
                </label>
                <input
                    type="text"
                    class="form-input"
                    formControlName="collaborationExterne"
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
                <label class="form-label">
                  Résumé de l'avancement
                </label>
                <textarea
                    class="form-input textarea"
                    formControlName="resumeAvancement"
                    rows="4"
                    placeholder="Décrivez brièvement l'avancement de vos travaux de recherche cette année...">
                </textarea>
              </div>

              <!-- Prérequis actuels -->
              <div class="progress-section">
                <h4 class="progress-title">Vos prérequis actuels</h4>
                <div class="progress-grid">
                  <div class="progress-item">
                    <div class="progress-header">
                      <span class="progress-label">Publications Q1/Q2</span>
                      <span class="progress-value">{{ currentUser()?.nbPublications || 0 }} / 2</span>
                    </div>
                    <div class="progress-bar-container">
                      <div class="progress-bar-fill" [style.width]="getProgressWidth(currentUser()?.nbPublications || 0, 2)"></div>
                    </div>
                  </div>
                  <div class="progress-item">
                    <div class="progress-header">
                      <span class="progress-label">Conférences</span>
                      <span class="progress-value">{{ currentUser()?.nbConferences || 0 }} / 2</span>
                    </div>
                    <div class="progress-bar-container">
                      <div class="progress-bar-fill" [style.width]="getProgressWidth(currentUser()?.nbConferences || 0, 2)"></div>
                    </div>
                  </div>
                  <div class="progress-item">
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
              <a routerLink="/inscriptions" class="btn-cancel">
                <i class="bi bi-x-lg"></i>
                Annuler
              </a>
              <button
                  type="button"
                  class="btn-draft"
                  (click)="saveDraft()"
                  [disabled]="isSubmitting()">
                <i class="bi bi-save"></i>
                Enregistrer brouillon
              </button>
              <button
                  type="submit"
                  class="btn-submit"
                  [disabled]="form.invalid || isSubmitting()">
                @if (isSubmitting()) {
                  <span class="spinner"></span>
                  Envoi...
                } @else {
                  <i class="bi bi-send"></i>
                  Soumettre
                }
              </button>
            </div>

          </form>
        </div>

      </div>
    </app-main-layout>
  `,
  styles: [`
    .page-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 1.5rem 3rem;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 24px;
      padding: 2rem;
      margin-bottom: 1.5rem;
      position: relative;
      overflow: hidden;
    }

    .hero-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
      z-index: 2;
    }

    .back-btn {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-decoration: none;
      transition: all 0.2s;
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .hero-icon {
      width: 56px;
      height: 56px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .hero-title {
      color: white;
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0;
    }

    .hero-subtitle {
      color: rgba(255, 255, 255, 0.9);
      margin: 0.25rem 0 0;
      font-size: 0.9rem;
    }

    .hero-decoration {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 200px;
    }

    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }

    .c1 { width: 100px; height: 100px; top: -20px; right: 30px; }
    .c2 { width: 60px; height: 60px; bottom: -10px; right: 100px; }

    /* Info Banner */
    .info-banner {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1px solid #6ee7b7;
      border-radius: 16px;
      margin-bottom: 1.5rem;
    }

    .info-icon {
      width: 44px;
      height: 44px;
      background: #10b981;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .info-content {
      color: #065f46;
    }

    .info-content strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .info-content p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    /* Form Card */
    .form-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      padding: 2rem;
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section:last-of-type {
      margin-bottom: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .section-title i {
      color: #10b981;
    }

    /* Readonly Fields */
    .readonly-field {
      margin-bottom: 1rem;
    }

    .field-label {
      display: block;
      font-size: 0.8rem;
      color: #64748b;
      margin-bottom: 0.35rem;
    }

    .field-value {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }

    .form-row {
      margin-bottom: 1.25rem;
    }

    .form-row.two-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 1.25rem;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .required {
      color: #ef4444;
      margin-left: 0.25rem;
    }

    .form-input {
      padding: 0.875rem 1rem;
      font-size: 0.95rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      background: #f8fafc;
      transition: all 0.2s;
      outline: none;
    }

    .form-input:focus {
      border-color: #10b981;
      background: white;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
    }

    .form-input.error {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .form-input.textarea {
      resize: vertical;
      min-height: 100px;
    }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: #ef4444;
      margin-top: 0.5rem;
    }

    /* Progress Section */
    .progress-section {
      margin-top: 1.5rem;
      padding: 1.25rem;
      background: #f8fafc;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
    }

    .progress-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 1rem;
    }

    .progress-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .progress-item {
      padding: 0.75rem;
      background: white;
      border-radius: 10px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .progress-label {
      font-size: 0.75rem;
      color: #64748b;
    }

    .progress-value {
      font-size: 0.75rem;
      font-weight: 600;
      color: #1e293b;
    }

    .progress-bar-container {
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      border-radius: 3px;
      transition: width 0.3s;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 2px solid #f1f5f9;
      margin-top: 2rem;
    }

    .btn-cancel {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.25rem;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      color: #64748b;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .btn-draft {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.25rem;
      background: #f1f5f9;
      border: none;
      border-radius: 12px;
      color: #475569;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-draft:hover:not(:disabled) {
      background: #e2e8f0;
    }

    .btn-submit {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.25rem;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
    }

    .btn-submit:disabled, .btn-draft:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 640px) {
      .form-row.two-cols {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .progress-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InscriptionFormComponent implements OnInit {
  form: FormGroup;
  isSubmitting = signal(false);
  currentUser = signal<any>(null);
  directeurName = signal('Non assigné');

  constructor(
      private fb: FormBuilder,
      private router: Router,
      private route: ActivatedRoute,
      private inscriptionService: InscriptionService,
      private authService: AuthService
  ) {
    this.form = this.fb.group({
      laboratoireAccueil: ['', [Validators.required]],
      collaborationExterne: [''],
      resumeAvancement: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());
    this.loadDirecteurInfo();
  }

  loadDirecteurInfo(): void {
    const user = this.currentUser();
    if (user?.directeurId) {
      // Charger les infos du directeur si nécessaire
      // Pour l'instant on suppose que le nom est déjà dans le currentUser
      this.directeurName.set('Votre directeur de thèse');
    }
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
    const percentage = Math.min((current / max) * 100, 100);
    return `${percentage}%`;
  }

  saveDraft(): void {
    this.isSubmitting.set(true);

    const data = {
      ...this.form.value,
      typeInscription: 'REINSCRIPTION',
      sujetThese: this.currentUser()?.sujetThese,
      doctorantId: this.currentUser()?.id,
      directeurId: this.currentUser()?.directeurId
    };

    this.inscriptionService.create(data).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        alert('Brouillon enregistré !');
        this.router.navigate(['/inscriptions']);
      },
      error: (err) => {
        console.error('Erreur sauvegarde:', err);
        this.isSubmitting.set(false);
        alert('Erreur lors de la sauvegarde');
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const data = {
      ...this.form.value,
      typeInscription: 'REINSCRIPTION',
      sujetThese: this.currentUser()?.sujetThese,
      doctorantId: this.currentUser()?.id,
      directeurId: this.currentUser()?.directeurId,
      statut: 'SOUMIS'
    };

    this.inscriptionService.create(data).subscribe({
      next: (inscription) => {
        // Soumettre directement
        this.inscriptionService.soumettre(inscription.id).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            alert('Demande de réinscription soumise avec succès !');
            this.router.navigate(['/inscriptions']);
          },
          error: (err) => {
            console.error('Erreur soumission:', err);
            this.isSubmitting.set(false);
            alert('Inscription créée mais erreur lors de la soumission');
            this.router.navigate(['/inscriptions']);
          }
        });
      },
      error: (err) => {
        console.error('Erreur création:', err);
        this.isSubmitting.set(false);
        alert('Erreur lors de la création de l\'inscription');
      }
    });
  }
}