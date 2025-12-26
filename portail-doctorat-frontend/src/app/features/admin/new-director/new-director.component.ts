import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { UserService } from '@core/services/user.service';

@Component({
    selector: 'app-new-director',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule, MainLayoutComponent],
    template: `
        <app-main-layout>
            <div class="page-container">

                <!-- Hero Header -->
                <div class="hero-header">
                    <div class="hero-content">
                        <a routerLink="/admin/users" class="back-link">
                            <i class="bi bi-arrow-left"></i>
                            <span>Retour à la gestion des utilisateurs</span>
                        </a>
                        <div class="hero-title-section">
                            <div class="hero-icon">
                                <i class="bi bi-person-plus-fill"></i>
                            </div>
                            <div>
                                <h1 class="hero-title">Nouveau Directeur de Thèse</h1>
                                <p class="hero-subtitle">Créez un compte pour un encadrant scientifique</p>
                            </div>
                        </div>
                    </div>
                    <div class="hero-decoration">
                        <div class="decoration-circle circle-1"></div>
                        <div class="decoration-circle circle-2"></div>
                        <div class="decoration-circle circle-3"></div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="form-container">
                    <form [formGroup]="form" (ngSubmit)="onSubmit()">

                        <!-- Card: Identité -->
                        <div class="form-card">
                            <div class="card-header-custom">
                                <div class="header-icon bg-purple">
                                    <i class="bi bi-person-badge"></i>
                                </div>
                                <div>
                                    <h3 class="card-title">Identité</h3>
                                    <p class="card-subtitle">Informations personnelles du directeur</p>
                                </div>
                            </div>

                            <div class="card-body-custom">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label-custom">
                                            <i class="bi bi-person me-2"></i>Nom
                                            <span class="required">*</span>
                                        </label>
                                        <input
                                                type="text"
                                                class="form-input"
                                                formControlName="nom"
                                                placeholder="Ex: BENALI"
                                                [class.error]="isFieldInvalid('nom')">
                                        @if (isFieldInvalid('nom')) {
                                            <span class="error-message">
                        <i class="bi bi-exclamation-circle me-1"></i>Le nom est requis
                      </span>
                                        }
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label-custom">
                                            <i class="bi bi-person me-2"></i>Prénom
                                            <span class="required">*</span>
                                        </label>
                                        <input
                                                type="text"
                                                class="form-input"
                                                formControlName="prenom"
                                                placeholder="Ex: Mohammed"
                                                [class.error]="isFieldInvalid('prenom')">
                                        @if (isFieldInvalid('prenom')) {
                                            <span class="error-message">
                        <i class="bi bi-exclamation-circle me-1"></i>Le prénom est requis
                      </span>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Card: Contact -->
                        <div class="form-card">
                            <div class="card-header-custom">
                                <div class="header-icon bg-blue">
                                    <i class="bi bi-envelope"></i>
                                </div>
                                <div>
                                    <h3 class="card-title">Contact</h3>
                                    <p class="card-subtitle">Coordonnées professionnelles</p>
                                </div>
                            </div>

                            <div class="card-body-custom">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label-custom">
                                            <i class="bi bi-envelope me-2"></i>Email
                                            <span class="required">*</span>
                                        </label>
                                        <input
                                                type="email"
                                                class="form-input"
                                                formControlName="email"
                                                placeholder="directeur&#64;universite.ma"
                                                [class.error]="isFieldInvalid('email')">
                                        @if (isFieldInvalid('email')) {
                                            <span class="error-message">
                        <i class="bi bi-exclamation-circle me-1"></i>
                                                @if (form.get('email')?.errors?.['required']) {
                                                    L'email est requis
                                                } @else {
                                                    Format email invalide
                                                }
                      </span>
                                        }
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label-custom">
                                            <i class="bi bi-telephone me-2"></i>Téléphone
                                        </label>
                                        <input
                                                type="tel"
                                                class="form-input"
                                                formControlName="telephone"
                                                placeholder="06 00 00 00 00">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Card: Compte -->
                        <div class="form-card">
                            <div class="card-header-custom">
                                <div class="header-icon bg-green">
                                    <i class="bi bi-key"></i>
                                </div>
                                <div>
                                    <h3 class="card-title">Identifiants de Connexion</h3>
                                    <p class="card-subtitle">Informations pour accéder au portail</p>
                                </div>
                            </div>

                            <div class="card-body-custom">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label-custom">
                                            <i class="bi bi-hash me-2"></i>Matricule
                                            <span class="required">*</span>
                                        </label>
                                        <input
                                                type="text"
                                                class="form-input"
                                                formControlName="username"
                                                placeholder="Ex: DIR001"
                                                [class.error]="isFieldInvalid('username')">
                                        @if (isFieldInvalid('username')) {
                                            <span class="error-message">
                        <i class="bi bi-exclamation-circle me-1"></i>Le matricule est requis
                      </span>
                                        }
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label-custom">
                                            <i class="bi bi-lock me-2"></i>Mot de passe
                                            <span class="required">*</span>
                                        </label>
                                        <div class="password-input-wrapper">
                                            <input
                                                    [type]="showPassword() ? 'text' : 'password'"
                                                    class="form-input"
                                                    formControlName="password"
                                                    placeholder="Minimum 6 caractères"
                                                    [class.error]="isFieldInvalid('password')">
                                            <button
                                                    type="button"
                                                    class="password-toggle"
                                                    (click)="togglePassword()">
                                                <i class="bi" [ngClass]="showPassword() ? 'bi-eye-slash' : 'bi-eye'"></i>
                                            </button>
                                        </div>
                                        @if (isFieldInvalid('password')) {
                                            <span class="error-message">
                        <i class="bi bi-exclamation-circle me-1"></i>
                                                @if (form.get('password')?.errors?.['required']) {
                                                    Le mot de passe est requis
                                                } @else {
                                                    Minimum 6 caractères requis
                                                }
                      </span>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Card: Académique -->
                        <div class="form-card">
                            <div class="card-header-custom">
                                <div class="header-icon bg-orange">
                                    <i class="bi bi-mortarboard"></i>
                                </div>
                                <div>
                                    <h3 class="card-title">Informations Académiques</h3>
                                    <p class="card-subtitle">Détails professionnels (optionnel)</p>
                                </div>
                                <span class="optional-badge">Optionnel</span>
                            </div>

                            <div class="card-body-custom">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label-custom">
                                            <i class="bi bi-book me-2"></i>Spécialité / Domaine
                                        </label>
                                        <input
                                                type="text"
                                                class="form-input"
                                                formControlName="specialite"
                                                placeholder="Ex: Intelligence Artificielle">
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label-custom">
                                            <i class="bi bi-building me-2"></i>Laboratoire
                                        </label>
                                        <input
                                                type="text"
                                                class="form-input"
                                                formControlName="laboratoire"
                                                placeholder="Ex: LISI">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="form-actions">
                            <a routerLink="/admin/users" class="btn-cancel">
                                <i class="bi bi-x-lg me-2"></i>Annuler
                            </a>
                            <button
                                    type="submit"
                                    class="btn-submit"
                                    [disabled]="isSubmitting() || form.invalid"
                                    [class.loading]="isSubmitting()">
                                @if (isSubmitting()) {
                                    <span class="spinner"></span>
                                    <span>Création en cours...</span>
                                } @else {
                                    <i class="bi bi-check-lg me-2"></i>
                                    <span>Créer le Directeur</span>
                                }
                            </button>
                        </div>

                    </form>
                </div>

                <!-- Info Box -->
                <div class="info-box">
                    <div class="info-icon">
                        <i class="bi bi-info-circle"></i>
                    </div>
                    <div class="info-content">
                        <strong>Information</strong>
                        <p>Le directeur recevra un email avec ses identifiants de connexion.
                            Il pourra encadrer des doctorants et valider leurs candidatures.</p>
                    </div>
                </div>

            </div>
        </app-main-layout>
    `,
    styles: [`
      .page-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 0 1.5rem 3rem;
      }

      /* Hero Header */
      .hero-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 24px;
        padding: 2rem;
        margin-bottom: 2rem;
        position: relative;
        overflow: hidden;
      }

      .hero-content {
        position: relative;
        z-index: 2;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
        transition: all 0.2s;
      }

      .back-link:hover {
        color: white;
        transform: translateX(-4px);
      }

      .hero-title-section {
        display: flex;
        align-items: center;
        gap: 1.25rem;
      }

      .hero-icon {
        width: 64px;
        height: 64px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.75rem;
        color: white;
      }

      .hero-title {
        color: white;
        font-size: 1.75rem;
        font-weight: 800;
        margin: 0;
      }

      .hero-subtitle {
        color: rgba(255, 255, 255, 0.85);
        margin: 0.25rem 0 0;
        font-size: 1rem;
      }

      .hero-decoration {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 300px;
        pointer-events: none;
      }

      .decoration-circle {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
      }

      .circle-1 { width: 120px; height: 120px; top: -30px; right: 50px; }
      .circle-2 { width: 80px; height: 80px; bottom: -20px; right: 150px; }
      .circle-3 { width: 50px; height: 50px; top: 50%; right: 20px; }

      /* Form Container */
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* Form Card */
      .form-card {
        background: white;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .form-card:hover {
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }

      .card-header-custom {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem 1.5rem;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }

      .header-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        color: white;
        flex-shrink: 0;
      }

      .header-icon.bg-purple { background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); }
      .header-icon.bg-blue { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
      .header-icon.bg-green { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }
      .header-icon.bg-orange { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }

      .card-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }

      .card-subtitle {
        font-size: 0.85rem;
        color: #64748b;
        margin: 0.15rem 0 0;
      }

      .optional-badge {
        margin-left: auto;
        background: #f1f5f9;
        color: #64748b;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.35rem 0.75rem;
        border-radius: 20px;
      }

      .card-body-custom {
        padding: 1.5rem;
      }

      /* Form Elements */
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-label-custom {
        font-size: 0.9rem;
        font-weight: 600;
        color: #374151;
        display: flex;
        align-items: center;
      }

      .form-label-custom i {
        color: #94a3b8;
      }

      .required {
        color: #ef4444;
        margin-left: 4px;
      }

      .form-input {
        width: 100%;
        padding: 0.875rem 1rem;
        font-size: 0.95rem;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        background: #f8fafc;
        transition: all 0.2s;
        outline: none;
      }

      .form-input:focus {
        border-color: #818cf8;
        background: white;
        box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.1);
      }

      .form-input.error {
        border-color: #ef4444;
        background: #fef2f2;
      }

      .form-input::placeholder {
        color: #94a3b8;
      }

      .password-input-wrapper {
        position: relative;
      }

      .password-input-wrapper .form-input {
        padding-right: 3rem;
      }

      .password-toggle {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 0;
        font-size: 1.1rem;
        transition: color 0.2s;
      }

      .password-toggle:hover {
        color: #6366f1;
      }

      .error-message {
        font-size: 0.8rem;
        color: #ef4444;
        display: flex;
        align-items: center;
      }

      /* Form Actions */
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding-top: 1rem;
      }

      .btn-cancel {
        padding: 0.875rem 1.5rem;
        font-size: 0.95rem;
        font-weight: 600;
        color: #64748b;
        background: #f1f5f9;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        transition: all 0.2s;
      }

      .btn-cancel:hover {
        background: #e2e8f0;
        color: #475569;
      }

      .btn-submit {
        padding: 0.875rem 2rem;
        font-size: 0.95rem;
        font-weight: 600;
        color: white;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 12px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35);
      }

      .btn-submit:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.45);
      }

      .btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .btn-submit.loading {
        pointer-events: none;
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

      /* Info Box */
      .info-box {
        display: flex;
        gap: 1rem;
        padding: 1.25rem;
        background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%);
        border: 1px solid #bfdbfe;
        border-radius: 16px;
        margin-top: 1.5rem;
      }

      .info-icon {
        width: 40px;
        height: 40px;
        background: #3b82f6;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.1rem;
        flex-shrink: 0;
      }

      .info-content {
        color: #1e40af;
      }

      .info-content strong {
        display: block;
        margin-bottom: 0.25rem;
      }

      .info-content p {
        margin: 0;
        font-size: 0.9rem;
        opacity: 0.9;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .hero-title-section {
          flex-direction: column;
          text-align: center;
        }

        .form-row {
          grid-template-columns: 1fr;
        }

        .form-actions {
          flex-direction: column;
        }

        .btn-cancel, .btn-submit {
          width: 100%;
          justify-content: center;
        }

        .card-header-custom {
          flex-wrap: wrap;
        }

        .optional-badge {
          margin-left: 0;
          margin-top: 0.5rem;
          width: 100%;
          text-align: center;
        }
      }
    `]
})
export class NewDirectorComponent {
    form: FormGroup;
    isSubmitting = signal(false);
    showPassword = signal(false);

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private router: Router
    ) {
        this.form = this.fb.group({
            nom: ['', [Validators.required, Validators.minLength(2)]],
            prenom: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            telephone: [''],
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            specialite: [''],
            laboratoire: ['']
        });
    }

    togglePassword(): void {
        this.showPassword.set(!this.showPassword());
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.form.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onSubmit(): void {
        if (this.form.invalid) {
            Object.keys(this.form.controls).forEach(key => {
                this.form.get(key)?.markAsTouched();
            });
            return;
        }

        this.isSubmitting.set(true);

        // Mapper les champs frontend vers backend
        const formValues = this.form.value;
        const directeurData = {
            matricule: formValues.username,  // Frontend: username → Backend: matricule
            password: formValues.password,
            email: formValues.email,
            nom: formValues.nom,
            prenom: formValues.prenom,
            telephone: formValues.telephone || null,
            role: 'DIRECTEUR_THESE',
            etat: 'VALIDE',
            enabled: true
        };

        console.log('📤 Données envoyées au backend:', directeurData);

        // Utilise createUser (POST /api/users) qui existe dans le backend
        this.userService.createUser(directeurData).subscribe({
            next: () => {
                this.isSubmitting.set(false);
                alert('✅ Directeur créé avec succès !');
                this.router.navigate(['/admin/users']);
            },
            error: (err) => {
                this.isSubmitting.set(false);
                console.error('Erreur création directeur:', err);

                if (err.status === 409) {
                    alert('❌ Un utilisateur avec cet email ou ce matricule existe déjà.');
                } else if (err.status === 400) {
                    alert('❌ Données invalides. Vérifiez les champs du formulaire.');
                } else {
                    alert('❌ Erreur lors de la création: ' + (err.error?.message || err.message || 'Erreur inconnue'));
                }
            }
        });
    }
}