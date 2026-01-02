import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-profile',
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Mon Profil</h1>
        <p>Gérez vos informations personnelles</p>
      </div>

      <div class="profile-grid" *ngIf="currentUser">
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-large">{{ getInitials() }}</div>
            <div class="profile-info">
              <h2>{{ currentUser.prenom }} {{ currentUser.nom }}</h2>
              <span class="badge" [ngClass]="getRoleBadge()">{{ currentUser.role.replace('_', ' ') }}</span>
            </div>
          </div>
          
          <div class="profile-details">
            <div class="detail-row">
              <span class="label">📧 Email</span>
              <span class="value">{{ currentUser.email }}</span>
            </div>
            <div class="detail-row">
              <span class="label">🆔 Matricule</span>
              <span class="value">{{ currentUser.matricule }}</span>
            </div>
            <div class="detail-row" *ngIf="currentUser.telephone">
              <span class="label">📞 Téléphone</span>
              <span class="value">{{ currentUser.telephone }}</span>
            </div>
            <div class="detail-row">
              <span class="label">📅 Inscrit le</span>
              <span class="value">{{ currentUser.createdAt | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
        </div>

        <div class="settings-card">
          <h3>🔐 Changer le mot de passe</h3>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <div class="form-group">
              <label class="form-label">Ancien mot de passe</label>
              <input type="password" formControlName="oldPassword" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label">Nouveau mot de passe</label>
              <input type="password" formControlName="newPassword" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label">Confirmer</label>
              <input type="password" formControlName="confirmPassword" class="form-control">
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="passwordForm.invalid">
              Changer le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-container { padding: var(--spacing-xl); max-width: 1000px; margin: 0 auto; }
    .page-header h1 { font-size: var(--font-size-3xl); margin-bottom: var(--spacing-xs); }
    .page-header p { color: var(--neutral-500); margin-bottom: var(--spacing-xl); }
    
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-xl); }
    @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }
    
    .profile-card, .settings-card { background: white; border-radius: var(--radius-xl); padding: var(--spacing-xl); box-shadow: var(--shadow-card); }
    
    .profile-header { display: flex; align-items: center; gap: var(--spacing-lg); margin-bottom: var(--spacing-xl); padding-bottom: var(--spacing-xl); border-bottom: 1px solid var(--neutral-200); }
    .avatar-large { width: 80px; height: 80px; border-radius: var(--radius-full); background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: var(--font-size-2xl); }
    .profile-info h2 { margin: 0 0 var(--spacing-xs); }
    
    .detail-row { display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--neutral-100); }
    .detail-row:last-child { border-bottom: none; }
    .detail-row .label { color: var(--neutral-500); }
    .detail-row .value { font-weight: 500; }
    
    .settings-card h3 { margin-bottom: var(--spacing-lg); }
    .settings-card .btn { width: 100%; }
  `]
})
export class ProfileComponent implements OnInit {
    currentUser: User | null = null;
    passwordForm!: FormGroup;

    constructor(
        private authService: AuthService,
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;
        this.passwordForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        });
    }

    getInitials(): string {
        return `${this.currentUser?.prenom?.charAt(0) || ''}${this.currentUser?.nom?.charAt(0) || ''}`.toUpperCase();
    }

    getRoleBadge(): string {
        switch (this.currentUser?.role) {
            case 'ADMIN': return 'badge-primary';
            case 'DIRECTEUR_THESE': return 'badge-warning';
            case 'DOCTORANT': return 'badge-success';
            default: return 'badge-neutral';
        }
    }

    changePassword(): void {
        if (this.passwordForm.valid) {
            this.authService.changePassword(this.passwordForm.value).subscribe({
                next: () => alert('Mot de passe changé avec succès'),
                error: (err) => alert('Erreur: ' + err.error?.message)
            });
        }
    }
}
