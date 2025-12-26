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
      <div class="page-container">

        <!-- Hero Header -->
        <div class="hero-section">
          <div class="hero-content">
            <div class="hero-icon">
              <i class="bi bi-calendar-range"></i>
            </div>
            <div>
              <h1 class="hero-title">Gestion des Campagnes</h1>
              <p class="hero-subtitle">Gérez les périodes d'ouverture des inscriptions au doctorat</p>
            </div>
          </div>
          <a routerLink="nouvelle" class="btn-new">
            <i class="bi bi-plus-lg"></i>
            <span>Nouvelle campagne</span>
          </a>
          <div class="hero-decoration">
            <div class="decoration-circle c1"></div>
            <div class="decoration-circle c2"></div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon total">
              <i class="bi bi-calendar3"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ campagnes().length }}</span>
              <span class="stat-label">Total campagnes</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon active">
              <i class="bi bi-unlock"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ getActiveCampagnesCount() }}</span>
              <span class="stat-label">Ouverte(s)</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon closed">
              <i class="bi bi-lock"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ getClosedCampagnesCount() }}</span>
              <span class="stat-label">Fermée(s)</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon current">
              <i class="bi bi-calendar-check"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ getCurrentYear() }}</span>
              <span class="stat-label">Année en cours</span>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <span>Chargement des campagnes...</span>
          </div>
        }

        <!-- Empty State -->
        @if (campagnes().length === 0 && !isLoading()) {
          <div class="empty-state">
            <div class="empty-icon">
              <i class="bi bi-calendar-x"></i>
            </div>
            <h3 class="empty-title">Aucune campagne créée</h3>
            <p class="empty-text">Commencez par créer la première campagne d'inscription pour l'année universitaire.</p>
            <a routerLink="nouvelle" class="btn-empty-action">
              <i class="bi bi-plus-lg me-2"></i>
              Créer la première campagne
            </a>
          </div>
        }

        <!-- Campagnes List -->
        @if (campagnes().length > 0 && !isLoading()) {
          <div class="list-section">
            <div class="section-header">
              <h3 class="section-title">
                <i class="bi bi-list-ul me-2"></i>
                Historique des campagnes
              </h3>
              <button class="btn-refresh" (click)="loadData()" [disabled]="isLoading()">
                <i class="bi bi-arrow-clockwise"></i>
                Actualiser
              </button>
            </div>

            <div class="campagnes-list">
              @for (campagne of campagnes(); track campagne.id) {
                <div class="campagne-card" [class.active]="campagne.active">
                  <div class="card-left">
                    <div class="year-badge" [class.active]="campagne.active">
                      <i class="bi bi-calendar-event"></i>
                    </div>
                  </div>

                  <div class="card-content">
                    <div class="card-header-row">
                      <div class="campagne-year">{{ campagne.anneeUniversitaire }}</div>
                      <span class="status-badge" [class.active]="campagne.active">
                        @if (campagne.active) {
                          <i class="bi bi-unlock-fill"></i>
                          OUVERTE
                        } @else {
                          <i class="bi bi-lock-fill"></i>
                          FERMÉE
                        }
                      </span>
                    </div>

                    <h4 class="campagne-title">{{ campagne.titre }}</h4>

                    <div class="campagne-dates">
                      <div class="date-item">
                        <i class="bi bi-calendar-plus"></i>
                        <span>Début: <strong>{{ campagne.dateDebut | date:'dd MMM yyyy' }}</strong></span>
                      </div>
                      <div class="date-separator">
                        <i class="bi bi-arrow-right"></i>
                      </div>
                      <div class="date-item">
                        <i class="bi bi-calendar-minus"></i>
                        <span>Fin: <strong>{{ campagne.dateFin | date:'dd MMM yyyy' }}</strong></span>
                      </div>
                    </div>

                    @if (campagne.description) {
                      <p class="campagne-description">{{ campagne.description }}</p>
                    }
                  </div>

                  <div class="card-actions">
                    <a [routerLink]="['modifier', campagne.id]" class="btn-action edit" title="Modifier">
                      <i class="bi bi-pencil"></i>
                    </a>
                    @if (!campagne.active) {
                      <button class="btn-action activate" (click)="activer(campagne.id)" title="Ouvrir les inscriptions">
                        <i class="bi bi-play-fill"></i>
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Info Section -->
        <div class="info-section">
          <div class="info-icon">
            <i class="bi bi-info-circle"></i>
          </div>
          <div class="info-content">
            <strong>Comment ça marche ?</strong>
            <p>Une seule campagne peut être active à la fois. Lorsque vous ouvrez une nouvelle campagne, les autres sont automatiquement fermées. Les candidats ne peuvent soumettre leur dossier que durant la période d'ouverture.</p>
          </div>
        </div>

      </div>
    </app-main-layout>
  `,
  styles: [`
    .page-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 1.5rem 3rem;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 24px;
      padding: 2rem;
      margin-bottom: 1.5rem;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .hero-content {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      position: relative;
      z-index: 2;
    }

    .hero-icon {
      width: 64px;
      height: 64px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      color: white;
    }

    .hero-title {
      color: white;
      font-size: 1.6rem;
      font-weight: 800;
      margin: 0;
    }

    .hero-subtitle {
      color: rgba(255, 255, 255, 0.9);
      margin: 0.25rem 0 0;
      font-size: 0.95rem;
    }

    .btn-new {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: white;
      color: #1d4ed8;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      position: relative;
      z-index: 2;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .btn-new:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    .hero-decoration {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 200px;
    }

    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }

    .c1 { width: 120px; height: 120px; top: -30px; right: 40px; }
    .c2 { width: 80px; height: 80px; bottom: -20px; right: 120px; }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .stat-icon.total { background: #e0e7ff; color: #6366f1; }
    .stat-icon.active { background: #dcfce7; color: #22c55e; }
    .stat-icon.closed { background: #f1f5f9; color: #64748b; }
    .stat-icon.current { background: #dbeafe; color: #3b82f6; }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #64748b;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: #64748b;
      gap: 1rem;
      background: white;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      margin-bottom: 1.5rem;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      background: #dbeafe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .empty-icon i {
      font-size: 2.5rem;
      color: #3b82f6;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.5rem;
    }

    .empty-text {
      color: #64748b;
      margin: 0 0 1.5rem;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .btn-empty-action {
      display: inline-flex;
      align-items: center;
      padding: 0.875rem 1.5rem;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.35);
    }

    .btn-empty-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
    }

    /* List Section */
    .list-section {
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      margin-bottom: 1.5rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      display: flex;
      align-items: center;
    }

    .section-title i {
      color: #3b82f6;
    }

    .btn-refresh {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-refresh:hover {
      border-color: #3b82f6;
      color: #3b82f6;
    }

    /* Campagnes List */
    .campagnes-list {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .campagne-card {
      display: flex;
      align-items: stretch;
      background: #f8fafc;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      transition: all 0.2s;
    }

    .campagne-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .campagne-card.active {
      border-left: 4px solid #22c55e;
      background: #f0fdf4;
    }

    .card-left {
      padding: 1.25rem;
      display: flex;
      align-items: center;
    }

    .year-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      background: #e2e8f0;
      color: #64748b;
    }

    .year-badge.active {
      background: #dcfce7;
      color: #22c55e;
    }

    .card-content {
      flex: 1;
      padding: 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .campagne-year {
      font-weight: 800;
      color: #1e293b;
      font-size: 1.1rem;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.75rem;
      border-radius: 50px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      background: #f1f5f9;
      color: #64748b;
    }

    .status-badge.active {
      background: #dcfce7;
      color: #15803d;
    }

    .campagne-title {
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
      margin: 0;
    }

    .campagne-dates {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.25rem;
    }

    .date-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: #64748b;
    }

    .date-item i {
      color: #94a3b8;
    }

    .date-separator {
      color: #cbd5e1;
    }

    .campagne-description {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0.25rem 0 0;
      line-height: 1.4;
    }

    .card-actions {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-action {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
    }

    .btn-action.edit {
      background: #e0e7ff;
      color: #6366f1;
    }

    .btn-action.edit:hover {
      background: #6366f1;
      color: white;
    }

    .btn-action.activate {
      background: #dcfce7;
      color: #22c55e;
    }

    .btn-action.activate:hover {
      background: #22c55e;
      color: white;
    }

    .btn-action.deactivate {
      background: #fee2e2;
      color: #ef4444;
    }

    .btn-action.deactivate:hover {
      background: #ef4444;
      color: white;
    }

    /* Info Section */
    .info-section {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 1px solid #93c5fd;
      border-radius: 16px;
    }

    .info-icon {
      width: 44px;
      height: 44px;
      background: #3b82f6;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .info-content {
      color: #1e40af;
    }

    .info-content strong {
      display: block;
      margin-bottom: 0.25rem;
      font-size: 0.95rem;
    }

    .info-content p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-section {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
      }

      .hero-content {
        flex-direction: column;
      }

      .btn-new {
        width: 100%;
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .campagne-dates {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }

      .date-separator {
        display: none;
      }
    }
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

  getActiveCampagnesCount(): number {
    return this.campagnes().filter(c => c.active).length;
  }

  getClosedCampagnesCount(): number {
    return this.campagnes().filter(c => !c.active).length;
  }

  getCurrentYear(): string {
    const year = new Date().getFullYear();
    return `${year}/${year + 1}`;
  }

  activer(id: number) {
    if (confirm('Voulez-vous ouvrir cette campagne aux inscriptions ?\nCela fermera automatiquement les autres campagnes.')) {
      this.inscriptionService.activerCampagne(id).subscribe(() => this.loadData());
    }
  }
}