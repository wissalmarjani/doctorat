import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterLink, MainLayoutComponent, FormsModule],
  template: `
    <app-main-layout>
      <div class="page-container p-4">

        <div class="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 class="fw-bold text-dark mb-2">Gestion des Utilisateurs</h2>
            <p class="text-muted mb-0">Gérez les candidatures, directeurs et doctorants.</p>
          </div>
          <button class="btn btn-white border shadow-sm text-primary fw-bold rounded-pill px-4 d-flex align-items-center gap-2 hover-scale"
                  (click)="loadData()"
                  [disabled]="isLoading()">
            @if (isLoading()) {
              <span class="spinner-border spinner-border-sm"></span>
            } @else {
              <i class="bi bi-arrow-clockwise"></i>
            }
            Actualiser
          </button>
        </div>

        <div class="switcher-container mb-5">
          <div class="switcher">
            <button class="switcher-btn"
                    [class.active]="activeTab === 'CANDIDATS'"
                    (click)="setTab('CANDIDATS')">
              <i class="bi bi-person-lines-fill me-2"></i>
              Candidatures
              @if (candidats().length > 0) {
                <span class="badge ms-2 rounded-pill"
                      [ngClass]="activeTab === 'CANDIDATS' ? 'bg-primary-subtle text-primary' : 'bg-danger text-white'">
                  {{ candidats().length }}
                </span>
              }
            </button>

            <button class="switcher-btn"
                    [class.active]="activeTab === 'DIRECTEURS'"
                    (click)="setTab('DIRECTEURS')">
              <i class="bi bi-person-video3 me-2"></i>
              Directeurs
            </button>

            <button class="switcher-btn"
                    [class.active]="activeTab === 'DOCTORANTS'"
                    (click)="setTab('DOCTORANTS')">
              <i class="bi bi-mortarboard-fill me-2"></i>
              Doctorants
              <span class="badge ms-2 rounded-pill"
                    [ngClass]="activeTab === 'DOCTORANTS' ? 'bg-success-subtle text-success' : 'bg-secondary text-white'">
                {{ doctorants().length }}
              </span>
            </button>
          </div>
        </div>

        @if (activeTab === 'CANDIDATS') {
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in-up">
            <div class="table-responsive">
              <table class="table align-middle mb-0">
                <thead class="bg-light text-uppercase text-muted small fw-bold">
                <tr>
                  <th class="ps-4 py-3">Candidat</th>
                  <th>Contact</th>
                  <th>Date demande</th>
                  <th>État</th>
                  <th class="text-end pe-4">Action</th>
                </tr>
                </thead>
                <tbody>
                  @for (user of candidats(); track user.id) {
                    <tr class="cursor-pointer main-row" [class.expanded]="expandedUserId() === user.id" (click)="toggleExpand(user.id)">
                      <td class="ps-4">
                        <div class="d-flex align-items-center gap-3">
                          <div class="avatar-circle shadow-sm">{{ user.nom.charAt(0).toUpperCase() }}</div>
                          <div>
                            <div class="fw-bold text-dark">{{ user.nom }} {{ user.prenom }}</div>
                            <div class="small text-muted">Mat: {{ user.username }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="text-dark">{{ user.email }}</div>
                        <div class="small text-muted">{{ user.telephone || 'Non renseigné' }}</div>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark border">
                          <i class="bi bi-calendar3 me-1"></i>{{ user.createdAt | date:'dd MMM yyyy' }}
                        </span>
                      </td>
                      <td>
                        <span class="badge rounded-pill px-3 py-2" [ngClass]="getEtatBadgeClass(user.etat)">
                          {{ formatEtat(user.etat) }}
                        </span>
                      </td>
                      <td class="text-end pe-4">
                        <i class="bi bi-chevron-down transition-icon" [class.rotate]="expandedUserId() === user.id"></i>
                      </td>
                    </tr>

                    @if (expandedUserId() === user.id) {
                      <tr class="detail-row">
                        <td colspan="5" class="p-0 border-0">
                          <div class="detail-panel p-4">

                            <!-- INFOS PERSONNELLES -->
                            <div class="detail-card mb-3">
                              <h6 class="section-title text-primary"><i class="bi bi-person-badge me-2"></i>Infos Personnelles</h6>
                              <div class="row mt-3">
                                <div class="col-md-4">
                                  <small class="text-muted d-block mb-1">Matricule / CNIE</small>
                                  <div class="fw-bold">{{ user.username }}</div>
                                </div>
                                <div class="col-md-4">
                                  <small class="text-muted d-block mb-1">Téléphone</small>
                                  <div>{{ user.telephone || 'Non renseigné' }}</div>
                                </div>
                                <div class="col-md-4">
                                  <small class="text-muted d-block mb-1">Email</small>
                                  <div class="text-break">{{ user.email }}</div>
                                </div>
                              </div>
                            </div>

                            <!-- DOCUMENTS -->
                            <div class="detail-card mb-3">
                              <h6 class="section-title text-primary"><i class="bi bi-folder2-open me-2"></i>Documents</h6>
                              <div class="docs-grid mt-3">
                                <div class="doc-item" [class.disabled]="!user.cv" (click)="viewDocument(user.cv, $event)">
                                  <div class="icon-box bg-purple-subtle">
                                    <i class="bi bi-file-earmark-person-fill text-purple"></i>
                                  </div>
                                  <span class="doc-label">Curriculum Vitae</span>
                                </div>

                                <div class="doc-item" [class.disabled]="!user.diplome" (click)="viewDocument(user.diplome, $event)">
                                  <div class="icon-box bg-blue-subtle">
                                    <i class="bi bi-mortarboard-fill text-blue"></i>
                                  </div>
                                  <span class="doc-label">Diplôme</span>
                                </div>

                                <div class="doc-item" [class.disabled]="!user.lettreMotivation" (click)="viewDocument(user.lettreMotivation, $event)">
                                  <div class="icon-box bg-orange-subtle">
                                    <i class="bi bi-envelope-paper-fill text-orange"></i>
                                  </div>
                                  <span class="doc-label">Lettre de Motivation</span>
                                </div>
                              </div>
                            </div>

                            <!-- DÉCISION -->
                            <div class="detail-card">
                              <h6 class="section-title text-dark"><i class="bi bi-gavel me-2"></i>Décision</h6>

                              @if (user.etat === 'EN_ATTENTE_ADMIN' || !user.etat) {
                                <div class="mt-3">
                                  @if (showRefusalInputId() !== user.id && showValidationInputId() !== user.id) {
                                    <!-- BOUTONS INITIAUX -->
                                    <div class="decision-buttons-row">
                                      <button class="btn btn-success btn-decision" (click)="initiateValidation(user.id, $event)">
                                        <i class="bi bi-check-lg me-2"></i>Valider le dossier
                                      </button>
                                      <button class="btn btn-danger btn-decision" (click)="initiateRefusal(user.id, $event)">
                                        <i class="bi bi-x-lg me-2"></i>Refuser le dossier
                                      </button>
                                    </div>
                                  }

                                  <!-- ZONE VALIDATION (Sélection directeur) -->
                                  @if (showValidationInputId() === user.id) {
                                    <div class="validation-box fade-in">
                                      <label class="validation-label">
                                        <i class="bi bi-person-check me-2"></i>Assigner un Directeur de Thèse :
                                      </label>
                                      <select class="form-select mb-3" [(ngModel)]="selectedDirecteurId">
                                        <option value="">-- Sélectionnez un directeur --</option>
                                        @for (dir of directeurs(); track dir.id) {
                                          <option [value]="dir.id">
                                            {{ dir.nom }} {{ dir.prenom }} ({{ dir.email }})
                                          </option>
                                        }
                                      </select>
                                      <div class="validation-actions">
                                        <button class="btn btn-light flex-grow-1" (click)="cancelValidation($event)">
                                          <i class="bi bi-arrow-left me-1"></i>Annuler
                                        </button>
                                        <button class="btn btn-success flex-grow-1"
                                                [disabled]="!selectedDirecteurId"
                                                (click)="confirmValidate(user, $event)">
                                          <i class="bi bi-check-circle me-1"></i>Confirmer
                                        </button>
                                      </div>
                                    </div>
                                  }

                                  <!-- ZONE REFUS -->
                                  @if (showRefusalInputId() === user.id) {
                                    <div class="refusal-box fade-in">
                                      <label class="refusal-label">
                                        <i class="bi bi-chat-left-text me-2"></i>Motif du refus :
                                      </label>
                                      <textarea class="form-control refusal-textarea" rows="3" [(ngModel)]="motifText" placeholder="Ex: Dossier incomplet..."></textarea>
                                      <div class="refusal-actions">
                                        <button class="btn btn-light flex-grow-1" (click)="cancelRefusal($event)">
                                          <i class="bi bi-arrow-left me-1"></i>Annuler
                                        </button>
                                        <button class="btn btn-danger flex-grow-1" [disabled]="!motifText.trim()" (click)="confirmRefusal(user, $event)">
                                          <i class="bi bi-x-circle me-1"></i>Confirmer
                                        </button>
                                      </div>
                                    </div>
                                  }
                                </div>
                              }

                              @if (user.etat === 'EN_ATTENTE_DIRECTEUR') {
                                <div class="mt-3 fade-in">
                                  <div class="w-100 p-3 bg-primary-subtle rounded-3 border border-primary-subtle d-flex align-items-center gap-3">
                                    <i class="bi bi-check-circle-fill text-primary fs-3 flex-shrink-0"></i>
                                    <div class="text-primary lh-sm">
                                      <span class="fw-bold">Validé par l'Admin</span>
                                      <span class="opacity-75 d-block small">En attente du Directeur de thèse.</span>
                                    </div>
                                  </div>
                                </div>
                              }

                              @if (user.etat === 'REFUSE') {
                                <div class="mt-3 fade-in">
                                  <div class="w-100">
                                    <div class="p-3 bg-danger-subtle rounded-3 border border-danger-subtle d-flex align-items-center gap-3 mb-3">
                                      <i class="bi bi-x-circle-fill text-danger fs-3 flex-shrink-0"></i>
                                      <div class="text-danger lh-sm">
                                        <span class="fw-bold">Dossier Refusé</span>
                                      </div>
                                    </div>
                                    <div class="p-3 bg-white rounded-3 border">
                                      <div class="text-uppercase fw-bold text-danger mb-2" style="font-size: 0.7rem; letter-spacing: 1px;">
                                        <i class="bi bi-chat-left-text me-1"></i>Motif du refus
                                      </div>
                                      <p class="mb-0 text-dark">{{ user.motifRefus || 'Aucun motif précisé.' }}</p>
                                    </div>
                                  </div>
                                </div>
                              }

                              @if (user.etat === 'VALIDE') {
                                <div class="mt-3 text-center fade-in">
                                  <div class="mb-3 p-3 bg-success-subtle rounded-circle d-inline-flex">
                                    <i class="bi bi-mortarboard-fill fs-1 text-success"></i>
                                  </div>
                                  <h6 class="fw-bold text-success">Doctorant Inscrit</h6>
                                </div>
                              }

                            </div>
                          </div>
                        </td>
                      </tr>
                    }
                  }
                  @if (candidats().length === 0) {
                    <tr><td colspan="5" class="text-center py-5 text-muted">Aucune candidature en attente.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (activeTab === 'DIRECTEURS') {
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in-up">
            <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between pe-4 ps-4">
              <h5 class="mb-0 fw-bold text-primary">Liste des Directeurs</h5>
              <a [routerLink]="['/admin/users/new-director']" class="btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                <i class="bi bi-plus-lg"></i>
              </a>
            </div>
            <div class="card-body p-0">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light"><tr><th class="ps-4 py-3">Directeur</th><th>Email</th><th class="text-end pe-4">ID</th></tr></thead>
                <tbody>
                  @for (dir of directeurs(); track dir.id) {
                    <tr>
                      <td class="ps-4 fw-bold">{{ dir.nom }} {{ dir.prenom }}</td>
                      <td>{{ dir.email }}</td>
                      <td class="text-end pe-4 text-muted">#{{ dir.id }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (activeTab === 'DOCTORANTS') {
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in-up">
            <div class="card-header bg-white py-3 border-bottom ps-4">
              <h5 class="mb-0 fw-bold text-success">Liste des Doctorants</h5>
            </div>
            <div class="card-body p-0">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light"><tr><th class="ps-4 py-3">Doctorant</th><th>Matricule</th><th>Directeur</th><th>Statut</th></tr></thead>
                <tbody>
                  @for (doc of doctorants(); track doc.id) {
                    <tr>
                      <td class="ps-4">
                        <div class="fw-bold">{{ doc.nom }} {{ doc.prenom }}</div>
                        <div class="small text-muted">{{ doc.email }}</div>
                      </td>
                      <td><span class="badge bg-light text-dark border">{{ doc.username }}</span></td>
                      <td>{{ getDirecteurName(doc.directeurId) }}</td>
                      <td><span class="badge bg-success-subtle text-success rounded-pill">ACTIF</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

      </div>
    </app-main-layout>
  `,
  styles: [`
    /* STRUCTURE GLOBALE */
    .switcher-container { display: flex; justify-content: center; width: 100%; }
    .switcher { background-color: #f1f5f9; padding: 5px; border-radius: 50px; display: inline-flex; gap: 5px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.03); }
    .switcher-btn { border: none; background: transparent; padding: 10px 24px; border-radius: 40px; font-weight: 600; color: #64748b; font-size: 0.95rem; display: flex; align-items: center; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); cursor: pointer; }
    .switcher-btn:hover { color: #334155; }
    .switcher-btn.active { background-color: #ffffff; color: #4f46e5; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: scale(1.02); }

    /* TABLEAU */
    .main-row { transition: background 0.2s; border-bottom: 1px solid #f1f5f9; cursor: pointer; }
    .main-row:hover { background-color: #f8fafc; }
    .main-row.expanded { background-color: #eef2ff; border-left: 4px solid #4f46e5; }
    .avatar-circle { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .transition-icon { transition: transform 0.3s; }
    .rotate { transform: rotate(180deg); }

    /* DETAIL PANEL */
    .detail-row { background-color: #f8fafc; box-shadow: inset 0 6px 10px -8px rgba(0,0,0,0.1); }
    .detail-panel { animation: slideDown 0.3s ease-out; }
    .detail-card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; }
    .section-title { font-weight: 800; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.8px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 0; }

    /* DOCUMENTS */
    .docs-grid { display: flex; gap: 12px; flex-wrap: wrap; }
    .doc-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; transition: all 0.2s ease-in-out; }
    .doc-item:hover { border-color: #4f46e5; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1); transform: translateY(-2px); }
    .doc-item.disabled { opacity: 0.5; cursor: not-allowed; background: #f8fafc; border-style: dashed; }
    .icon-box { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
    .doc-label { font-weight: 600; font-size: 0.85rem; color: #334155; }

    /* Couleurs des icônes */
    .bg-purple-subtle { background: #f3e8ff; } .text-purple { color: #9333ea; }
    .bg-blue-subtle { background: #dbeafe; } .text-blue { color: #2563eb; }
    .bg-orange-subtle { background: #ffedd5; } .text-orange { color: #ea580c; }

    /* BOUTONS DÉCISION */
    .decision-buttons-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-decision { padding: 12px 24px; font-weight: 600; font-size: 0.9rem; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-decision:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

    /* ZONE VALIDATION */
    .validation-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 16px;
    }
    .validation-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      color: #16a34a;
      margin-bottom: 12px;
    }
    .validation-actions {
      display: flex;
      gap: 10px;
      margin-top: 12px;
    }
    .validation-actions .btn {
      padding: 10px 16px;
      font-weight: 600;
      font-size: 0.85rem;
      border-radius: 8px;
    }

    /* ZONE REFUS */
    .refusal-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; }
    .refusal-label { display: block; font-size: 0.85rem; font-weight: 700; color: #dc2626; margin-bottom: 12px; white-space: nowrap; }
    .refusal-textarea { background: #fff; border: 1px solid #fecaca; border-radius: 8px; font-size: 0.9rem; resize: none; width: 100%; }
    .refusal-textarea:focus { border-color: #f87171; box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.15); outline: none; }
    .refusal-actions { display: flex; gap: 10px; margin-top: 12px; }
    .refusal-actions .btn { padding: 10px 16px; font-weight: 600; font-size: 0.85rem; border-radius: 8px; }

    /* ANIMATIONS */
    .fade-in { animation: fadeIn 0.3s; }
    .fade-in-up { animation: fadeInUp 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    /* BADGES */
    .bg-info-subtle { background: #e0f2fe; color: #0369a1; }
    .bg-success-subtle { background: #dcfce7; color: #15803d; }
    .bg-danger-subtle { background: #fee2e2; color: #b91c1c; }
    .bg-warning-subtle { background: #fef3c7; color: #b45309; }
    .bg-primary-subtle { background: #e0e7ff; color: #4338ca; }
  `]
})
export class UserManagementComponent implements OnInit {

