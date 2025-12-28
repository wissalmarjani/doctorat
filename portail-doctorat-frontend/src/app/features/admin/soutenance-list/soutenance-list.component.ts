import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { SoutenanceService } from '@core/services/soutenance.service';
import { Soutenance, StatutSoutenance } from '@core/models/soutenance.model';

@Component({
  selector: 'app-soutenance-list',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent, FormsModule],
  template: `
    <app-main-layout>
      <div class="soutenances-container p-4">

        <!-- PAGE HEADER -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">
              <i class="bi bi-mortarboard me-3"></i>
              Gestion des Soutenances
            </h1>
            <p class="page-subtitle">Gérez les demandes de soutenance des doctorants</p>
          </div>
          <button class="btn-refresh" (click)="loadSoutenances()">
            <i class="bi bi-arrow-clockwise me-2"></i>Actualiser
          </button>
        </div>

        <!-- STATS CARDS -->
        <div class="stats-row">
          <div class="stat-card stat-total">
            <div class="stat-icon"><i class="bi bi-collection"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ totalCount() }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
          <div class="stat-card stat-pending">
            <div class="stat-icon"><i class="bi bi-hourglass-split"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount() }}</span>
              <span class="stat-label">En attente directeur</span>
            </div>
          </div>
          <div class="stat-card stat-jury">
            <div class="stat-icon"><i class="bi bi-people"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ juryCount() }}</span>
              <span class="stat-label">Jury à valider</span>
            </div>
          </div>
          <div class="stat-card stat-authorized">
            <div class="stat-icon"><i class="bi bi-check-circle"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ authorizedCount() }}</span>
              <span class="stat-label">À planifier</span>
            </div>
          </div>
          <div class="stat-card stat-planned">
            <div class="stat-icon"><i class="bi bi-calendar-check"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ plannedCount() }}</span>
              <span class="stat-label">Planifiées</span>
            </div>
          </div>
          <div class="stat-card stat-done">
            <div class="stat-icon"><i class="bi bi-trophy"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ doneCount() }}</span>
              <span class="stat-label">Terminées</span>
            </div>
          </div>
        </div>

        <!-- FILTER TABS -->
        <div class="filter-section">
          <div class="filter-tabs">
            <button class="filter-tab" [class.active]="activeFilter() === 'all'" (click)="setFilter('all')">
              <i class="bi bi-grid me-2"></i>Toutes
              <span class="tab-count">{{ totalCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="activeFilter() === 'jury'" (click)="setFilter('jury')">
              <i class="bi bi-people me-2"></i>Jury à valider
              <span class="tab-count">{{ juryCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="activeFilter() === 'authorized'" (click)="setFilter('authorized')">
              <i class="bi bi-check-circle me-2"></i>À planifier
              <span class="tab-count">{{ authorizedCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="activeFilter() === 'planned'" (click)="setFilter('planned')">
              <i class="bi bi-calendar-event me-2"></i>Planifiées
              <span class="tab-count">{{ plannedCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="activeFilter() === 'done'" (click)="setFilter('done')">
              <i class="bi bi-check-circle me-2"></i>Terminées
              <span class="tab-count">{{ doneCount() }}</span>
            </button>
          </div>

          <!-- SEARCH -->
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Rechercher par nom ou sujet..."
                   [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)">
          </div>
        </div>

        <!-- SOUTENANCES LIST -->
        <div class="soutenances-list">
          @if (isLoading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Chargement des soutenances...</p>
            </div>
          } @else if (filteredSoutenances().length === 0) {
            <div class="empty-state">
              <i class="bi bi-inbox"></i>
              <h3>Aucune soutenance trouvée</h3>
              <p>{{ getEmptyMessage() }}</p>
            </div>
          } @else {
            @for (soutenance of filteredSoutenances(); track soutenance.id) {
              <div class="soutenance-card" [ngClass]="getCardClass(soutenance.statut)">

                <!-- CARD HEADER -->
                <div class="card-header">
                  <div class="doctorant-info">
                    <div class="avatar" [style.background]="getAvatarColor(soutenance.doctorantId)">
                      {{ getInitials(getDoctorantNom(soutenance)) }}
                    </div>
                    <div class="info">
                      <h4 class="doctorant-name">{{ getDoctorantNom(soutenance) }}</h4>
                      <div class="doctorant-contact">
                        <span class="contact-item">
                          <i class="bi bi-envelope"></i>
                          {{ soutenance.doctorantInfo?.email || 'Email non disponible' }}
                        </span>
                        @if (soutenance.doctorantInfo?.telephone) {
                          <span class="contact-item">
                            <i class="bi bi-telephone"></i>
                            {{ soutenance.doctorantInfo?.telephone }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                  <div class="status-badge" [ngClass]="getStatusBadgeClass(soutenance.statut)">
                    <i class="bi" [ngClass]="getStatusIcon(soutenance.statut)"></i>
                    {{ formatStatut(soutenance.statut) }}
                  </div>
                </div>

                <!-- CARD BODY -->
                <div class="card-body">
                  <!-- Titre de thèse -->
                  <div class="thesis-title">
                    <i class="bi bi-journal-text me-2"></i>
                    <span>{{ soutenance.titreThese || 'Titre non défini' }}</span>
                  </div>

                  <div class="card-details">
                    <!-- Directeur -->
                    <div class="detail-item">
                      <span class="detail-label">Directeur</span>
                      <span class="detail-value">{{ getDirecteurNom(soutenance) }}</span>
                    </div>

                    <!-- Date soumission -->
                    <div class="detail-item">
                      <span class="detail-label">Soumis le</span>
                      <span class="detail-value">{{ soutenance.createdAt | date:'dd/MM/yyyy' }}</span>
                    </div>

                    <!-- Date soutenance (si planifiée) -->
                    @if (soutenance.dateSoutenance) {
                      <div class="detail-item highlight">
                        <span class="detail-label">Date prévue</span>
                        <span class="detail-value">
                          {{ soutenance.dateSoutenance | date:'dd/MM/yyyy' }}
                          @if (soutenance.heureSoutenance) {
                            à {{ soutenance.heureSoutenance }}
                          }
                        </span>
                      </div>
                    }

                    <!-- Lieu (si défini) -->
                    @if (soutenance.lieuSoutenance) {
                      <div class="detail-item">
                        <span class="detail-label">Lieu</span>
                        <span class="detail-value">{{ soutenance.lieuSoutenance }}</span>
                      </div>
                    }

                    <!-- Jury -->
                    @if (hasMembresJury(soutenance)) {
                      <div class="detail-item">
                        <span class="detail-label">Jury</span>
                        <span class="detail-value">{{ getMembresJuryCount(soutenance) }} membre(s)</span>
                      </div>
                    }
                  </div>

                  <!-- DOCUMENTS -->
                  <div class="documents-section">
                    <span class="section-label">Documents :</span>
                    <div class="documents-row">
                      <!-- Manuscrit -->
                      <div class="doc-item"
                           [class.available]="hasManuscrit(soutenance)"
                           [class.clickable]="hasManuscrit(soutenance)"
                           (click)="hasManuscrit(soutenance) && openDocument(soutenance.cheminManuscrit!)">
                        <i class="bi" [ngClass]="hasManuscrit(soutenance) ? 'bi-file-earmark-pdf-fill' : 'bi-file-earmark-x'"></i>
                        <span>Manuscrit</span>
                        @if (hasManuscrit(soutenance)) {
                          <i class="bi bi-box-arrow-up-right download-icon"></i>
                        }
                      </div>

                      <!-- Rapport Anti-Plagiat -->
                      <div class="doc-item"
                           [class.available]="hasRapportPlagiat(soutenance)"
                           [class.clickable]="hasRapportPlagiat(soutenance)"
                           (click)="hasRapportPlagiat(soutenance) && openDocument(soutenance.cheminRapportAntiPlagiat!)">
                        <i class="bi" [ngClass]="hasRapportPlagiat(soutenance) ? 'bi-file-earmark-check-fill' : 'bi-file-earmark-x'"></i>
                        <span>Anti-Plagiat</span>
                        @if (hasRapportPlagiat(soutenance)) {
                          <i class="bi bi-box-arrow-up-right download-icon"></i>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- PRÉREQUIS - Depuis doctorantInfo -->
                  <div class="prerequis-section">
                    <span class="section-label">Prérequis du doctorant :</span>
                    <div class="prerequis-row">
                      <span class="prereq-item" [class.valid]="getDoctorantPublications(soutenance) >= 2">
                        <i class="bi" [ngClass]="getDoctorantPublications(soutenance) >= 2 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                        {{ getDoctorantPublications(soutenance) }}/2 Publications
                      </span>
                      <span class="prereq-item" [class.valid]="getDoctorantConferences(soutenance) >= 2">
                        <i class="bi" [ngClass]="getDoctorantConferences(soutenance) >= 2 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                        {{ getDoctorantConferences(soutenance) }}/2 Conférences
                      </span>
                      <span class="prereq-item" [class.valid]="getDoctorantHeuresFormation(soutenance) >= 200">
                        <i class="bi" [ngClass]="getDoctorantHeuresFormation(soutenance) >= 200 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                        {{ getDoctorantHeuresFormation(soutenance) }}/200h Formation
                      </span>
                    </div>
                  </div>
                </div>

                <!-- CARD FOOTER - Actions selon le statut -->
                <div class="card-footer">
                  <button class="btn-action btn-details" (click)="voirDetails(soutenance.id)">
                    <i class="bi bi-eye me-2"></i>Voir détails
                  </button>

                  <!-- JURY_PROPOSE → Admin peut valider ou refuser le jury -->
                  @if (isStatut(soutenance, StatutSoutenance.JURY_PROPOSE)) {
                    <button class="btn-action btn-success" (click)="validerJury(soutenance)">
                      <i class="bi bi-check-lg me-2"></i>Valider jury
                    </button>
                    <button class="btn-action btn-warning" (click)="refuserJury(soutenance)">
                      <i class="bi bi-x-lg me-2"></i>Refuser jury
                    </button>
                  }

                  <!-- AUTORISEE → Admin peut planifier -->
                  @if (isStatut(soutenance, StatutSoutenance.AUTORISEE)) {
                    <button class="btn-action btn-primary" (click)="planifierSoutenance(soutenance)">
                      <i class="bi bi-calendar-plus me-2"></i>Planifier
                    </button>
                  }

                  <!-- PLANIFIEE → Admin peut enregistrer le résultat -->
                  @if (isStatut(soutenance, StatutSoutenance.PLANIFIEE)) {
                    <button class="btn-action btn-success" (click)="enregistrerResultat(soutenance)">
                      <i class="bi bi-trophy me-2"></i>Enregistrer résultat
                    </button>
                  }
                </div>
              </div>
            }
          }
        </div>
      </div>
    </app-main-layout>
  `,
  styles: [`
    .soutenances-container { max-width: 1400px; margin: 0 auto; }

    /* PAGE HEADER */
    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-title { font-size: 1.75rem; font-weight: 800; margin: 0; display: flex; align-items: center; }
    .page-subtitle { margin: 0.5rem 0 0 0; opacity: 0.9; }
    .btn-refresh {
      padding: 0.75rem 1.5rem;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .btn-refresh:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.2); }

    /* STATS ROW */
    .stats-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }
    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .stat-total .stat-icon { background: #e0e7ff; color: #4f46e5; }
    .stat-pending .stat-icon { background: #fef3c7; color: #d97706; }
    .stat-jury .stat-icon { background: #dbeafe; color: #2563eb; }
    .stat-authorized .stat-icon { background: #d1fae5; color: #059669; }
    .stat-planned .stat-icon { background: #fce7f3; color: #db2777; }
    .stat-done .stat-icon { background: #ede9fe; color: #7c3aed; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: #1e293b; display: block; }
    .stat-label { font-size: 0.75rem; color: #64748b; }

    /* FILTER SECTION */
    .filter-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      background: white;
      padding: 0.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      flex-wrap: wrap;
    }
    .filter-tab {
      padding: 0.75rem 1.25rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .filter-tab:hover { background: #f1f5f9; }
    .filter-tab.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .tab-count { background: rgba(255,255,255,0.2); padding: 0.15rem 0.5rem; border-radius: 20px; font-size: 0.75rem; }
    .filter-tab:not(.active) .tab-count { background: #e2e8f0; color: #475569; }
    .search-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: white;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      min-width: 280px;
    }
    .search-box i { color: #94a3b8; }
    .search-box input { border: none; outline: none; flex: 1; font-size: 0.9rem; }

    /* SOUTENANCES LIST */
    .soutenances-list { display: flex; flex-direction: column; gap: 1rem; }

    /* LOADING & EMPTY STATES */
    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      background: white;
      border-radius: 20px;
      text-align: center;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state i { font-size: 4rem; color: #cbd5e1; margin-bottom: 1rem; }
    .empty-state h3 { color: #475569; margin: 0 0 0.5rem 0; }
    .empty-state p { color: #94a3b8; margin: 0; }

    /* SOUTENANCE CARD */
    .soutenance-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      border-left: 4px solid #e2e8f0;
      transition: all 0.2s;
    }
    .soutenance-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.1); transform: translateY(-2px); }
    .soutenance-card.status-soumis { border-left-color: #f59e0b; }
    .soutenance-card.status-prerequis { border-left-color: #3b82f6; }
    .soutenance-card.status-jury { border-left-color: #8b5cf6; }
    .soutenance-card.status-autorisee { border-left-color: #10b981; }
    .soutenance-card.status-planifiee { border-left-color: #ec4899; }
    .soutenance-card.status-terminee { border-left-color: #7c3aed; }
    .soutenance-card.status-rejetee { border-left-color: #ef4444; }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .doctorant-info { display: flex; align-items: center; gap: 1rem; }
    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1rem;
    }
    .doctorant-name { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
    .doctorant-contact { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.25rem; }
    .contact-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: #64748b; }
    .contact-item i { color: #8b5cf6; }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .status-badge.status-soumis { background: #fef3c7; color: #d97706; }
    .status-badge.status-prerequis { background: #dbeafe; color: #2563eb; }
    .status-badge.status-jury { background: #ede9fe; color: #7c3aed; }
    .status-badge.status-autorisee { background: #d1fae5; color: #059669; }
    .status-badge.status-planifiee { background: #fce7f3; color: #db2777; }
    .status-badge.status-terminee { background: #ede9fe; color: #7c3aed; }
    .status-badge.status-rejetee { background: #fee2e2; color: #dc2626; }

    .card-body { padding: 1.25rem; }
    .thesis-title { font-size: 0.95rem; color: #334155; margin-bottom: 1rem; display: flex; align-items: flex-start; }
    .thesis-title i { color: #667eea; flex-shrink: 0; }
    .card-details { display: flex; gap: 2rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .detail-item.highlight .detail-value { color: #059669; font-weight: 700; }
    .detail-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .detail-value { font-size: 0.9rem; color: #334155; font-weight: 600; }

    /* DOCUMENTS SECTION */
    .documents-section { margin-bottom: 1rem; padding: 1rem; background: #f8fafc; border-radius: 10px; }
    .section-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 0.75rem; }
    .documents-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .doc-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: white;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #94a3b8;
      border: 1px solid #e2e8f0;
    }
    .doc-item.available { color: #059669; border-color: #d1fae5; background: #f0fdf4; }
    .doc-item.clickable { cursor: pointer; transition: all 0.2s; }
    .doc-item.clickable:hover { background: #dcfce7; transform: scale(1.02); }
    .doc-item .download-icon { margin-left: 0.5rem; font-size: 0.9rem; }
    .doc-item i:first-child { font-size: 1.1rem; }

    /* PREREQUIS SECTION */
    .prerequis-section { padding: 1rem; background: #f8fafc; border-radius: 10px; }
    .prerequis-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .prereq-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #ef4444; }
    .prereq-item.valid { color: #059669; }

    /* CARD FOOTER */
    .card-footer {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      flex-wrap: wrap;
    }
    .btn-action {
      padding: 0.6rem 1.25rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.2s;
    }
    .btn-action:hover { transform: translateY(-1px); }
    .btn-details { background: #f1f5f9; color: #475569; }
    .btn-details:hover { background: #e2e8f0; }
    .btn-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
    .btn-primary { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; }
    .btn-warning { background: #fef3c7; color: #b45309; border: 1px solid #fcd34d; }
    .btn-warning:hover { background: #fde68a; }

    /* RESPONSIVE */
    @media (max-width: 1400px) { .stats-row { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .filter-section { flex-direction: column; align-items: stretch; }
      .search-box { min-width: 100%; }
      .card-details { flex-direction: column; gap: 0.75rem; }
    }
  `]
})
export class SoutenanceListComponent implements OnInit {
  StatutSoutenance = StatutSoutenance;

