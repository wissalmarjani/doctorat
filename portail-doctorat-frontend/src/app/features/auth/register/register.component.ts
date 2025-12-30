import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">

        <div class="auth-header">
          <div class="logo"><i class="bi bi-mortarboard-fill"></i></div>
          <h1>Inscription Candidat</h1>
          <p>Créez votre compte et déposez votre dossier</p>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">

          <!-- INFOS PERSONNELLES -->
          <h6 class="text-primary fw-bold mb-3 border-bottom pb-2">1. Informations Personnelles</h6>

          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label small">Nom</label>
              <input type="text"
                     class="form-control"
                     formControlName="nom"
                     placeholder="Ex: El Maghraoui"
                     [class.is-invalid]="isFieldInvalid('nom')">
            </div>
            <div class="col-6">
              <label class="form-label small">Prénom</label>
              <input type="text"
                     class="form-control"
                     formControlName="prenom"
                     placeholder="Ex: Yassine"
                     [class.is-invalid]="isFieldInvalid('prenom')">
            </div>
          </div>

          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label small">Matricule (CNIE)</label>
              <input type="text"
                     class="form-control"
                     formControlName="matricule"
                     placeholder="Ex: D130045678"
                     [class.is-invalid]="isFieldInvalid('matricule')">
            </div>
            <div class="col-6">
              <label class="form-label small">Téléphone</label>
              <input type="text"
                     class="form-control"
                     formControlName="telephone"
                     placeholder="Ex: +212 6 61 23 45 67"
                     [class.is-invalid]="isFieldInvalid('telephone')">
            </div>
          </div>

          <div class="mb-2">
            <label class="form-label small">Email</label>
            <input type="email"
                   class="form-control"
                   formControlName="email"
                   placeholder="Ex: yassine.elmaghraoui@gmail.ma"
                   [class.is-invalid]="isFieldInvalid('email')">
          </div>

          <div class="mb-4">
            <label class="form-label small">Mot de passe</label>
            <input type="password"
                   class="form-control"
                   formControlName="password"
                   placeholder="Minimum 6 caractères"
                   [class.is-invalid]="isFieldInvalid('password')">
          </div>

          <!-- DOCUMENTS -->
          <h6 class="text-primary fw-bold mb-3 border-bottom pb-2">2. Documents Requis (PDF)</h6>

          <div class="mb-3">
            <label class="form-label small fw-bold">Curriculum Vitae (CV)</label>
            <input type="file" class="form-control" (change)="onFileSelect($event, 'cv')" accept=".pdf">
          </div>

          <div class="mb-3">
            <label class="form-label small fw-bold">Diplôme (Master ou équivalent)</label>
            <input type="file" class="form-control" (change)="onFileSelect($event, 'diplome')" accept=".pdf">
          </div>

          <div class="mb-4">
            <label class="form-label small fw-bold">Lettre de Motivation</label>
            <input type="file" class="form-control" (change)="onFileSelect($event, 'lettre')" accept=".pdf">
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading()">
            @if (isLoading()) { <span class="spinner-border spinner-border-sm me-2"></span> Envoi... }
            @else { Finaliser l'inscription }
          </button>
        </form>

        <div class="auth-footer">
          <p>Déjà inscrit ? <a routerLink="/login">Connexion</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; }
    .auth-card { width: 100%; max-width: 550px; background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
    .auth-header { text-align: center; margin-bottom: 1.5rem; }
    .logo { color: #667eea; font-size: 2rem; margin-bottom: 0.5rem; }
    h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; }

    /* Style des champs input */
    .form-control {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #334155;
    }

    /* Couleur du placeholder (le texte en gris) */
    .form-control::placeholder {
      color: #94a3b8;
      opacity: 1; /* Firefox */
    }

    .btn-block { width: 100%; padding: 0.8rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; border-radius: 8px; font-weight: 600; }
    .auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  selectedFiles: { cv: File | null, diplome: File | null, lettre: File | null } = {
    cv: null, diplome: null, lettre: null
  };

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      matricule: ['', [Validators.required, Validators.minLength(3)]],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9+ ]{8,15}$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onFileSelect(event: any, type: 'cv' | 'diplome' | 'lettre') {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFiles[type] = file;
    } else {
      alert("Veuillez sélectionner un fichier PDF valide.");
      event.target.value = '';
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFiles.cv || !this.selectedFiles.diplome || !this.selectedFiles.lettre) {
      this.errorMessage.set("Tous les documents (CV, Diplôme, Lettre) sont obligatoires.");
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formData = new FormData();
    const userJson = JSON.stringify({
      ...this.registerForm.value,
      role: 'CANDIDAT'
    });

    formData.append('candidat', new Blob([userJson], { type: 'application/json' }));
    formData.append('cv', this.selectedFiles.cv);
    formData.append('diplome', this.selectedFiles.diplome);
    formData.append('lettre', this.selectedFiles.lettre);

    this.authService.registerWithFiles(formData).subscribe({
      next: () => {
        alert('Inscription réussie ! Votre dossier a été transmis à l\'administration.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || "Erreur lors de l'envoi du dossier.");
        this.isLoading.set(false);
      }
    });
  }
}