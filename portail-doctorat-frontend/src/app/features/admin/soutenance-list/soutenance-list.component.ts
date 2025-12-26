import { Component, OnInit, signal } from '@angular/core';
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
      <div class="page-container p-4">

        <!-- HEADER -->
        <div class="page-header mb-4">
          <div class="header-content">
            <div class="header-text">
              <h1 class="page-title">Gestion des Soutenances</h1>
              <p class="page-subtitle">Examinez et planifiez les soutenances de thèse</p>
            </div>
            <button class="btn-refresh" (click)="loadData()" [disabled]="isLoading()">
              @if (isLoading()) {
                <span class="spinner-border spinner-border-sm"></span>
              } @else {
                <i class="bi bi-arrow-clockwise"></i>
              }
              Actualiser
            </button>
          </div>
        </div>

        <!-- STATS CARDS -->
        <div class="stats-row mb-4">
          <div class="stat-card stat-pending">
            <div class="stat-icon">
              <i class="bi bi-hourglass-split"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ getCountByStatut(StatutSoutenance.SOUMIS) }}</span>
              <span class="stat-label">En attente</span>
            </div>
          </div>

          <div class="stat-card stat-validated">
            <div class="stat-icon">
              <i class="bi bi-check-circle"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ getCountByStatut(StatutSoutenance.JURY_PROPOSE) }}</span>
              <span class="stat-label">Jury à valider</span>
            </div>
          </div>

          <div class="stat-card stat-planned">
            <div class="stat-icon">
              <i class="bi bi-calendar-check"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ getCountByStatut(StatutSoutenance.PLANIFIEE) + getCountByStatut(StatutSoutenance.AUTORISEE) }}</span>
              <span class="stat-label">Planifiées</span>
            </div>
          </div>

          <div class="stat-card stat-done">
            <div class="stat-icon">
              <i class="bi bi-mortarboard"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ getCountByStatut(StatutSoutenance.TERMINEE) }}</span>
              <span class="stat-label">Terminées</span>
            </div>
          </div>
        </div>

        <!-- FILTRES -->
        <div class="filters-bar mb-4">
          <div class="filter-tabs">
            <button class="filter-tab"
                    [class.active]="activeFilter === 'ALL'"
                    (click)="setFilter('ALL')">
              <i class="bi bi-grid-3x3-gap me-2"></i>Toutes
              <span class="filter-count">{{ allSoutenances().length }}</span>
            </button>
            <button class="filter-tab"
                    [class.active]="activeFilter === 'SOUMIS'"
                    (click)="setFilter('SOUMIS')">
              <i class="bi bi-clock-history me-2"></i>À examiner
              <span class="filter-count warning">{{ getCountByStatut(StatutSoutenance.SOUMIS) }}</span>
            </button>
            <button class="filter-tab"
                    [class.active]="activeFilter === 'JURY'"
                    (click)="setFilter('JURY')">
              <i class="bi bi-people me-2"></i>Jury à valider
              <span class="filter-count info">{{ getCountByStatut(StatutSoutenance.JURY_PROPOSE) }}</span>
            </button>
            <button class="filter-tab"
                    [class.active]="activeFilter === 'PLANIFIEE'"
                    (click)="setFilter('PLANIFIEE')">
              <i class="bi bi-calendar-event me-2"></i>Planifiées
            </button>
            <button class="filter-tab"
                    [class.active]="activeFilter === 'TERMINEE'"
                    (click)="setFilter('TERMINEE')">
              <i class="bi bi-trophy me-2"></i>Terminées
            </button>
          </div>
        </div>

        <!-- LISTE DES SOUTENANCES -->
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des soutenances...</p>
          </div>
        } @else if (filteredSoutenances().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <i class="bi bi-inbox"></i>
            </div>
            <h3>Aucune soutenance</h3>
            <p>{{ getEmptyMessage() }}</p>
          </div>
        } @else {
          <div class="soutenances-grid">
            @for (soutenance of filteredSoutenances(); track soutenance.id) {
              <div class="soutenance-card" [class]="getCardClass(soutenance.statut)" (click)="voirDetails(soutenance)">

                <!-- HEADER CARD -->
                <div class="card-header">
                  <div class="status-badge" [class]="getBadgeClass(soutenance.statut)">
                    <i class="bi" [class]="getStatusIcon(soutenance.statut)"></i>
                    {{ formatStatut(soutenance.statut) }}
                  </div>
                  <span class="card-id">#{{ soutenance.id }}</span>
                </div>

                <!-- DOCTORANT INFO -->
                <div class="doctorant-section">
                  <div class="avatar" [style.background]="getAvatarColor(soutenance.doctorantId)">
                    {{ getInitials(soutenance.doctorantNom) }}
                  </div>
                  <div class="doctorant-info">
                    <h4 class="doctorant-name">
                      {{ soutenance.doctorantNom || 'Doctorant #' + soutenance.doctorantId }}
                    </h4>
                    <span class="doctorant-id">
                      <i class="bi bi-person-badge me-1"></i>
                      ID: {{ soutenance.doctorantId }}
                    </span>
                  </div>
                </div>

                <!-- THÈSE INFO -->
                <div class="these-section">
                  <h5 class="these-title" [title]="soutenance.sujetThese">
                    {{ soutenance.sujetThese || 'Sujet non défini' }}
                  </h5>
                  <div class="these-meta">
                    <span class="meta-item">
                      <i class="bi bi-person-video3"></i>
                      {{ soutenance.directeurNom || 'Directeur #' + soutenance.directeurId }}
                    </span>
                    @if (soutenance.dateSoutenance) {
                      <span class="meta-item">
                        <i class="bi bi-calendar3"></i>
                        {{ soutenance.dateSoutenance | date:'dd MMM yyyy' }}
                      </span>
                    }
                  </div>
                </div>

                <!-- JURY COUNT -->
                @if (soutenance.jury && soutenance.jury.length > 0) {
                  <div class="jury-info">
                    <i class="bi bi-people-fill"></i>
                    {{ soutenance.jury.length }} membre(s) du jury
                  </div>
                }

                <!-- ACTIONS -->
                <div class="card-actions">
                  @if (isStatut(soutenance, StatutSoutenance.SOUMIS)) {
                    <button class="btn-action btn-primary" (click)="examinerDemande($event, soutenance)">
                      <i class="bi bi-eye me-2"></i>Examiner
                    </button>
                  } @else if (isStatut(soutenance, StatutSoutenance.JURY_PROPOSE)) {
                    <button class="btn-action btn-info" (click)="planifier($event, soutenance)">
                      <i class="bi bi-calendar-plus me-2"></i>Planifier
                    </button>
                  } @else if (isStatut(soutenance, StatutSoutenance.PLANIFIEE)) {
                    <button class="btn-action btn-success" (click)="autoriser($event, soutenance)">
                      <i class="bi bi-check-lg me-2"></i>Autoriser
                    </button>
                  } @else if (isStatut(soutenance, StatutSoutenance.AUTORISEE)) {
                    <button class="btn-action btn-purple" (click)="marquerTerminee($event, soutenance)">
                      <i class="bi bi-mortarboard me-2"></i>Terminer
                    </button>
                  } @else {
                    <button class="btn-action btn-outline" (click)="voirDetailsClick($event, soutenance)">
                      <i class="bi bi-eye me-2"></i>Voir détails
                    </button>
                  }
                </div>

              </div>
            }
          </div>
        }

      </div>
    </app-main-layout>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    /* HEADER */
    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 2rem;
      color: white;
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
    }

    .page-subtitle {
      margin: 0;
      opacity: 0.9;
    }

    .btn-refresh {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-refresh:hover {
      background: rgba(255,255,255,0.3);
    }

    /* STATS */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

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

    .stat-card.stat-pending .stat-icon { background: #fef3c7; color: #d97706; }
    .stat-card.stat-validated .stat-icon { background: #dbeafe; color: #2563eb; }
    .stat-card.stat-planned .stat-icon { background: #d1fae5; color: #059669; }
    .stat-card.stat-done .stat-icon { background: #f3e8ff; color: #9333ea; }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      color: #1e293b;
      display: block;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #64748b;
    }

    /* FILTERS */
    .filters-bar {
      background: white;
      border-radius: 16px;
      padding: 0.5rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
    }

    .filter-tab {
      padding: 0.75rem 1.25rem;
      border: none;
      background: transparent;
      border-radius: 10px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .filter-tab:hover {
      background: #f8fafc;
      color: #1e293b;
    }

    .filter-tab.active {
      background: #667eea;
      color: white;
    }

    .filter-count {
      margin-left: 0.5rem;
      padding: 0.125rem 0.5rem;
      background: rgba(0,0,0,0.1);
      border-radius: 20px;
      font-size: 0.75rem;
    }

    .filter-tab.active .filter-count {
      background: rgba(255,255,255,0.2);
    }

    .filter-count.warning { background: #fef3c7; color: #d97706; }
    .filter-count.info { background: #dbeafe; color: #2563eb; }

    .filter-tab.active .filter-count.warning,
    .filter-tab.active .filter-count.info {
      background: rgba(255,255,255,0.2);
      color: white;
    }

    /* SOUTENANCES GRID */
    .soutenances-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 1.5rem;
    }

    .soutenance-card {
      background: white;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      cursor: pointer;
    }

    .soutenance-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.1);
    }

    .soutenance-card.card-soumis { border-left: 4px solid #f59e0b; }
    .soutenance-card.card-valide { border-left: 4px solid #2563eb; }
    .soutenance-card.card-planifiee { border-left: 4px solid #10b981; }
    .soutenance-card.card-terminee { border-left: 4px solid #9333ea; }

    /* CARD HEADER */
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-badge {
      padding: 0.375rem 0.875rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .status-badge.badge-soumis { background: #fef3c7; color: #d97706; }
    .status-badge.badge-valide { background: #dbeafe; color: #2563eb; }
    .status-badge.badge-planifiee { background: #d1fae5; color: #059669; }
    .status-badge.badge-autorisee { background: #dcfce7; color: #16a34a; }
    .status-badge.badge-terminee { background: #f3e8ff; color: #9333ea; }
    .status-badge.badge-rejetee { background: #fee2e2; color: #dc2626; }

    .card-id {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
    }

    /* DOCTORANT SECTION */
    .doctorant-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .doctorant-name {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.25rem 0;
    }

    .doctorant-id {
      font-size: 0.8rem;
      color: #64748b;
    }

    /* THESE SECTION */
    .these-section {
      background: #f8fafc;
      border-radius: 12px;
      padding: 1rem;
    }

    .these-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.75rem 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .these-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .meta-item {
      font-size: 0.8rem;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    /* JURY INFO */
    .jury-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #64748b;
      padding: 0.5rem 0.75rem;
      background: #f1f5f9;
      border-radius: 8px;
      width: fit-content;
    }

    /* ACTIONS */
    .card-actions {
      margin-top: auto;
    }

    .btn-action {
      width: 100%;
      padding: 0.875rem 1rem;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-action:hover {
      transform: translateY(-2px);
    }

    .btn-action.btn-primary {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .btn-action.btn-info {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
    }

    .btn-action.btn-success {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
    }

    .btn-action.btn-purple {
      background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
      color: white;
    }

    .btn-action.btn-outline {
      background: white;
      border: 1px solid #e2e8f0;
      color: #64748b;
    }

    .btn-action.btn-outline:hover {
      background: #f8fafc;
      color: #1e293b;
    }

    /* LOADING & EMPTY STATES */
    .loading-state,
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      background: #f1f5f9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .empty-icon i {
      font-size: 2.5rem;
      color: #94a3b8;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem;
      color: #1e293b;
    }

    .empty-state p {
      margin: 0;
      color: #64748b;
    }

    /* RESPONSIVE */
    @media (max-width: 1200px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .stats-row {
        grid-template-columns: 1fr;
      }

      .soutenances-grid {
        grid-template-columns: 1fr;
      }

      .filter-tabs {
        flex-wrap: wrap;
      }
    }
  `]
})
export class SoutenanceListComponent implements OnInit {
  // Exposer l'enum au template
  StatutSoutenance = StatutSoutenance;

  allSoutenances = signal<Soutenance[]>([]);
  filteredSoutenances = signal<Soutenance[]>([]);
  isLoading = signal(false);
  activeFilter = 'ALL';

  constructor(
      private soutenanceService: SoutenanceService,
      private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.soutenanceService.getAllSoutenances().subscribe({
      next: (data) => {
        // Exclure les brouillons (non visibles pour l'admin)
        const nonBrouillons = data.filter(s => s.statut !== StatutSoutenance.BROUILLON);
        this.allSoutenances.set(nonBrouillons);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement soutenances:', err);
        this.isLoading.set(false);
      }
    });
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilter();
  }

  private applyFilter() {
    const all = this.allSoutenances();

    switch (this.activeFilter) {
      case 'SOUMIS':
        this.filteredSoutenances.set(all.filter(s => s.statut === StatutSoutenance.SOUMIS));
        break;
      case 'JURY':
        this.filteredSoutenances.set(all.filter(s => s.statut === StatutSoutenance.JURY_PROPOSE));
        break;
      case 'PLANIFIEE':
        this.filteredSoutenances.set(all.filter(s =>
            s.statut === StatutSoutenance.PLANIFIEE || s.statut === StatutSoutenance.AUTORISEE
        ));
        break;
      case 'TERMINEE':
        this.filteredSoutenances.set(all.filter(s => s.statut === StatutSoutenance.TERMINEE));
        break;
      default:
        this.filteredSoutenances.set(all);
    }
  }

  getCountByStatut(statut: StatutSoutenance): number {
    return this.allSoutenances().filter(s => s.statut === statut).length;
  }

  getEmptyMessage(): string {
    switch (this.activeFilter) {
      case 'SOUMIS': return 'Aucune demande de soutenance en attente d\'examen.';
      case 'JURY': return 'Aucun jury à valider pour le moment.';
      case 'PLANIFIEE': return 'Aucune soutenance planifiée.';
      case 'TERMINEE': return 'Aucune soutenance terminée.';
      default: return 'Aucune soutenance trouvée.';
    }
  }

  // Méthode pour comparer les statuts (évite erreur TS2367)
  isStatut(soutenance: Soutenance, statut: StatutSoutenance): boolean {
    return soutenance.statut === statut;
  }

  // ============================================
  // NAVIGATION
  // ============================================

  voirDetails(soutenance: Soutenance) {
    this.router.navigate(['/admin/soutenances', soutenance.id]);
  }

  voirDetailsClick(event: Event, soutenance: Soutenance) {
    event.stopPropagation();
    this.voirDetails(soutenance);
  }

  examinerDemande(event: Event, soutenance: Soutenance) {
    event.stopPropagation();
    this.router.navigate(['/admin/soutenances', soutenance.id]);
  }

  planifier(event: Event, soutenance: Soutenance) {
    event.stopPropagation();
    this.router.navigate(['/admin/soutenances', soutenance.id]);
  }

  autoriser(event: Event, soutenance: Soutenance) {
    event.stopPropagation();
    if (confirm('Autoriser cette soutenance à avoir lieu ?')) {
      // TODO: Appeler le service pour autoriser
      console.log('Autoriser soutenance:', soutenance.id);
    }
  }

  marquerTerminee(event: Event, soutenance: Soutenance) {
    event.stopPropagation();
    this.router.navigate(['/admin/soutenances', soutenance.id]);
  }

  // ============================================
  // HELPERS D'AFFICHAGE
  // ============================================

  getCardClass(statut: StatutSoutenance): string {
    switch (statut) {
      case StatutSoutenance.SOUMIS: return 'card-soumis';
      case StatutSoutenance.PREREQUIS_VALIDES:
      case StatutSoutenance.JURY_PROPOSE: return 'card-valide';
      case StatutSoutenance.PLANIFIEE:
      case StatutSoutenance.AUTORISEE: return 'card-planifiee';
      case StatutSoutenance.TERMINEE: return 'card-terminee';
      default: return '';
    }
  }

  getBadgeClass(statut: StatutSoutenance): string {
    switch (statut) {
      case StatutSoutenance.SOUMIS: return 'badge-soumis';
      case StatutSoutenance.PREREQUIS_VALIDES:
      case StatutSoutenance.JURY_PROPOSE: return 'badge-valide';
      case StatutSoutenance.PLANIFIEE: return 'badge-planifiee';
      case StatutSoutenance.AUTORISEE: return 'badge-autorisee';
      case StatutSoutenance.TERMINEE: return 'badge-terminee';
      case StatutSoutenance.REJETEE: return 'badge-rejetee';
      default: return '';
    }
  }

  getStatusIcon(statut: StatutSoutenance): string {
    switch (statut) {
      case StatutSoutenance.SOUMIS: return 'bi-clock-history';
      case StatutSoutenance.PREREQUIS_VALIDES: return 'bi-check-circle';
      case StatutSoutenance.JURY_PROPOSE: return 'bi-people';
      case StatutSoutenance.PLANIFIEE: return 'bi-calendar-check';
      case StatutSoutenance.AUTORISEE: return 'bi-check-circle';
      case StatutSoutenance.TERMINEE: return 'bi-mortarboard';
      case StatutSoutenance.REJETEE: return 'bi-x-circle';
      default: return 'bi-file-earmark';
    }
  }

  formatStatut(statut: StatutSoutenance): string {
    const labels: Record<string, string> = {
      'BROUILLON': 'Brouillon',
      'SOUMIS': 'En attente',
      'PREREQUIS_VALIDES': 'Prérequis OK',
      'JURY_PROPOSE': 'Jury proposé',
      'PLANIFIEE': 'Planifiée',
      'AUTORISEE': 'Autorisée',
      'TERMINEE': 'Terminée',
      'REJETEE': 'Rejetée'
    };
    return labels[statut] || statut;
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
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
}