  soutenances = signal<Soutenance[]>([]);
  isLoading = signal(true);
  activeFilter = signal<'all' | 'pending' | 'jury' | 'authorized' | 'planned' | 'done'>('all');
  searchTerm = signal('');

  // Compteurs
  totalCount = computed(() => this.soutenances().length);
  pendingCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.SOUMIS).length);
  juryCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.JURY_PROPOSE).length);
  authorizedCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.AUTORISEE).length);
  plannedCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.PLANIFIEE).length);
  doneCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.TERMINEE).length);

  // Liste filtrée
  filteredSoutenances = computed(() => {
    let result = this.soutenances();

    switch (this.activeFilter()) {
      case 'pending': result = result.filter(s => s.statut === StatutSoutenance.SOUMIS); break;
      case 'jury': result = result.filter(s => s.statut === StatutSoutenance.JURY_PROPOSE); break;
      case 'authorized': result = result.filter(s => s.statut === StatutSoutenance.AUTORISEE); break;
      case 'planned': result = result.filter(s => s.statut === StatutSoutenance.PLANIFIEE); break;
      case 'done': result = result.filter(s => s.statut === StatutSoutenance.TERMINEE); break;
    }

    const search = this.searchTerm().toLowerCase();
    if (search) {
      result = result.filter(s =>
          this.getDoctorantNom(s).toLowerCase().includes(search) ||
          (s.titreThese?.toLowerCase().includes(search))
      );
    }

    return result;
  });

  constructor(private soutenanceService: SoutenanceService, private router: Router) {}

  ngOnInit(): void {
    this.loadSoutenances();
  }

  loadSoutenances(): void {
    this.isLoading.set(true);
    this.soutenanceService.getAllSoutenances().subscribe({
      next: (data: Soutenance[]) => {
        // Filtrer les brouillons
        const filtered = data.filter(s => s.statut !== StatutSoutenance.BROUILLON);
        this.soutenances.set(filtered);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        console.error('Erreur:', err);
        this.isLoading.set(false);
      }
    });
  }

  setFilter(filter: 'all' | 'pending' | 'jury' | 'authorized' | 'planned' | 'done'): void {
    this.activeFilter.set(filter);
  }

  // ========================================
  // HELPERS - Utilise doctorantInfo
  // ========================================

  getDoctorantNom(soutenance: Soutenance): string {
    if (soutenance.doctorantInfo) {
      return `${soutenance.doctorantInfo.prenom} ${soutenance.doctorantInfo.nom}`;
    }
    return `Doctorant #${soutenance.doctorantId}`;
  }

  getDirecteurNom(soutenance: Soutenance): string {
    if (soutenance.directeurInfo) {
      return `${soutenance.directeurInfo.prenom} ${soutenance.directeurInfo.nom}`;
    }
    return `Directeur #${soutenance.directeurId}`;
  }

  // Prérequis depuis doctorantInfo (enrichi par OpenFeign)
  getDoctorantPublications(soutenance: Soutenance): number {
    const info = soutenance.doctorantInfo as any;
    if (info?.nbPublications != null) return info.nbPublications;
    if (info?.nb_publications != null) return info.nb_publications;
    if (soutenance.prerequis?.nombreArticlesQ1Q2 != null) return soutenance.prerequis.nombreArticlesQ1Q2;
    return 0;
  }

  getDoctorantConferences(soutenance: Soutenance): number {
    const info = soutenance.doctorantInfo as any;
    if (info?.nbConferences != null) return info.nbConferences;
    if (info?.nb_conferences != null) return info.nb_conferences;
    if (soutenance.prerequis?.nombreConferences != null) return soutenance.prerequis.nombreConferences;
    return 0;
  }

  getDoctorantHeuresFormation(soutenance: Soutenance): number {
    const info = soutenance.doctorantInfo as any;
    if (info?.heuresFormation != null) return info.heuresFormation;
    if (info?.heures_formation != null) return info.heures_formation;
    if (soutenance.prerequis?.heuresFormation != null) return soutenance.prerequis.heuresFormation;
    return 0;
  }

  hasManuscrit(soutenance: Soutenance): boolean {
    return !!soutenance.cheminManuscrit && soutenance.cheminManuscrit.length > 0;
  }

  hasRapportPlagiat(soutenance: Soutenance): boolean {
    return !!soutenance.cheminRapportAntiPlagiat && soutenance.cheminRapportAntiPlagiat.length > 0;
  }

  hasMembresJury(soutenance: Soutenance): boolean {
    return !!soutenance.membresJury && soutenance.membresJury.length > 0;
  }

  getMembresJuryCount(soutenance: Soutenance): number {
    return soutenance.membresJury?.length || 0;
  }

  isStatut(soutenance: Soutenance, statut: StatutSoutenance): boolean {
    return soutenance.statut === statut;
  }

  openDocument(filepath: string): void {
    this.soutenanceService.openDocument(filepath);
  }

  // ========================================
  // STYLE HELPERS
  // ========================================

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    return name.charAt(0).toUpperCase();
  }

  getAvatarColor(id: number): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
    ];
    return colors[(id || 0) % colors.length];
  }

  getCardClass(statut: StatutSoutenance): string {
    switch (statut) {
      case StatutSoutenance.SOUMIS: return 'status-soumis';
      case StatutSoutenance.PREREQUIS_VALIDES: return 'status-prerequis';
      case StatutSoutenance.JURY_PROPOSE: return 'status-jury';
      case StatutSoutenance.AUTORISEE: return 'status-autorisee';
      case StatutSoutenance.PLANIFIEE: return 'status-planifiee';
      case StatutSoutenance.TERMINEE: return 'status-terminee';
      case StatutSoutenance.REJETEE: return 'status-rejetee';
      default: return '';
    }
  }

  getStatusBadgeClass(statut: StatutSoutenance): string {
    switch (statut) {
      case StatutSoutenance.SOUMIS: return 'status-soumis';
      case StatutSoutenance.PREREQUIS_VALIDES: return 'status-prerequis';
      case StatutSoutenance.JURY_PROPOSE: return 'status-jury';
      case StatutSoutenance.AUTORISEE: return 'status-autorisee';
      case StatutSoutenance.PLANIFIEE: return 'status-planifiee';
      case StatutSoutenance.TERMINEE: return 'status-terminee';
      case StatutSoutenance.REJETEE: return 'status-rejetee';
      default: return '';
    }
  }

  getStatusIcon(statut: StatutSoutenance): string {
    switch (statut) {
      case StatutSoutenance.BROUILLON: return 'bi-pencil';
      case StatutSoutenance.SOUMIS: return 'bi-clock-history';
      case StatutSoutenance.PREREQUIS_VALIDES: return 'bi-check-circle';
      case StatutSoutenance.JURY_PROPOSE: return 'bi-people';
      case StatutSoutenance.AUTORISEE: return 'bi-check-circle-fill';
      case StatutSoutenance.PLANIFIEE: return 'bi-calendar-check';
      case StatutSoutenance.TERMINEE: return 'bi-trophy';
      case StatutSoutenance.REJETEE: return 'bi-x-circle';
      default: return 'bi-file-earmark';
    }
  }

  formatStatut(statut: StatutSoutenance): string {
    const labels: Record<string, string> = {
      'BROUILLON': 'Brouillon',
      'SOUMIS': 'En attente directeur',
      'PREREQUIS_VALIDES': 'Prérequis validés',
      'JURY_PROPOSE': 'Jury proposé',
      'AUTORISEE': 'À planifier',
      'PLANIFIEE': 'Planifiée',
      'TERMINEE': 'Terminée',
      'REJETEE': 'Rejetée'
    };
    return labels[statut] || statut;
  }

  getEmptyMessage(): string {
    switch (this.activeFilter()) {
      case 'pending': return 'Aucune soutenance en attente du directeur';
      case 'jury': return 'Aucun jury à valider';
      case 'authorized': return 'Aucune soutenance à planifier';
      case 'planned': return 'Aucune soutenance planifiée';
      case 'done': return 'Aucune soutenance terminée';
      default: return 'Aucune soutenance dans le système';
    }
  }

  // ========================================
  // ACTIONS ADMIN
  // ========================================

  voirDetails(soutenanceId: number): void {
    this.router.navigate(['/admin/soutenances', soutenanceId]);
  }

  validerJury(soutenance: Soutenance): void {
    if (confirm(`Valider le jury pour la soutenance de ${this.getDoctorantNom(soutenance)} ?`)) {
      this.soutenanceService.validerJury(soutenance.id, 'Jury validé par l\'administration').subscribe({
        next: () => {
          alert('Jury validé ! La soutenance est maintenant autorisée.');
          this.loadSoutenances();
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la validation du jury');
        }
      });
    }
  }

  refuserJury(soutenance: Soutenance): void {
    const motif = prompt('Motif du refus du jury :');
    if (motif && motif.trim()) {
      this.soutenanceService.refuserJury(soutenance.id, motif.trim()).subscribe({
        next: () => {
          alert('Jury refusé. Le directeur doit proposer un nouveau jury.');
          this.loadSoutenances();
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors du refus du jury');
        }
      });
    }
  }

  planifierSoutenance(soutenance: Soutenance): void {
    // Rediriger vers la page de détail pour planifier
    this.router.navigate(['/admin/soutenances', soutenance.id], { queryParams: { action: 'planifier' } });
  }

  enregistrerResultat(soutenance: Soutenance): void {
    // Rediriger vers la page de détail pour enregistrer le résultat
    this.router.navigate(['/admin/soutenances', soutenance.id], { queryParams: { action: 'resultat' } });
  }
}