import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DerogationService } from '@core/services/derogation.service';
import { Derogation } from '@core/models/derogation.model';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';

@Component({
  selector: 'app-derogation-management',
  standalone: true,
  imports: [CommonModule, RouterLink, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="page-container p-4">

        <!-- EN-TÊTE -->
        <div class="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 class="fw-bold text-dark mb-1">Gestion des Dérogations</h2>
            <p class="text-muted mb-0">Traitez les demandes de prolongation de durée de thèse.</p>
          </div>
          <button class="btn btn-light text-primary fw-bold shadow-sm rounded-pill px-4 d-flex align-items-center gap-2"
                  (click)="loadDerogations()"
                  [disabled]="isLoading()">
            <span *ngIf="isLoading()" class="spinner-border spinner-border-sm"></span>
            <i *ngIf="!isLoading()" class="bi bi-arrow-clockwise"></i>
            Actualiser
          </button>
        </div>

        <!-- SWITCHER (ONGLETS) -->
        <div class="switcher-container mb-5">
          <div class="switcher">
            <button class="switcher-btn"
                    [class.active]="activeTab === 'PENDING'"
                    (click)="setTab('PENDING')">
              <i class="bi bi-hourglass-split me-2"></i> En attente
              <span *ngIf="getCountByStatus('EN_ATTENTE') > 0"
                    class="badge bg-white text-danger ms-2 shadow-sm rounded-pill">
                {{ getCountByStatus('EN_ATTENTE') }}
              </span>
            </button>
            <button class="switcher-btn"
                    [class.active]="activeTab === 'HISTORY'"
                    (click)="setTab('HISTORY')">
              <i class="bi bi-clock-history me-2"></i> Historique
            </button>
          </div>
        </div>

        <!-- LOGIQUE D'AFFICHAGE -->
        @if (isLoading()) {
          <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-3 text-muted">Récupération des demandes...</p>
          </div>
        } @else if (filteredDerogations().length === 0) {

          <!-- LISTE VIDE (Nettoyée : Plus d'icône, plus d'espace vide) -->
          <div class="card border-0 shadow-sm rounded-4 text-center py-5 fade-in">
            <div class="card-body">
              <h4 class="fw-bold text-dark mb-2">Aucune demande</h4>
              <p class="text-muted mb-0">
                {{ activeTab === 'PENDING' ? 'Aucune dérogation en attente de validation.' : "L'historique est vide." }}
              </p>
            </div>
          </div>

        } @else {

          <!-- TABLEAU DES DONNÉES -->
          <div class="card border-0 shadow-lg rounded-4 overflow-hidden fade-in">

            <div class="card-header bg-white py-3 border-bottom ps-4">
              <h5 class="mb-0 fw-bold text-primary">
                <i class="bi bi-list-ul me-2"></i> Liste des demandes
              </h5>
            </div>

            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                <tr>
                  <th class="ps-4 py-3 text-uppercase small fw-bold text-muted">Doctorant</th>
                  <th class="text-uppercase small fw-bold text-muted">Année demandée</th>
                  <th class="text-uppercase small fw-bold text-muted">Motif</th>
                  <th class="text-uppercase small fw-bold text-muted">Date demande</th>
                  <th class="text-end pe-4 text-uppercase small fw-bold text-muted">Action / Statut</th>
                </tr>
                </thead>
                <tbody>

                  @for (derog of filteredDerogations(); track derog.id) {
                    <tr>
                      <!-- Doctorant -->
                      <td class="ps-4">
                        <div class="d-flex align-items-center">
                          <div class="avatar-circle bg-gradient-orange text-white me-3 shadow-sm">
                            <i class="bi bi-person"></i>
                          </div>
                          <div>
                            <div class="fw-bold text-dark">Doctorant ID {{ derog.doctorantId }}</div>
                            <div class="small text-muted font-monospace">Dossier #{{ derog.id }}</div>
                          </div>
                        </div>
                      </td>

                      <!-- Année -->
                      <td>
                        <span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3">
                          {{ derog.anneeDemandee }}ème Année
                        </span>
                      </td>

                      <!-- Motif -->
                      <td>
                        <div class="text-truncate text-muted" style="max-width: 250px;" [title]="derog.motif">
                          {{ derog.motif }}
                        </div>
                      </td>

                      <!-- Date -->
                      <td>
                        <div class="d-flex align-items-center text-dark">
                          <i class="bi bi-calendar3 me-2 text-muted"></i>
                          {{ derog.dateDemande | date:'dd/MM/yyyy' }}
                        </div>
                      </td>

                      <!-- Actions (Si PENDING) ou Statut (Si HISTORY) -->
                      <td class="text-end pe-4">

                        <!-- Cas EN ATTENTE : Boutons -->
                        <div *ngIf="activeTab === 'PENDING'" class="d-flex justify-content-end gap-2">
                          <button class="btn btn-success btn-sm px-3 shadow-sm rounded-pill d-flex align-items-center gap-1"
                                  (click)="accepter(derog.id)"
                                  title="Accorder">
                            <i class="bi bi-check-lg"></i> Accepter
                          </button>
                          <button class="btn btn-outline-danger btn-sm px-3 shadow-sm rounded-pill d-flex align-items-center gap-1"
                                  (click)="refuser(derog.id)"
                                  title="Refuser">
                            <i class="bi bi-x-lg"></i> Refuser
                          </button>
                        </div>

                        <!-- Cas HISTORIQUE : Badge Statut -->
                        <div *ngIf="activeTab === 'HISTORY'">
                          <span *ngIf="derog.statut === 'APPROUVEE'" class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                            <i class="bi bi-check-circle-fill me-1"></i> ACCORDÉE
                          </span>
                          <span *ngIf="derog.statut === 'REFUSEE'" class="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill">
                            <i class="bi bi-x-circle-fill me-1"></i> REFUSÉE
                          </span>
                        </div>

                      </td>
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
    /* SWITCHER */
    .switcher-container { background-color: #e2e8f0; padding: 5px; border-radius: 16px; display: inline-block; width: 100%; max-width: 500px; }
    .switcher { display: flex; }
    .switcher-btn { flex: 1; background: transparent; border: none; padding: 12px 20px; font-weight: 600; color: #64748b; border-radius: 12px; transition: all 0.3s; display: flex; align-items: center; justify-content: center; }
    .switcher-btn:hover { background-color: rgba(255,255,255,0.5); }
    .switcher-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3); }

    /* AVATARS & ICONS */
    .avatar-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; }
    .bg-gradient-orange { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }

    /* TABLEAU */
    .table thead th { border-bottom: 2px solid #f1f5f9; background-color: #f8fafc; font-size: 0.75rem; letter-spacing: 0.5px; padding-top: 1rem; padding-bottom: 1rem; }
    .table tbody td { vertical-align: middle; padding-top: 1rem; padding-bottom: 1rem; }

    /* BADGES */
    .bg-warning-subtle { background-color: #fff7ed !important; color: #c2410c !important; border-color: #ffedd5 !important; }
    .bg-success-subtle { background-color: #dcfce7 !important; color: #166534 !important; border-color: #bbf7d0 !important; }
    .bg-danger-subtle { background-color: #fef2f2 !important; color: #991b1b !important; border-color: #fecaca !important; }

    /* ANIMATION */
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DerogationManagementComponent implements OnInit {
  derogations = signal<Derogation[]>([]);
  isLoading = signal(true);
  activeTab = 'PENDING'; // PENDING ou HISTORY

  constructor(private derogationService: DerogationService) {}

  ngOnInit() {
    this.loadDerogations();
  }

  loadDerogations() {
    this.isLoading.set(true);
    this.derogationService.getAllDerogations().subscribe({
      next: (data: Derogation[]) => {
        this.derogations.set(data);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error("Erreur chargement dérogations", err);
        this.isLoading.set(false);
      }
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  // Filtrage intelligent pour l'affichage
  filteredDerogations() {
    if (this.activeTab === 'PENDING') {
      return this.derogations().filter(d => d.statut === 'EN_ATTENTE');
    } else {
      return this.derogations().filter(d => d.statut === 'APPROUVEE' || d.statut === 'REFUSEE');
    }
  }

  accepter(id: number) {
    if(confirm("Accorder cette dérogation ?")) {
      this.derogationService.validerDerogation(id, "Validée par admin").subscribe({
        next: () => {
          alert("Validé !");
          this.loadDerogations();
        },
        error: () => alert("Erreur lors de la validation")
      });
    }
  }

  refuser(id: number) {
    const motif = prompt("Motif du refus :");
    if(motif) {
      this.derogationService.refuserDerogation(id, motif).subscribe({
        next: () => {
          alert("Refusé.");
          this.loadDerogations();
        },
        error: () => alert("Erreur lors du refus")
      });
    }
  }

  getCountByStatus(status: string): number {
    return this.derogations().filter(d => d.statut === status).length;
  }
}