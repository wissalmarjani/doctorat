import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { AuthService } from '@core/services/auth.service';
import { InscriptionService } from '@core/services/inscription.service';
import { DocumentService } from '@core/services/document.service';
import { Campagne, TypeInscription, StatutInscription } from '@core/models/inscription.model';

@Component({
  selector: 'app-inscription-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="page-container">

        <h2 class="fw-bold mb-3">Constitution du Dossier de Candidature</h2>
        <p class="text-muted mb-4">Veuillez remplir les informations et fournir les 3 documents obligatoires.</p>

        <form [formGroup]="inscriptionForm" (ngSubmit)="onSubmit()">

          <!-- 1. INFOS THÈSE -->
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 text-primary"><i class="bi bi-mortarboard me-2"></i>Projet de Thèse</h5>
            </div>
            <div class="card-body">
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Campagne *</label>
                  <select class="form-select" formControlName="campagneId">
                    <option value="">-- Choisir --</option>
                    @for (c of campagnes(); track c.id) {
                      <option [value]="c.id">{{ c.anneeUniversitaire }} - {{ c.titre }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Laboratoire *</label>
                  <input type="text" class="form-control" formControlName="laboratoireAccueil" placeholder="Nom du laboratoire">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Sujet de thèse *</label>
                <textarea class="form-control" rows="3" formControlName="sujetThese"></textarea>
              </div>
            </div>
          </div>

          <!-- 2. DOCUMENTS OBLIGATOIRES -->
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white py-3">
              <h5 class="mb-0 text-primary"><i class="bi bi-file-earmark-pdf me-2"></i>Pièces Justificatives</h5>
            </div>
            <div class="card-body">
              <div class="alert alert-warning small">
                <i class="bi bi-info-circle"></i> Tous les documents sont obligatoires (PDF uniquement).
              </div>

              <!-- CV -->
              <div class="mb-3 border-bottom pb-3">
                <label class="form-label fw-bold">1. Curriculum Vitae (CV) *</label>
                <div class="d-flex align-items-center gap-3">
                  <input type="file" class="form-control" (change)="onFileSelect($event, 'CV')" accept=".pdf">
                  @if(filesStatus['CV']) { <span class="badge bg-success"><i class="bi bi-check"></i> Reçu</span> }
                </div>
              </div>

              <!-- DIPLOME -->
              <div class="mb-3 border-bottom pb-3">
                <label class="form-label fw-bold">2. Diplôme (Master ou équivalent) *</label>
                <div class="d-flex align-items-center gap-3">
                  <input type="file" class="form-control" (change)="onFileSelect($event, 'DIPLOME')" accept=".pdf">
                  @if(filesStatus['DIPLOME']) { <span class="badge bg-success"><i class="bi bi-check"></i> Reçu</span> }
                </div>
              </div>

              <!-- LETTRE MOTIVATION -->
              <div class="mb-3">
                <label class="form-label fw-bold">3. Lettre de Motivation *</label>
                <div class="d-flex align-items-center gap-3">
                  <input type="file" class="form-control" (change)="onFileSelect($event, 'LETTRE')" accept=".pdf">
                  @if(filesStatus['LETTRE']) { <span class="badge bg-success"><i class="bi bi-check"></i> Reçu</span> }
                </div>
              </div>

            </div>
          </div>

          <!-- BOUTONS -->
          <div class="d-flex justify-content-end gap-3 pb-5">
            <button type="submit" class="btn btn-lg btn-primary px-5"
                    [disabled]="inscriptionForm.invalid || !allFilesUploaded() || isUploading || isLoading()">
              @if (isLoading()) { <span class="spinner-border spinner-border-sm"></span> }
              @else { <i class="bi bi-send-check"></i> Soumettre ma candidature }
            </button>
          </div>

          @if(errorMessage()) {
            <div class="alert alert-danger mt-3">{{ errorMessage() }}</div>
          }

        </form>
      </div>
    </app-main-layout>
  `,
  styles: [`.page-container { max-width: 800px; margin: 0 auto; padding-top: 2rem; }`]
})
export class InscriptionFormComponent implements OnInit {
  inscriptionForm: FormGroup;
  campagnes = signal<Campagne[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  // Gestion des fichiers spécifiques
  // On stocke les IDs renvoyés par le DocumentService
  uploadedFileIds: { [key: string]: number } = {};
  filesStatus: { [key: string]: boolean } = { 'CV': false, 'DIPLOME': false, 'LETTRE': false };
  isUploading = false;

  constructor(
      private fb: FormBuilder,
      private inscriptionService: InscriptionService,
      private documentService: DocumentService,
      private authService: AuthService,
      private router: Router
  ) {
    this.inscriptionForm = this.fb.group({
      campagneId: ['', Validators.required],
      sujetThese: ['', [Validators.required, Validators.minLength(10)]],
      laboratoireAccueil: ['', Validators.required],
      typeInscription: ['PREMIERE_INSCRIPTION'], // Fixé pour la candidature
      collaborationExterne: ['']
    });
  }

  ngOnInit() {
    this.inscriptionService.getAllCampagnes().subscribe(data => {
      this.campagnes.set(data.filter(c => c.active));
    });
  }

  // Vérifie si les 3 fichiers sont là
  allFilesUploaded(): boolean {
    return this.filesStatus['CV'] && this.filesStatus['DIPLOME'] && this.filesStatus['LETTRE'];
  }

  onFileSelect(event: any, type: string) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Seuls les fichiers PDF sont acceptés.');
      return;
    }

    this.isUploading = true;

    // On renomme le fichier pour l'organisation (Optionnel mais recommandé)
    // Ex: CV_Matricule.pdf (si on avait accès au matricule facilement ici, sinon juste prefix)
    const renamedFile = new File([file], `${type}_${file.name}`, { type: file.type });

    this.documentService.upload(renamedFile).subscribe({
      next: (resp: any) => {
        this.uploadedFileIds[type] = resp.id;
        this.filesStatus[type] = true;
        this.isUploading = false;
      },
      error: () => {
        alert("Erreur lors de l'upload du " + type);
        this.isUploading = false;
      }
    });
  }

  onSubmit() {
    if (this.inscriptionForm.invalid || !this.allFilesUploaded()) return;

    this.isLoading.set(true);
    const userId = this.authService.currentUser()?.id;
    const val = this.inscriptionForm.value;

    // Construction de l'objet Inscription
    const inscriptionData = {
      doctorantId: userId,
      campagne: { id: Number(val.campagneId) },
      sujetThese: val.sujetThese,
      laboratoireAccueil: val.laboratoireAccueil,
      collaborationExterne: val.collaborationExterne,
      typeInscription: 'PREMIERE_INSCRIPTION',
      // On envoie les IDs des documents
      documents: Object.values(this.uploadedFileIds).map(id => ({ id }))
    };

    // Création
    this.inscriptionService.create(inscriptionData).subscribe({
      next: (res) => {
        // Après création, on met le statut à EN_ATTENTE_ADMIN (si le backend ne le fait pas par défaut)
        // Ici on suppose que le backend met BROUILLON par défaut, donc on "soumet"
        // Si votre create met directement le bon statut, cette étape est optionnelle

        // Option A: Le backend gère. On redirige.
        this.router.navigate(['/auth/pending-approval']);
      },
      error: (err) => {
        this.errorMessage.set("Erreur lors de la soumission. Vérifiez la campagne.");
        this.isLoading.set(false);
      }
    });
  }
}