  activeTab = 'CANDIDATS';
  candidats = signal<User[]>([]);
  directeurs = signal<User[]>([]);
  doctorants = signal<User[]>([]);
  isLoading = signal(false);
  expandedUserId = signal<number | null>(null);
  showRefusalInputId = signal<number | null>(null);
  showValidationInputId = signal<number | null>(null);
  motifText = '';
  selectedDirecteurId = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadData();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.expandedUserId.set(null);
    this.resetInputs();
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    this.userService.getUsersByRole('CANDIDAT').subscribe({
      next: users => {
        const filteredCandidats = users.filter(user =>
            !user.etat || user.etat === 'EN_ATTENTE_ADMIN'
        );
        this.candidats.set(filteredCandidats);
      },
      error: (err: any) => console.error(err)
    });

    this.userService.getUsersByRole('DIRECTEUR_THESE').subscribe({
      next: users => this.directeurs.set(users),
      error: (err: any) => console.error(err)
    });

    this.userService.getUsersByRole('DOCTORANT').subscribe({
      next: users => {
        this.doctorants.set(users);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleExpand(id: number) {
    if (this.expandedUserId() === id) {
      this.expandedUserId.set(null);
      this.resetInputs();
    } else {
      this.expandedUserId.set(id);
      this.resetInputs();
    }
  }

  resetInputs() {
    this.showRefusalInputId.set(null);
    this.showValidationInputId.set(null);
    this.motifText = '';
    this.selectedDirecteurId = '';
  }

  viewDocument(filename: string | undefined, event: Event) {
    event.stopPropagation();
    if (filename) {
      window.open(this.userService.getDocumentUrl(filename), '_blank');
    }
  }

  // ============================================
  // VALIDATION AVEC ASSIGNATION DIRECTEUR
  // ============================================

  initiateValidation(id: number, event: Event) {
    event.stopPropagation();
    this.showValidationInputId.set(id);
    this.showRefusalInputId.set(null);
    this.selectedDirecteurId = '';
  }

  cancelValidation(event: Event) {
    event.stopPropagation();
    this.showValidationInputId.set(null);
    this.selectedDirecteurId = '';
  }

  confirmValidate(user: User, event: Event) {
    event.stopPropagation();

    if (!this.selectedDirecteurId) {
      alert('Veuillez sélectionner un directeur de thèse.');
      return;
    }

    if (confirm(`Confirmer la validation de ${user.nom} ${user.prenom} et l'assigner au directeur sélectionné ?`)) {
      // Appeler le service avec le directeur assigné
      this.userService.validerCandidatureAdminAvecDirecteur(user.id, Number(this.selectedDirecteurId)).subscribe({
        next: () => {
          alert('Candidature validée avec succès ! Le directeur a été assigné.');
          this.loadData();
          this.resetInputs();
        },
        error: (err: any) => {
          console.error('Erreur validation:', err);
          alert('Erreur lors de la validation. Vérifiez la console.');
        }
      });
    }
  }

  // ============================================
  // REFUS
  // ============================================

  initiateRefusal(id: number, event: Event) {
    event.stopPropagation();
    this.showRefusalInputId.set(id);
    this.showValidationInputId.set(null);
    this.motifText = '';
  }

  cancelRefusal(event: Event) {
    event.stopPropagation();
    this.showRefusalInputId.set(null);
    this.motifText = '';
  }

  confirmRefusal(user: User, event: Event) {
    event.stopPropagation();
    if (!this.motifText.trim()) {
      alert('Veuillez saisir un motif de refus.');
      return;
    }

    if (confirm(`Refuser définitivement le dossier de ${user.nom} ?`)) {
      this.userService.refuserCandidatureAdmin(user.id, this.motifText.trim()).subscribe({
        next: () => {
          alert('Candidature refusée.');
          this.loadData();
          this.resetInputs();
        },
        error: (err: any) => {
          console.error('Erreur refus:', err);
          alert('Erreur lors du refus: ' + (err.error?.message || err.message || 'Erreur inconnue'));
        }
      });
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  getDirecteurName(directeurId: number | undefined): string {
    if (!directeurId) return 'Non assigné';
    const directeur = this.directeurs().find(d => d.id === directeurId);
    return directeur ? `${directeur.nom} ${directeur.prenom}` : 'ID: ' + directeurId;
  }

  formatEtat(etat: string | undefined): string {
    if (!etat || etat === 'EN_ATTENTE_ADMIN') return 'Nouveau';
    if (etat === 'EN_ATTENTE_DIRECTEUR') return 'Attente Directeur';
    if (etat === 'VALIDE') return 'Validé Final';
    if (etat === 'REFUSE') return 'Refusé';
    return etat.replace(/_/g, ' ');
  }

  getEtatBadgeClass(etat: string | undefined): string {
    if (etat === 'VALIDE') return 'bg-success-subtle';
    if (etat === 'REFUSE') return 'bg-danger-subtle';
    if (etat === 'EN_ATTENTE_DIRECTEUR') return 'bg-info-subtle';
    return 'bg-warning-subtle';
  }
}