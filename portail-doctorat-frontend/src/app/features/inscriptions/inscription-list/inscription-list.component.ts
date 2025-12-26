import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { InscriptionService } from '@core/services/inscription.service';
import { AuthService } from '@core/services/auth.service';
import { Inscription } from '@core/models/inscription.model';

@Component({
  selector: 'app-inscription-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="page-container">

        <!-- Hero Header -->
        <div class="hero-section">
          <div class="hero-content">
            <div class="hero-icon">
              <i class="bi bi-journal-check"></i>
            </div>
            <div>
              <h1 class="hero-title">Mes Réinscriptions</h1>
              <p class="hero-subtitle">Gérez vos réinscriptions annuelles au doctorat</p>
            </div>
          </div>
          @if (canReinscribe()) {
            <a routerLink="nouvelle" class="btn-new">
              <i class="bi bi-plus-lg"></i>
              <span>Nouvelle réinscription</span>
            </a>
          }
          <div class="hero-decoration">
            <div class="decoration-circle c1"></div>
            <div class="decoration-circle c2"></div>
          </div>
        </div>

        <!-- Info Card - Année en cours -->
        <div class="current-info-card">
          <div class="info-left">
            <div class="info-icon-large">
              <i class="bi bi-mortarboard"></i>
            </div>
            <div class="info-details">
              <span class="info-label">Année de thèse actuelle</span>
              <span class="info-value">{{ currentUser()?.anneeThese || 1 }}ère année</span>
            </div>
          </div>
          <div class="info-right">
            <div class="info-stat">
              <span class="stat-number">{{ inscriptions().length }}</span>
              <span class="stat-label">Inscription(s)</span>
            </div>
            <div class="info-stat">
              <span class="stat-number">{{ getApprovedCount() }}</span>
              <span class="stat-label">Validée(s)</span>
            </div>
          </div>
        </div>

        <!-- Message d'explication -->
        <div class="explanation-card">
          <div class="explanation-icon">
            <i class="bi bi-info-circle"></i>
          </div>
          <div class="explanation-content">
            <strong>Comment fonctionne la réinscription ?</strong>
            <p>
              Votre première inscription a été effectuée automatiquement lors de l'acceptation de votre candidature.
              Chaque année suivante (à partir de la 2ème année), vous devez soumettre une demande de réinscription
              pour continuer votre parcours doctoral. La durée maximale est de 6 ans avec dérogations.
            </p>
          </div>
        </div>

        <!-- Loading -->
        @if (isLoading()) {
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <span>Chargement de vos inscriptions...</span>
          </div>
        }

        <!-- Timeline des inscriptions -->
        @if (!isLoading() && inscriptions().length > 0) {
          <div class="inscriptions-section">
            <h3 class="section-title">
              <i class="bi bi-clock-history me-2"></i>
              Historique des inscriptions
            </h3>

            <div class="timeline">
              @for (inscription of inscriptions(); track inscription.id; let i = $index) {
                <div class="timeline-item" [class.first]="i === 0">
                  <div class="timeline-marker" [ngClass]="getStatusClass(inscription.statut)">
                    @if (inscription.statut === 'ADMIS') {
                      <i class="bi bi-check-lg"></i>
                    } @else if (inscription.statut === 'REJETE_ADMIN' || inscription.statut === 'REJETE_DIRECTEUR') {
                      <i class="bi bi-x-lg"></i>
                    } @else {
                      <i class="bi bi-hourglass-split"></i>
                    }
                  </div>

                  <div class="timeline-card">
                    <div class="card-header">
                      <div class="card-title-row">
                        <span class="year-badge">
                          {{ inscription.typeInscription === 'PREMIERE_INSCRIPTION' ? '1ère' : (inscription.anneeInscription || i + 1) + 'ème' }} année
                        </span>
                        <span class="status-badge" [ngClass]="getStatusBadgeClass(inscription.statut)">
                          {{ formatStatus(inscription.statut) }}
                        </span>
                      </div>
                      <span class="card-date">
                        <i class="bi bi-calendar3"></i>
                        {{ inscription.createdAt | date:'dd MMM yyyy' }}
                      </span>
                    </div>

                    <div class="card-body">
                      <div class="info-row">
                        <span class="info-label">Sujet de thèse</span>
                        <span class="info-value">{{ inscription.sujetThese || 'Non défini' }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Laboratoire</span>
                        <span class="info-value">{{ inscription.laboratoireAccueil || 'Non défini' }}</span>
                      </div>
                      @if (inscription.commentaireDirecteur) {
                        <div class="comment-box">
                          <i class="bi bi-chat-left-text"></i>
                          <span>{{ inscription.commentaireDirecteur }}</span>
                        </div>
                      }
                    </div>

                    @if (inscription.statut === 'BROUILLON') {
                      <div class="card-actions">
                        <a [routerLink]="['modifier', inscription.id]" class="btn-action edit">
                          <i class="bi bi-pencil"></i>
                          Modifier
                        </a>
                        <button class="btn-action submit" (click)="submitInscription(inscription.id)">
                          <i class="bi bi-send"></i>
                          Soumettre
                        </button>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Empty state -->
        @if (!isLoading() && inscriptions().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <i class="bi bi-journal-x"></i>
            </div>
            <h3 class="empty-title">Aucune inscription trouvée</h3>
            <p class="empty-text">
              Votre première inscription sera créée automatiquement après l'acceptation de votre candidature.
            </p>
          </div>
        }

        <!-- Prérequis Card -->
        <div class="prerequisites-card">
          <h4 class="prereq-title">
            <i class="bi bi-list-check me-2"></i>
            Suivi de vos prérequis
          </h4>
          <div class="prereq-grid">
            <div class="prereq-item">
              <div class="prereq-icon publications">
                <i class="bi bi-journal-richtext"></i>
              </div>
              <div class="prereq-info">
                <span class="prereq-label">Publications Q1/Q2</span>
                <div class="prereq-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width]="getProgressWidth(currentUser()?.nbPublications || 0, 2)"></div>
                  </div>
                  <span class="progress-text">{{ currentUser()?.nbPublications || 0 }} / 2</span>
                </div>
              </div>
            </div>
            <div class="prereq-item">
              <div class="prereq-icon conferences">
                <i class="bi bi-people"></i>
              </div>
              <div class="prereq-info">
                <span class="prereq-label">Conférences internationales</span>
                <div class="prereq-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width]="getProgressWidth(currentUser()?.nbConferences || 0, 2)"></div>
                  </div>
                  <span class="progress-text">{{ currentUser()?.nbConferences || 0 }} / 2</span>
                </div>
              </div>
            </div>
            <div class="prereq-item">
              <div class="prereq-icon formations">
                <i class="bi bi-book"></i>
              </div>
              <div class="prereq-info">
                <span class="prereq-label">Heures de formation</span>
                <div class="prereq-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width]="getProgressWidth(currentUser()?.heuresFormation || 0, 200)"></div>
                  </div>
                  <span class="progress-text">{{ currentUser()?.heuresFormation || 0 }} / 200h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </app-main-layout>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 1.5rem 3rem;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
      color: #059669;
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

    /* Current Info Card */
    .current-info-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
    }

    .info-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .info-icon-large {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .info-details {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 0.8rem;
      color: #64748b;
    }

    .info-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
    }

    .info-right {
      display: flex;
      gap: 2rem;
    }

    .info-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: #10b981;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #64748b;
    }

    /* Explanation Card */
    .explanation-card {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border: 1px solid #6ee7b7;
      border-radius: 16px;
      margin-bottom: 1.5rem;
    }

    .explanation-icon {
      width: 44px;
      height: 44px;
      background: #10b981;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .explanation-content {
      color: #065f46;
    }

    .explanation-content strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .explanation-content p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.5;
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
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #10b981;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Inscriptions Section */
    .inscriptions-section {
      background: white;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 1.5rem;
      display: flex;
      align-items: center;
    }

    .section-title i {
      color: #10b981;
    }

    /* Timeline */
    .timeline {
      position: relative;
      padding-left: 2rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e2e8f0;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .timeline-item:last-child {
      margin-bottom: 0;
    }

    .timeline-marker {
      position: absolute;
      left: -2rem;
      top: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.85rem;
      z-index: 1;
    }

    .timeline-marker.success { background: #22c55e; }
    .timeline-marker.pending { background: #f59e0b; }
    .timeline-marker.rejected { background: #ef4444; }

    .timeline-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: white;
      border-bottom: 1px solid #e2e8f0;
    }

    .card-title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .year-badge {
      background: #10b981;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .status-badge {
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-badge.success { background: #dcfce7; color: #15803d; }
    .status-badge.pending { background: #fef3c7; color: #b45309; }
    .status-badge.rejected { background: #fee2e2; color: #dc2626; }

    .card-date {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: #64748b;
    }

    .card-body {
      padding: 1rem 1.25rem;
    }

    .info-row {
      display: flex;
      flex-direction: column;
      margin-bottom: 0.75rem;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .info-row .info-label {
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 0.15rem;
    }

    .info-row .info-value {
      font-size: 0.9rem;
      font-weight: 500;
      color: #1e293b;
    }

    .comment-box {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: #eff6ff;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #1d4ed8;
    }

    .card-actions {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-top: 1px solid #e2e8f0;
      background: white;
    }

    .btn-action {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      border: none;
    }

    .btn-action.edit {
      background: #e0e7ff;
      color: #4f46e5;
    }

    .btn-action.edit:hover {
      background: #c7d2fe;
    }

    .btn-action.submit {
      background: #10b981;
      color: white;
    }

    .btn-action.submit:hover {
      background: #059669;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      background: #ecfdf5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .empty-icon i {
      font-size: 2.5rem;
      color: #10b981;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 0.5rem;
    }

    .empty-text {
      color: #64748b;
      margin: 0;
    }

    /* Prerequisites Card */
    .prerequisites-card {
      background: white;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }

    .prereq-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 1.25rem;
      display: flex;
      align-items: center;
    }

    .prereq-title i {
      color: #10b981;
    }

    .prereq-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .prereq-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .prereq-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .prereq-icon.publications { background: #dbeafe; color: #2563eb; }
    .prereq-icon.conferences { background: #fce7f3; color: #db2777; }
    .prereq-icon.formations { background: #fef3c7; color: #d97706; }

    .prereq-info {
      flex: 1;
    }

    .prereq-label {
      display: block;
      font-size: 0.8rem;
      color: #64748b;
      margin-bottom: 0.5rem;
    }

    .prereq-progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      border-radius: 3px;
      transition: width 0.3s;
    }

    .progress-text {
      font-size: 0.75rem;
      font-weight: 600;
      color: #1e293b;
      white-space: nowrap;
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

      .current-info-card {
        flex-direction: column;
        gap: 1.5rem;
      }

      .prereq-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InscriptionListComponent implements OnInit {
  inscriptions = signal<Inscription[]>([]);
  isLoading = signal(true);
  currentUser = signal<any>(null);

  constructor(
      private inscriptionService: InscriptionService,
      private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser.set(this.authService.currentUser());
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.inscriptionService.getMyInscriptions().subscribe({
      next: (data) => {
        this.inscriptions.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement inscriptions:', err);
        this.isLoading.set(false);
      }
    });
  }

  canReinscribe(): boolean {
    // Peut se réinscrire si pas d'inscription en cours (BROUILLON ou SOUMIS)
    const pending = this.inscriptions().find(i =>
        i.statut === 'BROUILLON' || i.statut === 'SOUMIS' || i.statut === 'EN_ATTENTE_ADMIN' || i.statut === 'EN_ATTENTE_DIRECTEUR'
    );
    return !pending;
  }

  getApprovedCount(): number {
    return this.inscriptions().filter(i => i.statut === 'ADMIS').length;
  }

  getStatusClass(statut: string): string {
    if (statut === 'ADMIS') return 'success';
    if (statut === 'REJETE_ADMIN' || statut === 'REJETE_DIRECTEUR') return 'rejected';
    return 'pending';
  }

  getStatusBadgeClass(statut: string): string {
    if (statut === 'ADMIS') return 'success';
    if (statut === 'REJETE_ADMIN' || statut === 'REJETE_DIRECTEUR') return 'rejected';
    return 'pending';
  }

  formatStatus(statut: string): string {
    const statusMap: Record<string, string> = {
      'BROUILLON': 'Brouillon',
      'SOUMIS': 'Soumis',
      'EN_ATTENTE_ADMIN': 'En attente Admin',
      'EN_ATTENTE_DIRECTEUR': 'En attente Directeur',
      'ADMIS': 'Validée',
      'REJETE_ADMIN': 'Refusée (Admin)',
      'REJETE_DIRECTEUR': 'Refusée (Directeur)'
    };
    return statusMap[statut] || statut;
  }

  getProgressWidth(current: number, max: number): string {
    const percentage = Math.min((current / max) * 100, 100);
    return `${percentage}%`;
  }

  submitInscription(id: number) {
    if (confirm('Soumettre cette inscription pour validation ?')) {
      this.inscriptionService.soumettre(id).subscribe({
        next: () => {
          alert('Inscription soumise avec succès !');
          this.loadData();
        },
        error: (err) => {
          console.error('Erreur soumission:', err);
          alert('Erreur lors de la soumission');
        }
      });
    }
  }
}