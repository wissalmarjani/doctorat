import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MainLayoutComponent } from '../../../shared/components/main-layout/main-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { DerogationService } from '../../../core/services/derogation.service';
import { Derogation, EligibiliteReinscription, StatutDerogation, TypeDerogation } from '../../../core/models/derogation.model';

@Component({
  selector: 'app-derogation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="page-container">

        <!-- Hero Header -->
        <div class="hero-section">
          <div class="hero-content">
            <div class="hero-icon">
              <i class="bi bi-clock-history"></i>
            </div>
            <div>
              <h1 class="hero-title">Mes Dérogations</h1>
              <p class="hero-subtitle">Gérez vos demandes de prolongation du doctorat</p>
            </div>
          </div>
          <a routerLink="/derogations/nouvelle" class="btn-new">
            <i class="bi bi-plus-lg"></i>
            <span>Nouvelle demande</span>
          </a>
          <div class="hero-decoration">
            <div class="decoration-circle c1"></div>
            <div class="decoration-circle c2"></div>
          </div>
        </div>

        <!-- Info Card -->
        <div class="info-banner">
          <div class="info-icon">
            <i class="bi bi-info-circle"></i>
          </div>
          <div class="info-content">
            <strong>Règles de durée du doctorat</strong>
            <p>La durée normale est de <strong>3 ans</strong>. Avec dérogations, le maximum est de <strong>6 ans</strong>. Au-delà de 3 ans, une dérogation est requise chaque année académique.</p>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon pending">
              <i class="bi bi-hourglass-split"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ getStatCount('EN_ATTENTE') }}</span>
              <span class="stat-label">En attente</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon approved">
              <i class="bi bi-check-circle"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ getStatCount('APPROUVEE') }}</span>
              <span class="stat-label">Approuvées</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon rejected">
              <i class="bi bi-x-circle"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ getStatCount('REFUSEE') }}</span>
              <span class="stat-label">Refusées</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon total">
              <i class="bi bi-folder2"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ derogations().length }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
        </div>

        <!-- Liste des dérogations -->
        @if (isLoading()) {
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <span>Chargement de vos dérogations...</span>
          </div>
        } @else if (derogations().length > 0) {
          <div class="list-section">
            <div class="section-header">
              <h3 class="section-title">
                <i class="bi bi-list-ul me-2"></i>
                Historique des demandes
              </h3>
            </div>

            <div class="derogation-list">
              @for (derogation of derogations(); track derogation.id) {
                <div class="derogation-card" [class]="getCardClass(derogation.statut)">
                  <div class="card-left">
                    <div class="type-badge" [class]="getTypeBadgeClass(derogation.typeDerogation)">
                      <i class="bi" [class]="getTypeIcon(derogation.typeDerogation)"></i>
                    </div>
                  </div>

                  <div class="card-content">
                    <div class="card-header-row">
                      <span class="derogation-type">{{ getTypeLabel(derogation.typeDerogation) }}</span>
                      <span class="status-badge" [class]="getStatutBadgeClass(derogation.statut)">
                        <i class="bi" [class]="getStatutIcon(derogation.statut)"></i>
                        {{ getStatutLabel(derogation.statut) }}
                      </span>
                    </div>

                    <p class="derogation-motif">{{ derogation.motif }}</p>

                    <div class="card-footer-row">
                      <div class="meta-info">
                        <span class="meta-item">
                          <i class="bi bi-calendar3"></i>
                          Demandé le {{ derogation.dateDemande | date:'dd MMM yyyy' }}
                        </span>
                        @if (derogation.anneeDemandee) {
                          <span class="meta-item">
                            <i class="bi bi-mortarboard"></i>
                            Année {{ derogation.anneeDemandee }}
                          </span>
                        }
                      </div>

                      @if (derogation.statut === 'APPROUVEE' && derogation.dateExpiration) {
                        <span class="expiration-info">
                          <i class="bi bi-clock"></i>
                          Expire le {{ derogation.dateExpiration | date:'dd/MM/yyyy' }}
                        </span>
                      }

                      @if (derogation.statut === 'REFUSEE' && derogation.commentaireDecision) {
                        <span class="rejection-reason">
                          <i class="bi bi-chat-left-text"></i>
                          {{ derogation.commentaireDecision }}
                        </span>
                      }
                    </div>
                  </div>

                  <div class="card-actions">
                    <button class="btn-action" title="Voir les détails">
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-icon">
              <i class="bi bi-inbox"></i>
            </div>
            <h3 class="empty-title">Aucune demande de dérogation</h3>
            <p class="empty-text">Vous n'avez pas encore soumis de demande de dérogation pour prolonger votre doctorat.</p>
            <a routerLink="/derogations/nouvelle" class="btn-empty-action">
              <i class="bi bi-plus-lg me-2"></i>
              Faire une demande
            </a>
          </div>
        }

        <!-- Tips Section -->
        <div class="tips-section">
          <h4 class="tips-title">
            <i class="bi bi-lightbulb me-2"></i>
            Conseils utiles
          </h4>
          <div class="tips-grid">
            <div class="tip-card">
              <div class="tip-icon"><i class="bi bi-calendar-check"></i></div>
              <div class="tip-content">
                <strong>Anticipez</strong>
                <p>Soumettez votre demande au moins 2 mois avant la fin de votre année en cours.</p>
              </div>
            </div>
            <div class="tip-card">
              <div class="tip-icon"><i class="bi bi-file-earmark-text"></i></div>
              <div class="tip-content">
                <strong>Justifiez</strong>
                <p>Fournissez un motif détaillé et des justificatifs pertinents pour maximiser vos chances.</p>
              </div>
            </div>
            <div class="tip-card">
              <div class="tip-icon"><i class="bi bi-person-check"></i></div>
              <div class="tip-content">
                <strong>Consultez</strong>
                <p>Discutez avec votre directeur de thèse avant de soumettre votre demande.</p>
              </div>
            </div>
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
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
      color: #d97706;
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

    /* Info Banner */
    .info-banner {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 1px solid #93c5fd;
      border-radius: 16px;
      margin-bottom: 1.5rem;
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

    .stat-icon.pending {
      background: #fef3c7;
      color: #f59e0b;
    }

    .stat-icon.approved {
      background: #dcfce7;
      color: #22c55e;
    }

    .stat-icon.rejected {
      background: #fee2e2;
      color: #ef4444;
    }

    .stat-icon.total {
      background: #e0e7ff;
      color: #6366f1;
    }

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
      color: #f59e0b;
    }

    /* Derogation Cards */
    .derogation-list {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .derogation-card {
      display: flex;
      align-items: stretch;
      background: #f8fafc;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      transition: all 0.2s;
    }

    .derogation-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .derogation-card.card-pending {
      border-left: 4px solid #f59e0b;
    }

    .derogation-card.card-approved {
      border-left: 4px solid #22c55e;
    }

    .derogation-card.card-rejected {
      border-left: 4px solid #ef4444;
    }

    .derogation-card.card-expired {
      border-left: 4px solid #94a3b8;
    }

    .card-left {
      padding: 1.25rem;
      display: flex;
      align-items: center;
    }

    .type-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .type-badge.type-4 {
      background: #fef3c7;
      color: #f59e0b;
    }

    .type-badge.type-5 {
      background: #fed7aa;
      color: #ea580c;
    }

    .type-badge.type-6 {
      background: #fecaca;
      color: #dc2626;
    }

    .type-badge.type-other {
      background: #e0e7ff;
      color: #6366f1;
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

    .derogation-type {
      font-weight: 700;
      color: #1e293b;
      font-size: 1rem;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.75rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-badge.badge-pending {
      background: #fef3c7;
      color: #b45309;
    }

    .status-badge.badge-approved {
      background: #dcfce7;
      color: #15803d;
    }

    .status-badge.badge-rejected {
      background: #fee2e2;
      color: #dc2626;
    }

    .status-badge.badge-expired {
      background: #f1f5f9;
      color: #64748b;
    }

    .derogation-motif {
      color: #475569;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .meta-info {
      display: flex;
      gap: 1rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: #64748b;
    }

    .meta-item i {
      font-size: 0.9rem;
    }

    .expiration-info {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: #059669;
      background: #d1fae5;
      padding: 0.25rem 0.75rem;
      border-radius: 50px;
    }

    .rejection-reason {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: #dc2626;
      font-style: italic;
    }

    .card-actions {
      padding: 1.25rem;
      display: flex;
      align-items: center;
    }

    .btn-action {
      width: 40px;
      height: 40px;
      border: none;
      background: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }

    .btn-action:hover {
      background: #f59e0b;
      color: white;
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
      background: #fef3c7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .empty-icon i {
      font-size: 2.5rem;
      color: #f59e0b;
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
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);
    }

    .btn-empty-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
    }

    /* Tips Section */
    .tips-section {
      background: white;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }

    .tips-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
    }

    .tips-title i {
      color: #f59e0b;
    }

    .tips-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .tip-card {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: #fffbeb;
      border-radius: 12px;
      border: 1px solid #fef3c7;
    }

    .tip-icon {
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #f59e0b;
      font-size: 1.1rem;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }

    .tip-content strong {
      display: block;
      font-size: 0.9rem;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .tip-content p {
      margin: 0;
      font-size: 0.8rem;
      color: #64748b;
      line-height: 1.4;
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
      margin-bottom: 1.5rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #f59e0b;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
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

      .tips-grid {
        grid-template-columns: 1fr;
      }

      .card-header-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .meta-info {
        flex-direction: column;
        gap: 0.25rem;
      }
    }
  `]
})
export class DerogationListComponent implements OnInit {
  derogations = signal<Derogation[]>([]);
  eligibilite = signal<EligibiliteReinscription | null>(null);
  isLoading = signal(true);

  constructor(
      private authService: AuthService,
      private derogationService: DerogationService
  ) {}

  ngOnInit(): void {
    this.loadDerogations();
  }

  loadDerogations(): void {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.derogationService.getMesDerogations(userId).subscribe({
        next: (data) => {
          this.derogations.set(data);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
    } else {
      this.isLoading.set(false);
    }
  }

  getStatCount(statut: string): number {
    return this.derogations().filter(d => d.statut === statut).length;
  }

  getTypeLabel(type: TypeDerogation): string {
    const labels: Record<string, string> = {
      'PROLONGATION_4EME_ANNEE': 'Prolongation 4ème année',
      'PROLONGATION_5EME_ANNEE': 'Prolongation 5ème année',
      'PROLONGATION_6EME_ANNEE': 'Prolongation 6ème année',
      'SUSPENSION_TEMPORAIRE': 'Suspension temporaire',
      'AUTRE': 'Autre demande'
    };
    return labels[type] || type;
  }

  getTypeIcon(type: TypeDerogation): string {
    const icons: Record<string, string> = {
      'PROLONGATION_4EME_ANNEE': 'bi-4-circle',
      'PROLONGATION_5EME_ANNEE': 'bi-5-circle',
      'PROLONGATION_6EME_ANNEE': 'bi-6-circle',
      'SUSPENSION_TEMPORAIRE': 'bi-pause-circle',
      'AUTRE': 'bi-question-circle'
    };
    return icons[type] || 'bi-file-text';
  }

  getTypeBadgeClass(type: TypeDerogation): string {
    const classes: Record<string, string> = {
      'PROLONGATION_4EME_ANNEE': 'type-4',
      'PROLONGATION_5EME_ANNEE': 'type-5',
      'PROLONGATION_6EME_ANNEE': 'type-6',
      'SUSPENSION_TEMPORAIRE': 'type-other',
      'AUTRE': 'type-other'
    };
    return classes[type] || 'type-other';
  }

  getCardClass(statut: StatutDerogation): string {
    const classes: Record<string, string> = {
      'EN_ATTENTE': 'card-pending',
      'APPROUVEE': 'card-approved',
      'REFUSEE': 'card-rejected',
      'EXPIREE': 'card-expired',
      'ANNULEE': 'card-expired'
    };
    return classes[statut] || '';
  }

  getStatutBadgeClass(statut: StatutDerogation): string {
    const classes: Record<string, string> = {
      'EN_ATTENTE': 'badge-pending',
      'APPROUVEE': 'badge-approved',
      'REFUSEE': 'badge-rejected',
      'EXPIREE': 'badge-expired',
      'ANNULEE': 'badge-expired'
    };
    return classes[statut] || 'badge-expired';
  }

  getStatutIcon(statut: StatutDerogation): string {
    const icons: Record<string, string> = {
      'EN_ATTENTE': 'bi-hourglass-split',
      'APPROUVEE': 'bi-check-circle-fill',
      'REFUSEE': 'bi-x-circle-fill',
      'EXPIREE': 'bi-clock-history',
      'ANNULEE': 'bi-slash-circle'
    };
    return icons[statut] || 'bi-circle';
  }

  getStatutLabel(statut: StatutDerogation): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'APPROUVEE': 'Approuvée',
      'REFUSEE': 'Refusée',
      'EXPIREE': 'Expirée',
      'ANNULEE': 'Annulée'
    };
    return labels[statut] || statut;
  }
}