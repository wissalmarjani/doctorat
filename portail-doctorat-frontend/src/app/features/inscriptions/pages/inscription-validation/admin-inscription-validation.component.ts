import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscriptionService } from '@core/services/inscription.service';
import { Inscription, StatutInscription } from '@core/models/inscription.model';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';

@Component({
    selector: 'app-admin-inscription-validation',
    standalone: true,
    imports: [CommonModule, MainLayoutComponent, FormsModule],
    template: `
    <app-main-layout>
      <div class="page-container p-4">

        <!-- HEADER -->
        <div class="d-flex justify-content-between align-items-end mb-5">
          <div>
            <h2 class="fw-bold text-dark mb-2">Validation des Inscriptions</h2>
            <p class="text-muted mb-0">Gérez les demandes d'inscription des doctorants.</p>
          </div>
          <button class="btn btn-white border shadow-sm text-primary fw-bold rounded-pill px-4 d-flex align-items-center gap-2"
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

        <!-- FILTRES PAR STATUT -->
        <div class="mb-4 d-flex gap-2 flex-wrap">
          <button class="btn btn-sm"
                  [class.btn-primary]="selectedStatut() === null"
                  [class.btn-outline-secondary]="selectedStatut() !== null"
                  (click)="filterByStatut(null)">
            Toutes ({{ allInscriptions().length }})
          </button>
          <button class="btn btn-sm"
                  [class.btn-warning]="selectedStatut() === 'EN_ATTENTE_ADMIN'"
                  [class.btn-outline-warning]="selectedStatut() !== 'EN_ATTENTE_ADMIN'"
                  (click)="filterByStatut('EN_ATTENTE_ADMIN')">
            En attente Admin ({{ countByStatut('EN_ATTENTE_ADMIN') }})
          </button>
          <button class="btn btn-sm"
                  [class.btn-info]="selectedStatut() === 'EN_ATTENTE_DIRECTEUR'"
                  [class.btn-outline-info]="selectedStatut() !== 'EN_ATTENTE_DIRECTEUR'"
                  (click)="filterByStatut('EN_ATTENTE_DIRECTEUR')">
            En attente Directeur ({{ countByStatut('EN_ATTENTE_DIRECTEUR') }})
          </button>
          <button class="btn btn-sm"
                  [class.btn-success]="selectedStatut() === 'ADMIS'"
                  [class.btn-outline-success]="selectedStatut() !== 'ADMIS'"
                  (click)="filterByStatut('ADMIS')">
            Admis ({{ countByStatut('ADMIS') }})
          </button>
          <button class="btn btn-sm"
                  [class.btn-danger]="selectedStatut() === 'REJETE_ADMIN' || selectedStatut() === 'REJETE_DIRECTEUR'"
                  [class.btn-outline-danger]="selectedStatut() !== 'REJETE_ADMIN' && selectedStatut() !== 'REJETE_DIRECTEUR'"
                  (click)="filterByStatut('REJETE')">
            Rejetés ({{ countByStatut('REJETE_ADMIN') + countByStatut('REJETE_DIRECTEUR') }})
          </button>
        </div>

        <!-- TABLEAU DES INSCRIPTIONS -->
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in-up">
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="bg-light text-uppercase text-muted small fw-bold">
                <tr>
                  <th class="ps-4 py-3">Doctorant</th>
                  <th>Sujet de Thèse</th>
                  <th>Type</th>
                  <th>Date Soumission</th>
                  <th>Statut</th>
                  <th class="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (ins of filteredInscriptions(); track ins.id) {
                  <tr class="main-row" [class.expanded]="expandedId() === ins.id">
                    <td class="ps-4">
                      <div class="d-flex align-items-center gap-3">
                        <div class="avatar-circle shadow-sm">
                          {{ ins.doctorantNom ? ins.doctorantNom.charAt(0).toUpperCase() : '?' }}
                        </div>
                        <div>
                          <div class="fw-bold text-dark">{{ ins.doctorantNom }} {{ ins.doctorantPrenom }}</div>
                          <div class="small text-muted">ID: {{ ins.doctorantId }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="fw-semibold text-dark text-truncate" style="max-width: 300px;">
                        {{ ins.sujetThese }}
                      </div>
                      <div class="small text-muted">{{ ins.laboratoireAccueil }}</div>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark border">
                        {{ getTypeLabel(ins.typeInscription) }}
                      </span>
                    </td>
                    <td>
                      {{ ins.createdAt | date:'dd/MM/yyyy' }}
                    </td>
                    <td>
                      <span class="badge rounded-pill px-3 py-2" [ngClass]="getStatutBadgeClass(ins.statut)">
                        {{ getStatutLabel(ins.statut) }}
                      </span>
                    </td>
                    <td class="text-end pe-4">
                      <button class="btn btn-sm btn-outline-primary" 
                              (click)="toggleExpand(ins.id)">
                        <i class="bi" 
                           [class.bi-chevron-down]="expandedId() !== ins.id"
                           [class.bi-chevron-up]="expandedId() === ins.id"></i>
                      </button>
                    </td>
                  </tr>

                  <!-- LIGNE DÉTAILS EXPANDABLE -->
                  @if (expandedId() === ins.id) {
                    <tr class="detail-row">
                      <td colspan="6" class="p-0 border-0">
                        <div class="detail-panel p-4">
                          <div class="row g-4">

                            <!-- COLONNE 1 : INFORMATIONS -->
                            <div class="col-md-6">
                              <div class="detail-card h-100">
                                <h6 class="section-title text-primary">
                                  <i class="bi bi-info-circle me-2"></i>Détails de l'Inscription
                                </h6>
                                <div class="mt-3">
                                  <div class="mb-3">
                                    <small class="text-muted d-block mb-1">Sujet de Thèse</small>
                                    <div class="fw-bold">{{ ins.sujetThese }}</div>
                                  </div>
                                  <div class="mb-3">
                                    <small class="text-muted d-block mb-1">Laboratoire d'Accueil</small>
                                    <div>{{ ins.laboratoireAccueil }}</div>
                                  </div>
                                  @if (ins.collaborationExterne) {
                                    <div class="mb-3">
                                      <small class="text-muted d-block mb-1">Collaboration Externe</small>
                                      <div>{{ ins.collaborationExterne }}</div>
                                    </div>
                                  }
                                  @if (ins.campagne) {
                                    <div class="mb-3">
                                      <small class="text-muted d-block mb-1">Campagne</small>
                                      <div>{{ ins.campagne.titre }} ({{ ins.campagne.anneeUniversitaire }})</div>
                                    </div>
                                  }
                                  @if (ins.anneeInscription) {
                                    <div class="mb-3">
                                      <small class="text-muted d-block mb-1">Année d'Inscription</small>
                                      <div>{{ ins.anneeInscription }}</div>
                                    </div>
                                  }
                                </div>
                              </div>
                            </div>

                            <!-- COLONNE 2 : ACTIONS ADMIN -->
                            <div class="col-md-6">
                              <div class="detail-card h-100 border-start-decision">
                                <h6 class="section-title text-dark">
                                  <i class="bi bi-gavel me-2"></i>Décision Administrative
                                </h6>

                                <!-- CAS 1 : En attente Admin -->
                                @if (ins.statut === 'EN_ATTENTE_ADMIN' || ins.statut === 'SOUMIS') {
                                  <div class="h-100 d-flex flex-column justify-content-center">
                                    @if (showRefusalInputId() !== ins.id) {
                                      <div class="d-flex flex-column gap-3">
                                        <button class="btn btn-success text-white py-2 shadow-sm"
                                                (click)="confirmValidate(ins, $event)">
                                          <i class="bi bi-check-lg me-2"></i>Valider l'Inscription
                                        </button>
                                        <button class="btn btn-outline-danger py-2 shadow-sm"
                                                (click)="initiateRefusal(ins.id, $event)">
                                          <i class="bi bi-x-lg me-2"></i>Rejeter l'Inscription
                                        </button>
                                      </div>
                                    } @else {
                                      <!-- Zone Refus -->
                                      <div class="mt-2 fade-in">
                                        <label class="small text-danger fw-bold mb-1">Motif de rejet :</label>
                                        <textarea class="form-control bg-light mb-2"
                                                  rows="3"
                                                  [(ngModel)]="commentaireText"
                                                  placeholder="Ex: Dossier incomplet, sujet non pertinent..."></textarea>
                                        <div class="d-flex gap-2">
                                          <button class="btn btn-sm btn-light flex-grow-1"
                                                  (click)="cancelRefusal($event)">
                                            Annuler
                                          </button>
                                          <button class="btn btn-sm btn-danger flex-grow-1"
                                                  [disabled]="!commentaireText.trim()"
                                                  (click)="confirmRefusal(ins, $event)">
                                            Confirmer le Rejet
                                          </button>
                                        </div>
                                      </div>
                                    }
                                  </div>
                                }

                                <!-- CAS 2 : En attente Directeur -->
                                @if (ins.statut === 'EN_ATTENTE_DIRECTEUR') {
                                  <div class="h-100 d-flex flex-column align-items-center justify-content-center">
                                    <div class="w-100 p-3 bg-info-subtle rounded-3 border border-info-subtle d-flex align-items-center gap-3">
                                      <i class="bi bi-hourglass-split text-info fs-3 flex-shrink-0"></i>
                                      <div class="text-info lh-sm">
                                        <span class="fw-bold">Validé par l'Admin</span>
                                        <span class="opacity-75"> - En attente de validation du Directeur.</span>
                                      </div>
                                    </div>
                                    @if (ins.commentaireAdmin) {
                                      <div class="w-100 mt-3 p-3 bg-white rounded-3 border">
                                        <div class="text-uppercase fw-bold text-muted mb-2" style="font-size: 0.7rem;">
                                          <i class="bi bi-chat-left-text me-1"></i>Commentaire Admin
                                        </div>
                                        <p class="mb-0 text-dark small">{{ ins.commentaireAdmin }}</p>
                                      </div>
                                    }
                                  </div>
                                }

                                <!-- CAS 3 : Admis -->
                                @if (ins.statut === 'ADMIS') {
                                  <div class="h-100 d-flex flex-column align-items-center justify-content-center text-success">
                                    <div class="mb-3 p-3 bg-success-subtle rounded-circle">
                                      <i class="bi bi-check-circle-fill fs-1"></i>
                                    </div>
                                    <h6 class="fw-bold">Inscription Validée</h6>
                                    <p class="small text-muted text-center">
                                      Cette inscription a été approuvée par l'Admin et le Directeur.
                                    </p>
                                  </div>
                                }

                                <!-- CAS 4 : Rejeté -->
                                @if (ins.statut === 'REJETE_ADMIN' || ins.statut === 'REJETE_DIRECTEUR') {
                                  <div class="h-100 d-flex flex-column justify-content-center">
                                    <div class="w-100">
                                      <div class="p-3 bg-danger-subtle rounded-3 border border-danger-subtle d-flex align-items-center gap-3 mb-3">
                                        <i class="bi bi-x-circle-fill text-danger fs-3 flex-shrink-0"></i>
                                        <div class="text-danger lh-sm">
                                          <span class="fw-bold">Inscription Rejetée</span>
                                          <span class="opacity-75">
                                            par {{ ins.statut === 'REJETE_ADMIN' ? "l'Admin" : 'le Directeur' }}
                                          </span>
                                        </div>
                                      </div>
                                      @if (ins.commentaireAdmin || ins.commentaireDirecteur) {
                                        <div class="p-3 bg-white rounded-3 border">
                                          <div class="text-uppercase fw-bold text-danger mb-2" style="font-size: 0.7rem;">
                                            <i class="bi bi-chat-left-text me-1"></i>Motif du rejet
                                          </div>
                                          <p class="mb-0 text-dark small">
                                            {{ ins.commentaireAdmin || ins.commentaireDirecteur }}
                                          </p>
                                        </div>
                                      }
                                    </div>
                                  </div>
                                }

                              </div>
                            </div>

                          </div>
                        </div>
                      </td>
                    </tr>
                  }
                } @empty {
                  <tr>
                    <td colspan="6" class="text-center py-5">
                      <div class="text-muted opacity-50">
                        <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                        <h6 class="fw-bold">Aucune inscription trouvée</h6>
                        <span class="small">Aucune inscription ne correspond aux critères sélectionnés.</span>
                      </div>
                    </td>
                  </tr>
                }

                @if (isLoading()) {
                  <tr>
                    <td colspan="6" class="text-center py-5">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                      </div>
                      <div class="mt-3 text-muted">Chargement des inscriptions...</div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </app-main-layout>
  `,
    styles: [`
    /* TABLEAU */
    .main-row {
      transition: background 0.2s;
      border-bottom: 1px solid #f1f5f9;
    }
    .main-row:hover { background-color: #f8fafc; }
    .main-row.expanded {
      background-color: #eef2ff;
      border-left: 4px solid #4f46e5;
    }

    .avatar-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    /* DETAIL PANEL */
    .detail-row {
      background-color: #f8fafc;
      box-shadow: inset 0 6px 10px -8px rgba(0,0,0,0.1);
    }
    .detail-panel { animation: slideDown 0.3s ease-out; }
    .detail-card {
      background: white;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      border: 1px solid #e2e8f0;
    }
    .section-title {
      font-weight: 800;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.8px;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }

    .border-start-decision { border-left: 4px solid #cbd5e1; }

    .fade-in { animation: fadeIn 0.3s; }
    .fade-in-up { animation: fadeInUp 0.4s ease-out; }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* BADGES */
    .bg-info-subtle { background: #e0f2fe; color: #0369a1; }
    .bg-success-subtle { background: #dcfce7; color: #15803d; }
    .bg-danger-subtle { background: #fee2e2; color: #b91c1c; }
    .bg-warning-subtle { background: #fef3c7; color: #b45309; }
  `]
})
export class AdminInscriptionValidationComponent implements OnInit {
    allInscriptions = signal<Inscription[]>([]);
    filteredInscriptions = signal<Inscription[]>([]);
    selectedStatut = signal<string | null>(null);
    expandedId = signal<number | null>(null);
    showRefusalInputId = signal<number | null>(null);
    isLoading = signal(false);
    commentaireText = '';

