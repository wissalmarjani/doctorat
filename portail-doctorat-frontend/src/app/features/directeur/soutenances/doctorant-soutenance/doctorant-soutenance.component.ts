import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { SoutenanceService } from '@core/services/soutenance.service';
import { AuthService } from '@core/services/auth.service';
import { Soutenance } from '@core/models/soutenance.model';

@Component({
    selector: 'app-doctorant-soutenance',
    standalone: true,
    imports: [CommonModule, MainLayoutComponent, FormsModule, ReactiveFormsModule],
    template: `
    <app-main-layout>
      <div class="page-container p-4">
        
        <div class="mb-5">
          <h2 class="fw-bold text-dark">Ma Soutenance</h2>
          <p class="text-muted">Gérez votre demande de fin de thèse.</p>
        </div>

        <!-- CAS 1 : AUCUNE DEMANDE (FORMULAIRE) -->
        @if (!currentSoutenance()) {
          <div class="card border-0 shadow-sm rounded-4 p-4">
            <h5 class="mb-4 text-primary fw-bold"><i class="bi bi-pencil-square me-2"></i>Nouvelle Demande</h5>
            
            <form [formGroup]="soutenanceForm" (ngSubmit)="onSubmit()">
              
              <!-- Titre -->
              <div class="mb-4">
                <label class="form-label fw-bold small">Titre de la thèse</label>
                <textarea class="form-control" formControlName="titre" rows="3" placeholder="Titre complet..."></textarea>
              </div>

              <div class="row g-4 mb-4">
                <!-- Fichier Manuscrit -->
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Manuscrit (PDF)</label>
                  <input type="file" class="form-control" (change)="onFileSelect($event, 'manuscrit')" accept=".pdf">
                  <div class="form-text text-muted">Version finale ou quasi-finale.</div>
                </div>

                <!-- Rapport Anti-plagiat -->
                <div class="col-md-6">
                  <label class="form-label fw-bold small">Rapport Anti-Plagiat (PDF)</label>
                  <input type="file" class="form-control" (change)="onFileSelect($event, 'rapport')" accept=".pdf">
                  <div class="form-text text-muted">Doit être inférieur à 10%.</div>
                </div>
              </div>

              <!-- Info Directeur (Lecture seule) -->
              <div class="alert alert-light border d-flex align-items-center mb-4">
                <i class="bi bi-info-circle me-3 fs-4 text-primary"></i>
                <div>
                  <strong>Validation requise</strong><br>
                  Votre demande sera transmise à votre directeur de thèse pour vérification des prérequis (Publications, Formations).
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-100 py-2 rounded-3 fw-bold" [disabled]="isLoading() || soutenanceForm.invalid">
                @if(isLoading()) { <span class="spinner-border spinner-border-sm me-2"></span> }
                Soumettre la demande
              </button>
            </form>
          </div>
        }

        <!-- CAS 2 : DEMANDE EXISTANTE (SUIVI) -->
        @if (currentSoutenance()) {
          <div class="card border-0 shadow-sm rounded-4 p-4">
            <div class="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h5 class="fw-bold text-dark mb-1">{{ currentSoutenance()?.titreThese }}</h5>
                <span class="badge rounded-pill px-3 py-2" [ngClass]="getBadgeClass(currentSoutenance()?.statut)">
                  {{ currentSoutenance()?.statut }}
                </span>
              </div>
            </div>

            <!-- TIMELINE SIMPLE -->
            <div class="timeline-container my-5 px-4">
              <div class="progress" style="height: 4px;">
                <div class="progress-bar bg-success" role="progressbar" [style.width]="getProgressWidth()"></div>
              </div>
              <div class="d-flex justify-content-between mt-3 text-center small fw-bold text-muted">
                <span [class.text-success]="step() >= 1">1. Soumission</span>
                <span [class.text-success]="step() >= 2">2. Prérequis (Directeur)</span>
                <span [class.text-success]="step() >= 3">3. Jury (Admin)</span>
                <span [class.text-success]="step() >= 4">4. Planification</span>
              </div>
            </div>

            <!-- MESSAGES CONTEXTUELS -->
            <div class="alert" [ngClass]="getStatusAlertClass()">
              <i class="bi" [ngClass]="getStatusIcon()"></i>
              <span class="ms-2 fw-bold">{{ getStatusMessage() }}</span>
            </div>

          </div>
        }

      </div>
    </app-main-layout>
  `,
    styles: [`
    /* Réutilise les styles de formulaires et de cards des autres composants */
    .timeline-container { position: relative; }
    .bg-info-subtle { background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .bg-success-subtle { background-color: #f0fdf4; color: #15803d; border: 1px solid #86efac; }
    .bg-warning-subtle { background-color: #fffbeb; color: #b45309; border: 1px solid #fcd34d; }
  `]
})
export class DoctorantSoutenanceComponent implements OnInit {
    currentSoutenance = signal<Soutenance | null>(null);
    soutenanceForm: FormGroup;
    files: any = { manuscrit: null, rapport: null };
    isLoading = signal(false);

    constructor(
        private fb: FormBuilder,
        private soutenanceService: SoutenanceService,
        private authService: AuthService
    ) {
        this.soutenanceForm = this.fb.group({
            titre: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadSoutenance();
    }

    loadSoutenance() {
        const userId = this.authService.currentUser()?.id;
        if (userId) {
            this.soutenanceService.getSoutenanceByDoctorantId(userId).subscribe({
                next: (list) => {
                    if (list && list.length > 0) {
                        this.currentSoutenance.set(list[0]); // Prend la première (suppose 1 thèse active)
                    }
                }
            });
        }
    }

    onFileSelect(event: any, type: string) {
        this.files[type] = event.target.files[0];
    }

    onSubmit() {
        if (this.soutenanceForm.invalid) return;
        this.isLoading.set(true);

        const data = {
            titre: this.soutenanceForm.value.titre,
            doctorantId: this.authService.currentUser()?.id,
            // Supposons que le User model a l'ID du directeur, sinon il faut le récupérer autrement
            // Pour l'instant on hardcode ou on suppose que le backend le retrouve via la relation User
            directeurId: 1 // À FIXER : Il faut stocker l'ID du directeur dans le UserDTO du doctorant
        };

        this.soutenanceService.soumettreDemande(data, this.files).subscribe({
            next: (res) => {
                this.currentSoutenance.set(res);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    // --- HELPERS VISUELS ---

    getBadgeClass(statut: string | undefined): string {
        return 'bg-secondary'; // Simplifié
    }

    step(): number {
        const s = this.currentSoutenance()?.statut;
        if (s === 'BROUILLON' || s === 'SOUMIS') return 1;
        if (s === 'PREREQUIS_VALIDES' || s === 'JURY_PROPOSE') return 2;
        if (s === 'AUTORISEE') return 3;
        if (s === 'PLANIFIEE' || s === 'TERMINEE') return 4;
        return 0;
    }

    getProgressWidth() {
        return ((this.step() - 1) / 3) * 100 + '%';
    }

    getStatusMessage() {
        const s = this.currentSoutenance()?.statut;
        if (s === 'SOUMIS') return "En attente de validation des prérequis par le Directeur.";
        if (s === 'PREREQUIS_VALIDES') return "Prérequis validés. Le directeur compose le jury.";
        if (s === 'AUTORISEE') return "Soutenance autorisée par l'administration.";
        return "Statut: " + s;
    }

    getStatusAlertClass() {
        return 'bg-info-subtle';
    }

    getStatusIcon() {
        return 'bi-info-circle';
    }
}