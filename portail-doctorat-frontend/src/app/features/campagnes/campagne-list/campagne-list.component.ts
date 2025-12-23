import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { InscriptionService } from '@core/services/inscription.service';
import { Campagne } from '@core/models/inscription.model';

@Component({
  selector: 'app-campagne-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="page-container p-4">

        <!-- EN-TÊTE -->
        <div class="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 class="fw-bold text-dark mb-1">Campagnes</h2>
            <p class="text-muted mb-0">Gérez les périodes d'ouverture des inscriptions.</p>
          </div>
          <button class="btn btn-light text-primary fw-bold shadow-sm rounded-pill px-4 d-flex align-items-center gap-2"
                  (click)="loadData()"
                  [disabled]="isLoading()">
            <span *ngIf="isLoading()" class="spinner-border spinner-border-sm"></span>
            <i *ngIf="!isLoading()" class="bi bi-arrow-clockwise"></i>
            Actualiser
          </button>
        </div>

        <!-- LISTE VIDE -->
        <div *ngIf="campagnes().length === 0 && !isLoading()" class="card border-0 shadow-sm rounded-4 text-center py-5 fade-in">
          <div class="card-body">
            <div class="icon-box bg-light mb-3 rounded-circle mx-auto text-muted">
              <i class="bi bi-calendar-x fs-2"></i>
            </div>
            <h4 class="fw-bold text-dark">Aucune campagne</h4>
            <p class="text-muted mb-4">Commencez par créer la première campagne pour l'année universitaire.</p>
            <a routerLink="nouvelle" class="btn btn-primary rounded-pill px-4 shadow-sm">
              <i class="bi bi-plus-lg me-2"></i> Créer maintenant
            </a>
          </div>
        </div>

        <!-- TABLEAU DES CAMPAGNES -->
        <div *ngIf="campagnes().length > 0" class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in">

          <!-- HEADER DU TABLEAU -->
          <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center pe-4 ps-4">
            <div class="d-flex align-items-center">
              <h5 class="mb-0 fw-bold text-primary">
                <i class="bi bi-calendar-range me-2"></i> Historique
              </h5>
              <span class="badge bg-primary-subtle text-primary rounded-pill ms-3">
                {{ campagnes().length }}
              </span>
            </div>
            <a routerLink="nouvelle"
               class="btn btn-primary btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center btn-add"
               style="width: 36px; height: 36px;"
               title="Nouvelle campagne">
              <i class="bi bi-plus-lg fs-5"></i>
            </a>
          </div>

          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                <tr>
                  <th class="ps-4 py-3 text-uppercase small fw-bold text-muted">Année Univ.</th>
                  <th class="text-uppercase small fw-bold text-muted">Titre</th>
                  <th class="text-uppercase small fw-bold text-muted">Période</th>
                  <th class="text-uppercase small fw-bold text-muted">Statut</th>
                  <th class="text-end pe-4 text-uppercase small fw-bold text-muted">Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr *ngFor="let campagne of campagnes()">
                  <!-- Année (Badge visuel) -->
                  <td class="ps-4">
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle bg-gradient-blue text-white me-3 shadow-sm">
                        <i class="bi bi-calendar-event"></i>
                      </div>
                      <span class="fw-bold text-dark fs-6">{{ campagne.anneeUniversitaire }}</span>
                    </div>
                  </td>

                  <!-- Titre -->
                  <td>
                    <div class="fw-bold text-dark">{{ campagne.titre }}</div>
                  </td>

                  <!-- Dates -->
                  <td>
                    <div class="d-flex align-items-center text-muted small bg-light rounded-pill px-3 py-1 w-fit border">
                      <span class="fw-medium">{{ campagne.dateDebut | date:'dd/MM/yyyy' }}</span>
                      <i class="bi bi-arrow-right mx-2 text-muted opacity-50"></i>
                      <span class="fw-medium">{{ campagne.dateFin | date:'dd/MM/yyyy' }}</span>
                    </div>
                  </td>

                  <!-- Statut -->
                  <td>
                      <span *ngIf="campagne.active" class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                        <i class="bi bi-unlock-fill me-1"></i> OUVERTE
                      </span>
                    <span *ngIf="!campagne.active" class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 rounded-pill">
                        <i class="bi bi-lock-fill me-1"></i> FERMÉE
                      </span>
                  </td>

                  <!-- Actions -->
                  <td class="text-end pe-4">
                    <div class="d-flex justify-content-end gap-2">
                      <a [routerLink]="['modifier', campagne.id]"
                         class="btn btn-outline-primary btn-sm px-3 shadow-sm rounded-pill d-flex align-items-center gap-1"
                         title="Modifier">
                        <i class="bi bi-pencil-fill"></i> Modifier
                      </a>
                      <button *ngIf="!campagne.active"
                              class="btn btn-success btn-sm px-3 shadow-sm rounded-pill d-flex align-items-center gap-1"
                              (click)="activer(campagne.id)"
                              title="Ouvrir les inscriptions">
                        <i class="bi bi-play-fill"></i> Ouvrir
                      </button>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </app-main-layout>
  `,
  styles: [`
    .w-fit { width: fit-content; }
    .icon-box { width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; }
    .btn-add { transition: transform 0.2s, background-color 0.2s; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; }
    .btn-add:hover { transform: scale(1.1); box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4); }
    .avatar-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
    .bg-gradient-blue { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
    .table thead th { border-bottom: 2px solid #f1f5f9; background-color: #f8fafc; font-size: 0.75rem; letter-spacing: 0.5px; padding-top: 1rem; padding-bottom: 1rem; }
    .table tbody td { vertical-align: middle; padding-top: 1rem; padding-bottom: 1rem; }
    .bg-success-subtle { background-color: #dcfce7 !important; color: #166534 !important; border-color: #bbf7d0 !important; }
    .bg-secondary-subtle { background-color: #f1f5f9 !important; color: #475569 !important; border-color: #e2e8f0 !important; }
    .fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class CampagneListComponent implements OnInit {
  campagnes = signal<Campagne[]>([]);
  isLoading = signal(true);

  constructor(private inscriptionService: InscriptionService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.inscriptionService.getAllCampagnes().subscribe({
      next: (data) => {
        this.campagnes.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  activer(id: number) {
    if(confirm('Voulez-vous ouvrir cette campagne aux inscriptions ?\nCela fermera automatiquement les autres campagnes.')) {
      this.inscriptionService.activerCampagne(id).subscribe(() => this.loadData());
    }
  }
}