    constructor(private inscriptionService: InscriptionService) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.isLoading.set(true);
        this.inscriptionService.getAllInscriptions().subscribe({
            next: (inscriptions) => {
                console.log('✅ Inscriptions chargées:', inscriptions);
                this.allInscriptions.set(inscriptions);
                this.applyFilter();
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('❌ Erreur chargement inscriptions:', err);
                this.isLoading.set(false);
            }
        });
    }

    filterByStatut(statut: string | null) {
        this.selectedStatut.set(statut);
        this.applyFilter();
    }

    private applyFilter() {
        const statut = this.selectedStatut();
        if (!statut) {
            this.filteredInscriptions.set(this.allInscriptions());
        } else if (statut === 'REJETE') {
            this.filteredInscriptions.set(
                this.allInscriptions().filter(i =>
                    i.statut === 'REJETE_ADMIN' || i.statut === 'REJETE_DIRECTEUR'
                )
            );
        } else {
            this.filteredInscriptions.set(
                this.allInscriptions().filter(i => i.statut === statut)
            );
        }
    }

    countByStatut(statut: string): number {
        return this.allInscriptions().filter(i => i.statut === statut).length;
    }

    toggleExpand(id: number) {
        this.expandedId.set(this.expandedId() === id ? null : id);
        this.showRefusalInputId.set(null);
        this.commentaireText = '';
    }

    confirmValidate(ins: Inscription, event: Event) {
        event.stopPropagation();
        if (confirm(`Valider l'inscription de ${ins.doctorantNom} ${ins.doctorantPrenom} ?`)) {
            this.inscriptionService.validerParAdmin(ins.id, '').subscribe({
                next: () => {
                    alert('Inscription validée avec succès !');
                    this.loadData();
                    this.expandedId.set(null);
                },
                error: (err) => {
                    console.error('Erreur validation:', err);
                    alert('Erreur lors de la validation');
                }
            });
        }
    }

    initiateRefusal(id: number, event: Event) {
        event.stopPropagation();
        this.showRefusalInputId.set(id);
        this.commentaireText = '';
    }

    cancelRefusal(event: Event) {
        event.stopPropagation();
        this.showRefusalInputId.set(null);
        this.commentaireText = '';
    }

    confirmRefusal(ins: Inscription, event: Event) {
        event.stopPropagation();
        if (!this.commentaireText.trim()) {
            alert('Veuillez saisir un motif de rejet.');
            return;
        }

        if (confirm(`Rejeter l'inscription de ${ins.doctorantNom} ${ins.doctorantPrenom} ?`)) {
            this.inscriptionService.rejeterParAdmin(ins.id, this.commentaireText.trim()).subscribe({
                next: () => {
                    alert('Inscription rejetée.');
                    this.loadData();
                    this.expandedId.set(null);
                    this.showRefusalInputId.set(null);
                    this.commentaireText = '';
                },
                error: (err) => {
                    console.error('Erreur rejet:', err);
                    alert('Erreur lors du rejet');
                }
            });
        }
    }

    getTypeLabel(type: string): string {
        return type === 'PREMIERE_INSCRIPTION' ? '1ère Inscription' : 'Réinscription';
    }

    getStatutLabel(statut: string): string {
        const labels: { [key: string]: string } = {
            'BROUILLON': 'Brouillon',
            'SOUMIS': 'Soumise',
            'EN_ATTENTE_ADMIN': 'En attente Admin',
            'EN_ATTENTE_DIRECTEUR': 'En attente Directeur',
            'ADMIS': 'Admis',
            'REJETE_ADMIN': 'Rejeté (Admin)',
            'REJETE_DIRECTEUR': 'Rejeté (Directeur)'
        };
        return labels[statut] || statut;
    }

    getStatutBadgeClass(statut: string): string {
        const classes: { [key: string]: string } = {
            'BROUILLON': 'bg-secondary',
            'SOUMIS': 'bg-warning text-dark',
            'EN_ATTENTE_ADMIN': 'bg-warning text-dark',
            'EN_ATTENTE_DIRECTEUR': 'bg-info',
            'ADMIS': 'bg-success',
            'REJETE_ADMIN': 'bg-danger',
            'REJETE_DIRECTEUR': 'bg-danger'
        };
        return classes[statut] || 'bg-secondary';
    }
}