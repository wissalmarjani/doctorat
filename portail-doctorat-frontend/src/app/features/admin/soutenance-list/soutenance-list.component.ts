import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { SoutenanceService } from '@core/services/soutenance.service';
import { Soutenance, StatutSoutenance } from '@core/models/soutenance.model';
import { environment } from '../../../../environments/environment';

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
              <span class="stat-label">À examiner</span>
            </div>
          </div>
          <div class="stat-card stat-jury">
            <div class="stat-icon"><i class="bi bi-people"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ juryCount() }}</span>
              <span class="stat-label">Jury à valider</span>
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
            <button
                class="filter-tab"
                [class.active]="activeFilter() === 'all'"
                (click)="setFilter('all')">
              <i class="bi bi-grid me-2"></i>Toutes
              <span class="tab-count">{{ totalCount() }}</span>
            </button>
            <button
                class="filter-tab"
                [class.active]="activeFilter() === 'pending'"
                (click)="setFilter('pending')">
              <i class="bi bi-clock-history me-2"></i>À examiner
              <span class="tab-count">{{ pendingCount() }}</span>
            </button>
            <button
                class="filter-tab"
                [class.active]="activeFilter() === 'jury'"
                (click)="setFilter('jury')">
              <i class="bi bi-people me-2"></i>Jury à valider
              <span class="tab-count">{{ juryCount() }}</span>
            </button>
            <button
                class="filter-tab"
                [class.active]="activeFilter() === 'planned'"
                (click)="setFilter('planned')">
              <i class="bi bi-calendar-event me-2"></i>Planifiées
              <span class="tab-count">{{ plannedCount() }}</span>
            </button>
            <button
                class="filter-tab"
                [class.active]="activeFilter() === 'done'"
                (click)="setFilter('done')">
              <i class="bi bi-check-circle me-2"></i>Terminées
              <span class="tab-count">{{ doneCount() }}</span>
            </button>
          </div>

          <!-- SEARCH -->
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input
                type="text"
                placeholder="Rechercher par nom ou sujet..."
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event)">
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
                      <span class="doctorant-id">ID: {{ soutenance.doctorantId }}</span>
                    </div>
                  </div>
                  <div class="status-badge" [ngClass]="getStatusBadgeClass(soutenance.statut)">
                    <i class="bi" [ngClass]="getStatusIcon(soutenance.statut)"></i>
                    {{ formatStatut(soutenance.statut) }}
                  </div>
                </div>

                <!-- CARD BODY -->
                <div class="card-body">
                  <!-- Titre de thèse - Utilise titreThese (pas sujetThese) -->
                  <div class="thesis-title">
                    <i class="bi bi-journal-text me-2"></i>
                    <span>{{ soutenance.titreThese || 'Titre non défini' }}</span>
                  </div>

                  <div class="card-details">
                    <!-- Directeur - Utilise directeurInfo (pas directeurNom) -->
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
                        <span class="detail-value">{{ soutenance.dateSoutenance | date:'dd/MM/yyyy' }}</span>
                      </div>
                    }

                    <!-- Jury - Utilise membresJury (pas jury) -->
                    @if (hasMembresJury(soutenance)) {
                      <div class="detail-item">
                        <span class="detail-label">Jury</span>
                        <span class="detail-value">{{ getMembresJuryCount(soutenance) }} membre(s)</span>
                      </div>
                    }
                  </div>

                  <!-- DOCUMENTS - Selon CDC: Manuscrit + Rapport Anti-Plagiat obligatoires -->
                  <div class="documents-section">
                    <span class="section-label">Documents obligatoires :</span>
                    <div class="documents-row">
                      <!-- Manuscrit -->
                      <div class="doc-item"
                           [class.available]="hasManuscrit(soutenance)"
                           [class.clickable]="hasManuscrit(soutenance)"
                           (click)="hasManuscrit(soutenance) && downloadDocument(soutenance.cheminManuscrit!, 'manuscrit')">
                        <i class="bi" [ngClass]="hasManuscrit(soutenance) ? 'bi-file-earmark-pdf-fill' : 'bi-file-earmark-x'"></i>
                        <span>Manuscrit</span>
                        @if (hasManuscrit(soutenance)) {
                          <i class="bi bi-download download-icon"></i>
                        }
                      </div>

                      <!-- Rapport Anti-Plagiat -->
                      <div class="doc-item"
                           [class.available]="hasRapportPlagiat(soutenance)"
                           [class.clickable]="hasRapportPlagiat(soutenance)"
                           (click)="hasRapportPlagiat(soutenance) && downloadDocument(soutenance.cheminRapportAntiPlagiat!, 'rapport-plagiat')">
                        <i class="bi" [ngClass]="hasRapportPlagiat(soutenance) ? 'bi-file-earmark-check-fill' : 'bi-file-earmark-x'"></i>
                        <span>Anti-Plagiat</span>
                        @if (hasRapportPlagiat(soutenance)) {
                          <i class="bi bi-download download-icon"></i>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- PRÉREQUIS -->
                  @if (soutenance.prerequis) {
                    <div class="prerequis-section">
                      <span class="section-label">Prérequis :</span>
                      <div class="prerequis-row">
                        <span class="prereq-item" [class.valid]="soutenance.prerequis.nombreArticlesQ1Q2 >= 2">
                          <i class="bi" [ngClass]="soutenance.prerequis.nombreArticlesQ1Q2 >= 2 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                          {{ soutenance.prerequis.nombreArticlesQ1Q2 }}/2 Publications
                        </span>
                        <span class="prereq-item" [class.valid]="soutenance.prerequis.nombreConferences >= 2">
                          <i class="bi" [ngClass]="soutenance.prerequis.nombreConferences >= 2 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                          {{ soutenance.prerequis.nombreConferences }}/2 Conférences
                        </span>
                        <span class="prereq-item" [class.valid]="soutenance.prerequis.heuresFormation >= 200">
                          <i class="bi" [ngClass]="soutenance.prerequis.heuresFormation >= 200 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                          {{ soutenance.prerequis.heuresFormation }}/200h Formation
                        </span>
                      </div>
                    </div>
                  }
                </div>

                <!-- CARD FOOTER - Actions -->
                <div class="card-footer">
                  <button class="btn-action btn-details" (click)="voirDetails(soutenance.id)">
                    <i class="bi bi-eye me-2"></i>Voir détails
                  </button>

                  @if (isStatut(soutenance, StatutSoutenance.SOUMIS)) {
                    <button class="btn-action btn-success" (click)="validerPrerequis(soutenance)">
                      <i class="bi bi-check-lg me-2"></i>Valider prérequis
                    </button>
                  }

                  @if (isStatut(soutenance, StatutSoutenance.JURY_PROPOSE)) {
                    <button class="btn-action btn-primary" (click)="validerJury(soutenance)">
                      <i class="bi bi-people-fill me-2"></i>Valider jury
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
    .soutenances-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    /* PAGE HEADER */
    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      color: white;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .page-subtitle {
      margin: 0.5rem 0 0 0;
      opacity: 0.9;
    }

    /* STATS ROW */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
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

    .stat-total .stat-icon { background: #e0e7ff; color: #4f46e5; }
    .stat-pending .stat-icon { background: #fef3c7; color: #d97706; }
    .stat-jury .stat-icon { background: #dbeafe; color: #2563eb; }
    .stat-planned .stat-icon { background: #d1fae5; color: #059669; }
    .stat-done .stat-icon { background: #ede9fe; color: #7c3aed; }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #1e293b;
      display: block;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #64748b;
    }

    /* FILTER SECTION */
    .filter-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      background: white;
      padding: 0.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
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

    .filter-tab:hover {
      background: #f1f5f9;
    }

    .filter-tab.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .tab-count {
      background: rgba(255,255,255,0.2);
      padding: 0.15rem 0.5rem;
      border-radius: 20px;
      font-size: 0.75rem;
    }

    .filter-tab:not(.active) .tab-count {
      background: #e2e8f0;
      color: #475569;
    }

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

    .search-box i {
      color: #94a3b8;
    }

    .search-box input {
      border: none;
      outline: none;
      flex: 1;
      font-size: 0.9rem;
    }

    /* SOUTENANCES LIST */
    .soutenances-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* LOADING & EMPTY STATES */
    .loading-state,
    .empty-state {
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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state i {
      font-size: 4rem;
      color: #cbd5e1;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #475569;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      color: #94a3b8;
      margin: 0;
    }

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

    .soutenance-card:hover {
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .soutenance-card.status-soumis { border-left-color: #f59e0b; }
    .soutenance-card.status-jury { border-left-color: #3b82f6; }
    .soutenance-card.status-planifiee { border-left-color: #10b981; }
    .soutenance-card.status-terminee { border-left-color: #8b5cf6; }
    .soutenance-card.status-rejetee { border-left-color: #ef4444; }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .doctorant-info {
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
      font-size: 1rem;
    }

    .doctorant-name {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .doctorant-id {
      font-size: 0.8rem;
      color: #64748b;
    }

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
    .status-badge.status-valide { background: #dbeafe; color: #2563eb; }
    .status-badge.status-jury { background: #dbeafe; color: #2563eb; }
    .status-badge.status-planifiee { background: #d1fae5; color: #059669; }
    .status-badge.status-autorisee { background: #d1fae5; color: #059669; }
    .status-badge.status-terminee { background: #ede9fe; color: #7c3aed; }
    .status-badge.status-rejetee { background: #fee2e2; color: #dc2626; }

    .card-body {
      padding: 1.25rem;
    }

    .thesis-title {
      font-size: 0.95rem;
      color: #334155;
      margin-bottom: 1rem;
      display: flex;
      align-items: flex-start;
    }

    .thesis-title i {
      color: #667eea;
      flex-shrink: 0;
    }

    .card-details {
      display: flex;
      gap: 2rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item.highlight .detail-value {
      color: #059669;
      font-weight: 700;
    }

    .detail-label {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      font-size: 0.9rem;
      color: #334155;
      font-weight: 600;
    }

    /* DOCUMENTS SECTION */
    .documents-section {
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 10px;
    }

    .section-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 0.75rem;
    }

    .documents-row {
      display: flex;
      gap: 1rem;
    }

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

    .doc-item.available {
      color: #059669;
      border-color: #d1fae5;
      background: #f0fdf4;
    }

    .doc-item.clickable {
      cursor: pointer;
      transition: all 0.2s;
    }

    .doc-item.clickable:hover {
      background: #dcfce7;
      transform: scale(1.02);
    }

    .doc-item .download-icon {
      margin-left: 0.5rem;
      font-size: 0.9rem;
    }

    .doc-item i:first-child {
      font-size: 1.1rem;
    }

    /* PREREQUIS SECTION */
    .prerequis-section {
      padding: 1rem;
      background: #f8fafc;
      border-radius: 10px;
    }

    .prerequis-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .prereq-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #ef4444;
    }

    .prereq-item.valid {
      color: #059669;
    }

    /* CARD FOOTER */
    .card-footer {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
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

    .btn-action:hover {
      transform: translateY(-1px);
    }

    .btn-details {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-details:hover {
      background: #e2e8f0;
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
    }

    /* RESPONSIVE */
    @media (max-width: 1200px) {
      .stats-row {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }

      .filter-section {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-tabs {
        flex-wrap: wrap;
      }

      .search-box {
        min-width: 100%;
      }

      .card-details {
        flex-direction: column;
        gap: 0.75rem;
      }

      .documents-row {
        flex-direction: column;
      }

      .prerequis-row {
        flex-direction: column;
      }
    }
  `]
})
export class SoutenanceListComponent implements OnInit {
  // Exposer l'enum au template
  StatutSoutenance = StatutSoutenance;

  // État
  soutenances = signal<Soutenance[]>([]);
  isLoading = signal(true);
  activeFilter = signal<'all' | 'pending' | 'jury' | 'planned' | 'done'>('all');
  searchTerm = signal('');

  // Computed - Compteurs
  totalCount = computed(() => this.soutenances().length);

  pendingCount = computed(() =>
      this.soutenances().filter(s => s.statut === StatutSoutenance.SOUMIS).length
  );

  juryCount = computed(() =>
      this.soutenances().filter(s => s.statut === StatutSoutenance.JURY_PROPOSE).length
  );

  plannedCount = computed(() =>
      this.soutenances().filter(s =>
          s.statut === StatutSoutenance.PLANIFIEE ||
          s.statut === StatutSoutenance.AUTORISEE
      ).length
  );

  doneCount = computed(() =>
      this.soutenances().filter(s => s.statut === StatutSoutenance.TERMINEE).length
  );

  // Computed - Liste filtrée
  filteredSoutenances = computed(() => {
    let result = this.soutenances();

    // Filtre par statut
    switch (this.activeFilter()) {
      case 'pending':
        result = result.filter(s => s.statut === StatutSoutenance.SOUMIS);
        break;
      case 'jury':
        result = result.filter(s => s.statut === StatutSoutenance.JURY_PROPOSE);
        break;
      case 'planned':
        result = result.filter(s =>
            s.statut === StatutSoutenance.PLANIFIEE ||
            s.statut === StatutSoutenance.AUTORISEE
        );
        break;
      case 'done':
        result = result.filter(s => s.statut === StatutSoutenance.TERMINEE);
        break;
    }

    // Filtre par recherche
    const search = this.searchTerm().toLowerCase();
    if (search) {
      result = result.filter(s =>
          this.getDoctorantNom(s).toLowerCase().includes(search) ||
          (s.titreThese?.toLowerCase().includes(search))
      );
    }

    return result;
  });

  constructor(
      private soutenanceService: SoutenanceService,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSoutenances();
  }

  loadSoutenances(): void {
    this.isLoading.set(true);
    this.soutenanceService.getAllSoutenances().subscribe({
      next: (data: Soutenance[]) => {
        // --- MODIFICATION ICI ---
        // On filtre pour ne garder que ce qui n'est PAS un brouillon
        const dataSansBrouillons = data.filter(s => s.statut !== StatutSoutenance.BROUILLON);

        this.soutenances.set(dataSansBrouillons);
        // ------------------------

        this.isLoading.set(false);
      },
      error: (err: Error) => {
        console.error('Erreur:', err);
        this.isLoading.set(false);
      }
    });
  }

  setFilter(filter: 'all' | 'pending' | 'jury' | 'planned' | 'done'): void {
    this.activeFilter.set(filter);
  }

  // ========================================
  // NAVIGATION - Vers la page de détails
  // ========================================

  voirDetails(soutenanceId: number): void {
    this.router.navigate(['/admin/soutenances', soutenanceId]);
  }

  // ========================================
  // TÉLÉCHARGEMENT DES DOCUMENTS
  // ========================================

  downloadDocument(chemin: string, type: string): void {
    // Construire l'URL de téléchargement
    const downloadUrl = `${environment.apiUrl}/documents/download?path=${encodeURIComponent(chemin)}`;
    window.open(downloadUrl, '_blank');
  }

  // ========================================
  // HELPERS - ALIGNÉS AVEC LE BACKEND
  // ========================================

  // Utilise doctorantInfo (pas doctorantNom)
  getDoctorantNom(soutenance: Soutenance): string {
    if (soutenance.doctorantInfo) {
      return `${soutenance.doctorantInfo.prenom} ${soutenance.doctorantInfo.nom}`;
    }
    return `Doctorant #${soutenance.doctorantId}`;
  }

  // Utilise directeurInfo (pas directeurNom)
  getDirecteurNom(soutenance: Soutenance): string {
    if (soutenance.directeurInfo) {
      return `${soutenance.directeurInfo.prenom} ${soutenance.directeurInfo.nom}`;
    }
    return `Directeur #${soutenance.directeurId}`;
  }

  // Utilise cheminManuscrit
  hasManuscrit(soutenance: Soutenance): boolean {
    return !!soutenance.cheminManuscrit && soutenance.cheminManuscrit.length > 0;
  }

  // Utilise cheminRapportAntiPlagiat
  hasRapportPlagiat(soutenance: Soutenance): boolean {
    return !!soutenance.cheminRapportAntiPlagiat && soutenance.cheminRapportAntiPlagiat.length > 0;
  }

  // Utilise membresJury (pas jury)
  hasMembresJury(soutenance: Soutenance): boolean {
    return !!soutenance.membresJury && soutenance.membresJury.length > 0;
  }

  getMembresJuryCount(soutenance: Soutenance): number {
    return soutenance.membresJury?.length || 0;
  }

  isStatut(soutenance: Soutenance, statut: StatutSoutenance): boolean {
    return soutenance.statut === statut;
  }

  getInitials(name: string): string {
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

  getCardClass(statut: StatutSoutenance): string {
    switch (statut) {
      case StatutSoutenance.SOUMIS: return 'status-soumis';
      case StatutSoutenance.JURY_PROPOSE: return 'status-jury';
      case StatutSoutenance.PLANIFIEE:
      case StatutSoutenance.AUTORISEE: return 'status-planifiee';
      case StatutSoutenance.TERMINEE: return 'status-terminee';
      case StatutSoutenance.REJETEE: return 'status-rejetee';
      default: return '';
    }
  }

  getStatusBadgeClass(statut: StatutSoutenance): string {
    switch (statut) {
      case StatutSoutenance.SOUMIS: return 'status-soumis';
      case StatutSoutenance.PREREQUIS_VALIDES: return 'status-valide';
      case StatutSoutenance.JURY_PROPOSE: return 'status-jury';
      case StatutSoutenance.PLANIFIEE: return 'status-planifiee';
      case StatutSoutenance.AUTORISEE: return 'status-autorisee';
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
      case StatutSoutenance.PLANIFIEE: return 'bi-calendar-check';
      case StatutSoutenance.AUTORISEE: return 'bi-check-circle-fill';
      case StatutSoutenance.TERMINEE: return 'bi-mortarboard';
      case StatutSoutenance.REJETEE: return 'bi-x-circle';
      default: return 'bi-file-earmark';
    }
  }

  formatStatut(statut: StatutSoutenance): string {
    const labels: Record<string, string> = {
      'BROUILLON': 'Brouillon',
      'SOUMIS': 'En attente',
      'PREREQUIS_VALIDES': 'Prérequis validés',
      'JURY_PROPOSE': 'Jury proposé',
      'PLANIFIEE': 'Planifiée',
      'AUTORISEE': 'Autorisée',
      'TERMINEE': 'Terminée',
      'REJETEE': 'Rejetée'
    };
    return labels[statut] || statut;
  }

  getEmptyMessage(): string {
    switch (this.activeFilter()) {
      case 'pending': return 'Aucune soutenance en attente d\'examen';
      case 'jury': return 'Aucun jury à valider';
      case 'planned': return 'Aucune soutenance planifiée';
      case 'done': return 'Aucune soutenance terminée';
      default: return 'Aucune soutenance dans le système';
    }
  }

  // ========================================
  // ACTIONS
  // ========================================

  validerPrerequis(soutenance: Soutenance): void {
    if (confirm(`Valider les prérequis de ${this.getDoctorantNom(soutenance)} ?`)) {
      this.soutenanceService.validerPrerequis(soutenance.id).subscribe({
        next: () => {
          alert('Prérequis validés !');
          this.loadSoutenances();
        },
        error: (err: Error) => {
          console.error(err);
          alert('Erreur lors de la validation');
        }
      });
    }
  }

  validerJury(soutenance: Soutenance): void {
    this.voirDetails(soutenance.id);
  }
}