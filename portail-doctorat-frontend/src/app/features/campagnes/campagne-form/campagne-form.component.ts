import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { InscriptionService } from '@core/services/inscription.service';
import { Campagne } from '@core/models/inscription.model';

@Component({
    selector: 'app-campagne-form',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, MainLayoutComponent],
    template: `
        <app-main-layout>
            <div class="page-container">

                <!-- Hero Header -->
                <div class="hero-section">
                    <div class="hero-content">
                        <a routerLink="/admin/campagnes" class="back-btn">
                            <i class="bi bi-arrow-left"></i>
                        </a>
                        <div class="hero-icon">
                            <i class="bi" [class]="isEditMode() ? 'bi-pencil-square' : 'bi-calendar-plus'"></i>
                        </div>
                        <div>
                            <h1 class="hero-title">{{ isEditMode() ? 'Modifier la Campagne' : 'Nouvelle Campagne' }}</h1>
                            <p class="hero-subtitle">{{ isEditMode() ? 'Modifiez les informations de la campagne' : 'Créez une nouvelle période d\\'inscription' }}</p>
                        </div>
                    </div>
                    <div class="hero-decoration">
                        <div class="decoration-circle c1"></div>
                        <div class="decoration-circle c2"></div>
                    </div>
                </div>

                <!-- Form Card -->
                <div class="form-card">
                    <form [formGroup]="form" (ngSubmit)="onSubmit()">

                        <!-- Section: Informations générales -->
                        <div class="form-section">
                            <h3 class="section-title">
                                <i class="bi bi-info-circle"></i>
                                Informations Générales
                            </h3>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">
                                        Titre de la campagne
                                        <span class="required">*</span>
                                    </label>
                                    <input
                                            type="text"
                                            class="form-input"
                                            formControlName="titre"
                                            placeholder="Ex: Campagne d'inscription Doctorat 2024-2025"
                                            [class.error]="isFieldInvalid('titre')">
                                    @if (isFieldInvalid('titre')) {
                                        <span class="error-msg">
                      <i class="bi bi-exclamation-circle"></i>
                      Le titre est obligatoire
                    </span>
                                    }
                                </div>
                            </div>

                            <div class="form-row two-cols">
                                <div class="form-group">
                                    <label class="form-label">
                                        Année universitaire
                                        <span class="required">*</span>
                                    </label>
                                    <input
                                            type="text"
                                            class="form-input"
                                            formControlName="anneeUniversitaire"
                                            placeholder="Ex: 2024-2025"
                                            [class.error]="isFieldInvalid('anneeUniversitaire')">
                                    @if (isFieldInvalid('anneeUniversitaire')) {
                                        <span class="error-msg">
                      <i class="bi bi-exclamation-circle"></i>
                      L'année universitaire est obligatoire
                    </span>
                                    }
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        Statut
                                    </label>
                                    <div class="status-toggle">
                                        <button
                                                type="button"
                                                class="toggle-btn"
                                                [class.active]="form.get('active')?.value"
                                                (click)="toggleActive()">
                                            <i class="bi" [class]="form.get('active')?.value ? 'bi-unlock-fill' : 'bi-lock-fill'"></i>
                                            {{ form.get('active')?.value ? 'OUVERTE' : 'FERMÉE' }}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">
                                        Description (optionnel)
                                    </label>
                                    <textarea
                                            class="form-input textarea"
                                            formControlName="description"
                                            rows="3"
                                            placeholder="Décrivez les conditions ou particularités de cette campagne...">
                  </textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Section: Période -->
                        <div class="form-section">
                            <h3 class="section-title">
                                <i class="bi bi-calendar-range"></i>
                                Période d'Inscription
                            </h3>

                            <div class="form-row two-cols">
                                <div class="form-group">
                                    <label class="form-label">
                                        Date de début
                                        <span class="required">*</span>
                                    </label>
                                    <div class="date-input-wrapper">
                                        <i class="bi bi-calendar-plus"></i>
                                        <input
                                                type="date"
                                                class="form-input date"
                                                formControlName="dateDebut"
                                                [class.error]="isFieldInvalid('dateDebut')">
                                    </div>
                                    @if (isFieldInvalid('dateDebut')) {
                                        <span class="error-msg">
                      <i class="bi bi-exclamation-circle"></i>
                      La date de début est obligatoire
                    </span>
                                    }
                                </div>

                                <div class="form-group">
                                    <label class="form-label">
                                        Date de fin
                                        <span class="required">*</span>
                                    </label>
                                    <div class="date-input-wrapper">
                                        <i class="bi bi-calendar-minus"></i>
                                        <input
                                                type="date"
                                                class="form-input date"
                                                formControlName="dateFin"
                                                [class.error]="isFieldInvalid('dateFin')">
                                    </div>
                                    @if (isFieldInvalid('dateFin')) {
                                        <span class="error-msg">
                      <i class="bi bi-exclamation-circle"></i>
                      La date de fin est obligatoire
                    </span>
                                    }
                                </div>
                            </div>

                            <!-- Date Preview -->
                            @if (form.get('dateDebut')?.value && form.get('dateFin')?.value) {
                                <div class="date-preview">
                                    <i class="bi bi-clock-history"></i>
                                    <span>
                    Durée de la campagne : 
                    <strong>{{ calculateDuration() }} jours</strong>
                  </span>
                                </div>
                            }
                        </div>

                        <!-- Actions -->
                        <div class="form-actions">
                            <a routerLink="/admin/campagnes" class="btn-cancel">
                                <i class="bi bi-x-lg"></i>
                                Annuler
                            </a>
                            <button
                                    type="submit"
                                    class="btn-submit"
                                    [disabled]="form.invalid || isSubmitting()">
                                @if (isSubmitting()) {
                                    <span class="spinner"></span>
                                    Enregistrement...
                                } @else {
                                    <i class="bi bi-check-lg"></i>
                                    {{ isEditMode() ? 'Mettre à jour' : 'Créer la campagne' }}
                                }
                            </button>
                        </div>

                    </form>
                </div>

                <!-- Info Banner -->
                <div class="info-banner">
                    <div class="info-icon">
                        <i class="bi bi-lightbulb"></i>
                    </div>
                    <div class="info-content">
                        <strong>Bon à savoir</strong>
                        <p>Une seule campagne peut être active à la fois. Lorsque vous activez une campagne, les autres sont automatiquement désactivées.</p>
                    </div>
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
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
        transform: translateX(-2px);
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

      /* Form Card */
      .form-card {
        background: white;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        border: 1px solid #e2e8f0;
        padding: 2rem;
        margin-bottom: 1.5rem;
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
        color: #3b82f6;
      }

      .form-row {
        margin-bottom: 1.25rem;
      }

      .form-row:last-child {
        margin-bottom: 0;
      }

      .form-row.two-cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
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
        border-color: #3b82f6;
        background: white;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
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

      /* Date Input */
      .date-input-wrapper {
        position: relative;
      }

      .date-input-wrapper i {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #94a3b8;
        pointer-events: none;
      }

      .form-input.date {
        padding-left: 2.75rem;
      }

      /* Status Toggle */
      .status-toggle {
        display: flex;
      }

      .toggle-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.875rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        background: #f8fafc;
        color: #64748b;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .toggle-btn.active {
        border-color: #22c55e;
        background: #dcfce7;
        color: #15803d;
      }

      .toggle-btn:hover {
        background: #f1f5f9;
      }

      .toggle-btn.active:hover {
        background: #bbf7d0;
      }

      /* Date Preview */
      .date-preview {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 10px;
        color: #1d4ed8;
        font-size: 0.875rem;
        margin-top: 1rem;
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
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.875rem 1rem;
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

      .btn-submit {
        flex: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.875rem 1rem;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        border: none;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.35);
      }

      .btn-submit:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
      }

      .btn-submit:disabled {
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

      /* Info Banner */
      .info-banner {
        display: flex;
        gap: 1rem;
        padding: 1.25rem;
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border: 1px solid #fcd34d;
        border-radius: 16px;
      }

      .info-icon {
        width: 44px;
        height: 44px;
        background: #f59e0b;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.2rem;
        flex-shrink: 0;
      }

      .info-content {
        color: #92400e;
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

      /* Responsive */
      @media (max-width: 640px) {
        .form-row.two-cols {
          grid-template-columns: 1fr;
        }

        .form-actions {
          flex-direction: column;
        }

        .btn-cancel, .btn-submit {
          flex: none;
        }
      }
    `]
})
export class CampagneFormComponent implements OnInit {
    form: FormGroup;
    isEditMode = signal(false);
    isSubmitting = signal(false);
    campagneId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private inscriptionService: InscriptionService
    ) {
        this.form = this.fb.group({
            titre: ['', [Validators.required]],
            anneeUniversitaire: ['', [Validators.required]],
            description: [''],
            dateDebut: ['', [Validators.required]],
            dateFin: ['', [Validators.required]],
            active: [false]
        });
    }

    ngOnInit(): void {
        // Check if edit mode
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.campagneId = +params['id'];
                this.isEditMode.set(true);
                this.loadCampagne(this.campagneId);
            } else {
                // Set default year for new campagne
                const year = new Date().getFullYear();
                this.form.patchValue({
                    anneeUniversitaire: `${year}-${year + 1}`
                });
            }
        });
    }

    loadCampagne(id: number): void {
        this.inscriptionService.getCampagneById(id).subscribe({
            next: (campagne) => {
                this.form.patchValue({
                    titre: campagne.titre,
                    anneeUniversitaire: campagne.anneeUniversitaire,
                    description: campagne.description || '',
                    dateDebut: campagne.dateDebut,
                    dateFin: campagne.dateFin,
                    active: campagne.active
                });
            },
            error: (err) => {
                console.error('Erreur chargement campagne:', err);
                alert('Erreur lors du chargement de la campagne');
                this.router.navigate(['/admin/campagnes']);
            }
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.form.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    toggleActive(): void {
        const currentValue = this.form.get('active')?.value;
        this.form.patchValue({ active: !currentValue });
    }

    calculateDuration(): number {
        const debut = new Date(this.form.get('dateDebut')?.value);
        const fin = new Date(this.form.get('dateFin')?.value);
        const diffTime = Math.abs(fin.getTime() - debut.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);

        // Préparer les données dans le bon format pour le backend
        const formValue = this.form.value;
        const campagneData = {
            titre: formValue.titre,
            anneeUniversitaire: formValue.anneeUniversitaire,
            description: formValue.description || null,
            dateDebut: formValue.dateDebut,  // Format: yyyy-MM-dd
            dateFin: formValue.dateFin,      // Format: yyyy-MM-dd
            active: formValue.active || false
        };

        console.log('📤 Envoi campagne:', campagneData);

        const request$ = this.isEditMode()
            ? this.inscriptionService.updateCampagne(this.campagneId!, campagneData)
            : this.inscriptionService.createCampagne(campagneData);

        request$.subscribe({
            next: (response) => {
                console.log('✅ Campagne sauvegardée:', response);
                this.isSubmitting.set(false);
                this.router.navigate(['/admin/campagnes']);
            },
            error: (err) => {
                console.error('❌ Erreur sauvegarde:', err);
                console.error('Détails:', err.error);
                this.isSubmitting.set(false);
                alert('Erreur lors de la sauvegarde: ' + (err.error?.message || err.message || 'Erreur inconnue'));
            }
        });
    }
}