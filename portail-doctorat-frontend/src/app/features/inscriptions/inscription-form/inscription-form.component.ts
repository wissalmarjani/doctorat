import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { AuthService } from '@core/services/auth.service';
import { InscriptionService } from '@core/services/inscription.service';
import { Campagne } from '@core/models/inscription.model';
import { Role } from '@core/models/user.model';

@Component({
  selector: 'app-inscription-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="page-container">

        <!-- HEADER -->
        <div class="page-header mb-4">
          <a routerLink="/inscriptions" class="btn btn-light btn-sm mb-3">
            <i class="bi bi-arrow-left me-2"></i>Retour à mes dossiers
          </a>
          <h2 class="fw-bold mb-2">{{ getPageTitle() }}</h2>
          <p class="text-muted mb-0">{{ getPageDescription() }}</p>
        </div>

        <!-- INFO DOCTORANT -->
        @if (isDoctorant()) {
          <div class="alert alert-info d-flex align-items-center mb-4">
            <i class="bi bi-info-circle-fill fs-4 me-3"></i>
            <div>
              <strong>Vous êtes un doctorant validé.</strong><br>
              Vos documents initiaux (CV, Diplôme, Lettre) sont déjà enregistrés dans votre dossier.
              Cette inscription concerne uniquement l'année universitaire sélectionnée.
            </div>
          </div>
        }

        <form [formGroup]="inscriptionForm" (ngSubmit)="onSubmit()">

          <!-- SECTION 1 : CAMPAGNE -->
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 text-primary">
                <i class="bi bi-calendar-event me-2"></i>Année Universitaire
              </h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label fw-bold">Campagne d'inscription *</label>
                <select class="form-select form-select-lg" formControlName="campagneId">
                  <option value="">-- Sélectionnez une campagne --</option>
                  @for (c of campagnes(); track c.id) {
                    <option [value]="c.id">
                      {{ c.anneeUniversitaire }} - {{ c.titre }}
                    </option>
                  }
                </select>
                <div class="form-text">
                  Choisissez la campagne correspondant à l'année universitaire en cours.
                </div>
              </div>

              <!-- Type d'inscription (automatique) -->
              <div class="mb-0">
                <label class="form-label fw-bold">Type d'inscription</label>
                <div class="d-flex gap-3">
                  <div class="form-check">
                    <input class="form-check-input" type="radio" formControlName="typeInscription"
                           value="PREMIERE_INSCRIPTION" id="type1">
                    <label class="form-check-label" for="type1">
                      <i class="bi bi-1-circle me-1"></i>Première inscription
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" formControlName="typeInscription"
                           value="REINSCRIPTION" id="type2">
                    <label class="form-check-label" for="type2">
                      <i class="bi bi-arrow-repeat me-1"></i>Réinscription
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2 : PROJET DE THÈSE -->
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 text-primary">
                <i class="bi bi-lightbulb me-2"></i>Projet de Thèse
              </h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label fw-bold">Sujet de thèse *</label>
                <textarea class="form-control" rows="4" formControlName="sujetThese"
                          placeholder="Décrivez votre sujet de recherche..."></textarea>
                <div class="form-text">Minimum 10 caractères</div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Laboratoire d'accueil *</label>
                  <input type="text" class="form-control" formControlName="laboratoireAccueil"
                         placeholder="Ex: LISAC, LRI, LSIA...">
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Collaboration externe</label>
                  <input type="text" class="form-control" formControlName="collaborationExterne"
                         placeholder="Université partenaire (optionnel)">
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 3 : RÉCAPITULATIF DOCUMENTS (lecture seule pour doctorant) -->
          @if (isDoctorant()) {
            <div class="card shadow-sm border-0 mb-4">
              <div class="card-header bg-white py-3">
                <h5 class="mb-0 text-primary">
                  <i class="bi bi-folder-check me-2"></i>Documents Initiaux
                </h5>
              </div>
              <div class="card-body">
                <p class="text-muted small mb-3">
                  Ces documents ont été soumis lors de votre candidature initiale et sont déjà validés.
                </p>
                <div class="docs-grid">
                  <div class="doc-item doc-readonly">
                    <div class="icon-box bg-success-subtle">
                      <i class="bi bi-check-circle-fill text-success"></i>
                    </div>
                    <div class="doc-info">
                      <span class="doc-label">Curriculum Vitae</span>
                      <span class="doc-status text-success">Validé</span>
                    </div>
                  </div>

                  <div class="doc-item doc-readonly">
                    <div class="icon-box bg-success-subtle">
                      <i class="bi bi-check-circle-fill text-success"></i>
                    </div>
                    <div class="doc-info">
                      <span class="doc-label">Diplôme</span>
                      <span class="doc-status text-success">Validé</span>
                    </div>
                  </div>

                  <div class="doc-item doc-readonly">
                    <div class="icon-box bg-success-subtle">
                      <i class="bi bi-check-circle-fill text-success"></i>
                    </div>
                    <div class="doc-info">
                      <span class="doc-label">Lettre de Motivation</span>
                      <span class="doc-status text-success">Validé</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- BOUTONS D'ACTION -->
          <div class="d-flex justify-content-between align-items-center pb-5">
            <a routerLink="/inscriptions" class="btn btn-outline-secondary">
              <i class="bi bi-x-lg me-2"></i>Annuler
            </a>

            <div class="d-flex gap-3">
              <button type="button" class="btn btn-outline-primary"
                      (click)="saveDraft()"
                      [disabled]="isLoading()">
                <i class="bi bi-save me-2"></i>Enregistrer brouillon
              </button>

              <button type="submit" class="btn btn-primary btn-lg px-4"
                      [disabled]="inscriptionForm.invalid || isLoading()">
                @if (isLoading()) {
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Envoi en cours...
                } @else {
                  <i class="bi bi-send-check me-2"></i>
                  Soumettre l'inscription
                }
              </button>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>{{ errorMessage() }}
            </div>
          }

          @if (successMessage()) {
            <div class="alert alert-success">
              <i class="bi bi-check-circle me-2"></i>{{ successMessage() }}
            </div>
          }

        </form>
      </div>
    </app-main-layout>
  `,
  styles: [`
    .page-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .page-header h2 {
      color: #1e293b;
    }

    .card {
      border-radius: 16px;
      overflow: hidden;
    }

    .card-header {
      border-bottom: 1px solid #f1f5f9;
    }

    .card-header h5 {
      font-weight: 700;
    }

    /* DOCUMENTS GRID */
    .docs-grid {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .doc-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      flex: 1;
      min-width: 180px;
    }

    .doc-item.doc-readonly {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .icon-box {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .bg-success-subtle {
      background: #dcfce7;
    }

    .doc-info {
      display: flex;
      flex-direction: column;
    }

    .doc-label {
      font-weight: 600;
      font-size: 0.9rem;
      color: #1e293b;
    }

    .doc-status {
      font-size: 0.75rem;
      font-weight: 500;
    }

    /* FORM STYLES */
    .form-label {
      color: #475569;
      margin-bottom: 0.5rem;
    }

    .form-control, .form-select {
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      padding: 0.75rem 1rem;
    }

    .form-control:focus, .form-select:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
    }

    .form-select-lg {
      padding: 1rem;
      font-size: 1rem;
    }

    .form-text {
      color: #94a3b8;
      font-size: 0.8rem;
    }

    /* BUTTONS */
    .btn {
      border-radius: 10px;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      background: #cbd5e1;
      transform: none;
    }

    .btn-lg {
      padding: 1rem 2rem;
    }

    /* ALERT */
    .alert-info {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      border-radius: 12px;
    }
  `]
})
export class InscriptionFormComponent implements OnInit {
  inscriptionForm: FormGroup;
  campagnes = signal<Campagne[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
      private fb: FormBuilder,
      private inscriptionService: InscriptionService,
      private authService: AuthService,
      private router: Router
  ) {
    this.inscriptionForm = this.fb.group({
      campagneId: ['', Validators.required],
      sujetThese: ['', [Validators.required, Validators.minLength(10)]],
      laboratoireAccueil: ['', Validators.required],
      typeInscription: ['PREMIERE_INSCRIPTION', Validators.required],
      collaborationExterne: ['']
    });
  }

  ngOnInit() {
    // Charger les campagnes actives
    this.inscriptionService.getAllCampagnes().subscribe({
      next: (data) => {
        this.campagnes.set(data.filter(c => c.active));
      },
      error: (err) => console.error('Erreur chargement campagnes:', err)
    });

    // Pré-sélectionner le type selon le nombre d'inscriptions existantes
    this.checkExistingInscriptions();
  }

  isDoctorant(): boolean {
    return this.authService.currentUser()?.role === Role.DOCTORANT;
  }

  getPageTitle(): string {
    if (this.inscriptionForm.get('typeInscription')?.value === 'REINSCRIPTION') {
      return 'Demande de Réinscription';
    }
    return 'Nouvelle Inscription Annuelle';
  }

  getPageDescription(): string {
    if (this.isDoctorant()) {
      return 'Complétez ce formulaire pour votre inscription à l\'année universitaire.';
    }
    return 'Complétez ce formulaire pour soumettre votre dossier de candidature.';
  }

  private checkExistingInscriptions(): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    this.inscriptionService.getByDoctorant(userId).subscribe({
      next: (inscriptions) => {
        if (inscriptions.length > 0) {
          // Si déjà des inscriptions, c'est une réinscription
          this.inscriptionForm.patchValue({ typeInscription: 'REINSCRIPTION' });
        }
      },
      error: () => {} // Ignorer l'erreur silencieusement
    });
  }

  saveDraft(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    const userId = this.authService.currentUser()?.id;
    const val = this.inscriptionForm.value;

    const inscriptionData = {
      doctorantId: userId,
      campagne: val.campagneId ? { id: Number(val.campagneId) } : null,
      sujetThese: val.sujetThese || '',
      laboratoireAccueil: val.laboratoireAccueil || '',
      collaborationExterne: val.collaborationExterne || '',
      typeInscription: val.typeInscription,
      statut: 'BROUILLON'
    };

    this.inscriptionService.create(inscriptionData).subscribe({
      next: () => {
        this.successMessage.set('Brouillon enregistré avec succès !');
      },
      error: (err) => {
        this.errorMessage.set('Erreur lors de l\'enregistrement du brouillon.');
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.inscriptionForm.invalid) return;

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const userId = this.authService.currentUser()?.id;
    const val = this.inscriptionForm.value;

    const inscriptionData = {
      doctorantId: userId,
      campagne: { id: Number(val.campagneId) },
      sujetThese: val.sujetThese,
      laboratoireAccueil: val.laboratoireAccueil,
      collaborationExterne: val.collaborationExterne,
      typeInscription: val.typeInscription,
      statut: 'SOUMIS' // Directement soumis
    };

    this.inscriptionService.create(inscriptionData).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        // Rediriger vers la liste des inscriptions avec message de succès
        this.router.navigate(['/inscriptions'], {
          queryParams: { success: 'true' }
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Erreur lors de la soumission. Veuillez vérifier les informations.');
        console.error('Erreur soumission:', err);
      }
    });
  }
}