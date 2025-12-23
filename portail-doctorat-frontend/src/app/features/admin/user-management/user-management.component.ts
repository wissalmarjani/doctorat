import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterLink, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="page-container p-4">

        <!-- EN-TÊTE -->
        <div class="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 class="fw-bold text-dark mb-1">Gestion des Utilisateurs</h2>
            <p class="text-muted mb-0">Validez les inscriptions et gérez les comptes académiques.</p>
          </div>
          <button class="btn btn-light text-primary fw-bold shadow-sm rounded-pill px-4 d-flex align-items-center gap-2"
                  (click)="loadData()"
                  [disabled]="isLoading()">
            <span *ngIf="isLoading()" class="spinner-border spinner-border-sm"></span>
            <i *ngIf="!isLoading()" class="bi bi-arrow-clockwise"></i>
            Actualiser
          </button>
        </div>

        <!-- SWITCHER (3 ONGLETS) -->
        <div class="switcher-container mb-5">
          <div class="switcher">
            <!-- 1. CANDIDATS -->
            <button class="switcher-btn" [class.active]="activeTab === 'CANDIDATS'" (click)="setTab('CANDIDATS')">
              <i class="bi bi-person-lines-fill me-2"></i> Candidatures
              <span *ngIf="candidats().length > 0" class="badge bg-white text-danger ms-2 shadow-sm rounded-pill">
                {{ candidats().length }}
              </span>
            </button>

            <!-- 2. DIRECTEURS -->
            <button class="switcher-btn" [class.active]="activeTab === 'DIRECTEURS'" (click)="setTab('DIRECTEURS')">
              <i class="bi bi-person-video3 me-2"></i> Directeurs
            </button>

            <!-- 3. DOCTORANTS (NOUVEAU) -->
            <button class="switcher-btn" [class.active]="activeTab === 'DOCTORANTS'" (click)="setTab('DOCTORANTS')">
              <i class="bi bi-mortarboard-fill me-2"></i> Doctorants
              <span class="badge bg-white-glass ms-2 rounded-pill small-badge">{{ doctorants().length }}</span>
            </button>
          </div>
        </div>

        <!-- ==================== SECTION CANDIDATS ==================== -->
        @if (activeTab === 'CANDIDATS') {
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                <tr>
                  <th class="ps-4 py-3 text-uppercase small fw-bold text-muted">Candidat</th>
                  <th class="text-uppercase small fw-bold text-muted">Contact</th>
                  <th class="text-uppercase small fw-bold text-muted">Date Inscription</th>
                  <th class="text-end pe-4 text-uppercase small fw-bold text-muted">Décision</th>
                </tr>
                </thead>
                <tbody>
                  @for (user of candidats(); track user.id) {
                    <tr>
                      <td class="ps-4">
                        <div class="d-flex align-items-center">
                          <div class="avatar-circle bg-gradient-orange me-3 text-white shadow-sm">
                            {{ user.nom.charAt(0).toUpperCase() }}
                          </div>
                          <div>
                            <div class="fw-bold text-dark">{{ user.nom }} {{ user.prenom }}</div>
                            <div class="small text-muted font-monospace">
                              <i class="bi bi-card-heading me-1"></i>{{ user.username }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="text-dark mb-1">{{ user.email }}</div>
                        <div *ngIf="user.telephone" class="small text-muted">
                          <i class="bi bi-phone me-1"></i>{{ user.telephone }}
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark border">
                          {{ user.createdAt ? (user.createdAt | date:'dd MMM yyyy') : 'N/A' }}
                        </span>
                      </td>
                      <td class="text-end pe-4">
                        <div class="d-flex gap-2 justify-content-end">
                          <button class="btn btn-success btn-sm px-3 shadow-sm rounded-pill d-flex align-items-center gap-1"
                                  (click)="accepterCandidat(user)" title="Valider le dossier">
                            <i class="bi bi-check-lg"></i> Valider
                          </button>

                          <button class="btn btn-outline-danger btn-sm px-3 shadow-sm rounded-pill d-flex align-items-center gap-1"
                                  (click)="refuserCandidat(user)" title="Rejeter la candidature">
                            <i class="bi bi-x-lg"></i> Refuser
                          </button>
                        </div>
                      </td>
                    </tr>
                  }

                  @if (candidats().length === 0) {
                    <tr>
                      <td colspan="4" class="text-center py-5">
                        <div class="empty-state">
                          <h5 class="fw-bold text-dark mb-1">Aucune candidature</h5>
                          <span class="text-muted small">Tout est à jour.</span>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ==================== SECTION DIRECTEURS ==================== -->
        @if (activeTab === 'DIRECTEURS') {
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in">
            <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center pe-4 ps-4">
              <div class="d-flex align-items-center">
                <h5 class="mb-0 fw-bold text-primary">
                  <i class="bi bi-list-ul me-2"></i> Liste des Directeurs
                </h5>
                <span class="badge bg-primary-subtle text-primary rounded-pill ms-3">
                  {{ directeurs().length }} actifs
                </span>
              </div>

              <a [routerLink]="['/admin/users/new-director']"
                 class="btn btn-primary btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center btn-add"
                 style="width: 36px; height: 36px;"
                 title="Ajouter un nouveau directeur">
                <i class="bi bi-plus-lg fs-5"></i>
              </a>
            </div>

            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="bg-light">
                  <tr>
                    <th class="ps-4 py-3 text-uppercase small fw-bold text-muted">Identité</th>
                    <th class="text-uppercase small fw-bold text-muted">Email</th>
                    <th class="text-end pe-4 text-uppercase small fw-bold text-muted">ID Système</th>
                  </tr>
                  </thead>
                  <tbody>
                    @for (dir of directeurs(); track dir.id) {
                      <tr>
                        <td class="ps-4">
                          <div class="d-flex align-items-center">
                            <div class="avatar-sm bg-primary-subtle text-primary me-3 rounded-3">
                              <i class="bi bi-person-video3"></i>
                            </div>
                            <span class="fw-bold text-dark">{{ dir.nom }} {{ dir.prenom }}</span>
                          </div>
                        </td>
                        <td class="text-muted">{{ dir.email }}</td>
                        <td class="text-end pe-4">
                          <span class="badge bg-light text-secondary border">#{{ dir.id }}</span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- ==================== SECTION DOCTORANTS (NOUVEAU) ==================== -->
        @if (activeTab === 'DOCTORANTS') {
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in">
            <div class="card-header bg-white py-3 border-bottom ps-4">
              <h5 class="mb-0 fw-bold text-success">
                <i class="bi bi-mortarboard-fill me-2"></i> Liste des Doctorants
              </h5>
            </div>

            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="bg-light">
                  <tr>
                    <th class="ps-4 py-3 text-uppercase small fw-bold text-muted">Doctorant</th>
                    <th class="text-uppercase small fw-bold text-muted">Matricule</th>
                    <th class="text-uppercase small fw-bold text-muted">Contact</th>
                    <th class="text-end pe-4 text-uppercase small fw-bold text-muted">Statut</th>
                  </tr>
                  </thead>
                  <tbody>
                    @for (doc of doctorants(); track doc.id) {
                      <tr>
                        <td class="ps-4">
                          <div class="d-flex align-items-center">
                            <div class="avatar-circle bg-gradient-green me-3 text-white shadow-sm">
                              {{ doc.nom.charAt(0).toUpperCase() }}
                            </div>
                            <div>
                              <div class="fw-bold text-dark">{{ doc.nom }} {{ doc.prenom }}</div>
                              <div class="small text-muted">Inscrit le {{ doc.createdAt | date:'dd/MM/yyyy' }}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="font-monospace fw-bold text-dark bg-light px-2 py-1 rounded">
                            {{ doc.username }}
                          </span>
                        </td>
                        <td>
                          <div class="text-dark">{{ doc.email }}</div>
                          <div *ngIf="doc.telephone" class="small text-muted">
                            <i class="bi bi-phone me-1"></i>{{ doc.telephone }}
                          </div>
                        </td>
                        <td class="text-end pe-4">
                          <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill">
                            <i class="bi bi-check-circle-fill me-1"></i> ACTIF
                          </span>
                        </td>
                      </tr>
                    }

                    @if (doctorants().length === 0) {
                      <tr>
                        <td colspan="4" class="text-center py-5">
                          <div class="text-muted small">Aucun doctorant inscrit.</div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

      </div>
    </app-main-layout>
  `,
  styles: [`
    /* SWITCHER */
    .switcher-container { background-color: #e2e8f0; padding: 5px; border-radius: 16px; display: inline-block; width: 100%; max-width: 800px; }
    .switcher { display: flex; }
    .switcher-btn { flex: 1; background: transparent; border: none; padding: 12px 20px; font-weight: 600; color: #64748b; border-radius: 12px; transition: all 0.3s; display: flex; align-items: center; justify-content: center; }
    .switcher-btn:hover { background-color: rgba(255,255,255,0.5); }
    .switcher-btn.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3); }

    /* AVATARS & COULEURS */
    .avatar-circle { width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; }
    .bg-gradient-orange { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
    .bg-gradient-green { background: linear-gradient(135deg, #42e695 0%, #3bb2b8 100%); }

    .avatar-sm { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }

    .small-badge { color: #667eea; font-weight: 800; }
    .bg-white-glass { background: rgba(255,255,255,0.9); }

    /* BOUTONS */
    .btn-add { transition: transform 0.2s, background-color 0.2s; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; }
    .btn-add:hover { transform: scale(1.1); box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4); }

    /* BADGES */
    .bg-primary-subtle { background-color: #e0f2fe !important; color: #0284c7 !important; }
    .bg-success-subtle { background-color: #dcfce7 !important; color: #166534 !important; border-color: #bbf7d0 !important; }

    /* ANIMATION */
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class UserManagementComponent implements OnInit {

  activeTab = 'CANDIDATS';
  candidats = signal<User[]>([]);
  directeurs = signal<User[]>([]);
  doctorants = signal<User[]>([]); // ✅ Nouveau Signal
  isLoading = signal(false);

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadData();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    this.userService.getUsersByRole('CANDIDAT').subscribe({
      next: users => {
        this.candidats.set(users);
        // On arrête le loading seulement si c'est la dernière requête
      },
      error: err => console.error(err)
    });

    this.userService.getUsersByRole('DIRECTEUR_THESE').subscribe({
      next: users => this.directeurs.set(users),
      error: err => console.error(err)
    });

    // ✅ CHARGEMENT DES DOCTORANTS
    this.userService.getUsersByRole('DOCTORANT').subscribe({
      next: users => {
        this.doctorants.set(users);
        this.isLoading.set(false);
      },
      error: err => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  accepterCandidat(user: User) {
    if (confirm(`Activer le compte de ${user.nom} ${user.prenom} ?`)) {
      this.userService.updateRole(user.id, 'DOCTORANT').subscribe({
        next: () => {
          alert('Candidat validé avec succès !');
          this.loadData();
        },
        error: () => alert("Erreur lors de l'activation.")
      });
    }
  }

  refuserCandidat(user: User) {
    if (confirm(`Êtes-vous sûr de vouloir rejeter la candidature de ${user.nom} ?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          alert('Candidature rejetée.');
          this.loadData();
        },
        error: () => alert("Erreur lors de la suppression")
      });
    }
  }
}