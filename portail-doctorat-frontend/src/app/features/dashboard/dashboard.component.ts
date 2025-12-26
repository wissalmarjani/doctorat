import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { AuthService } from '@core/services/auth.service';
import { InscriptionService } from '@core/services/inscription.service';
import { Role } from '@core/models/user.model';
import { AdminDashboardComponent } from '../admin/dashboard/admin-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MainLayoutComponent, AdminDashboardComponent],
  template: `
    <!-- CAS 1 : C'EST UN ADMIN -->
    @if (isAdmin()) {
      <app-admin-dashboard></app-admin-dashboard>
    }

    @else {
      <app-main-layout>
        <div class="dashboard-container p-4">

          <!-- ============================================== -->
          <!-- HEADER AVEC MESSAGE DE BIENVENUE               -->
          <!-- ============================================== -->
          <header class="welcome-header mb-5">
            <div class="welcome-content">
              <div class="welcome-text">
                <h1 class="fw-bold text-dark mb-2">
                  Bonjour, {{ authService.currentUser()?.prenom }} ! 👋
                </h1>
                <p class="text-muted mb-0">{{ getWelcomeMessage() }}</p>
              </div>
              <div class="welcome-date">
                <div class="date-box">
                  <i class="bi bi-calendar3"></i>
                  <span>{{ today | date:'EEEE d MMMM yyyy' }}</span>
                </div>
              </div>
            </div>
          </header>

          <!-- ============================================== -->
          <!-- SECTION DOCTORANT                              -->
          <!-- ============================================== -->
          @if (isDoctorant()) {

            <!-- ALERTE DURÉE (si applicable) -->
            @if (getAnneeTheseNumber() >= 3) {
              <div class="alert-banner mb-4" [class]="getAlertClass()">
                <div class="alert-icon">
                  <i class="bi" [class]="getAlertIcon()"></i>
                </div>
                <div class="alert-content">
                  <strong>{{ getAlertTitle() }}</strong>
                  <p class="mb-0">{{ getAlertMessage() }}</p>
                </div>
                @if (getAnneeTheseNumber() >= 4) {
                  <a routerLink="/derogations" class="btn btn-sm btn-light">
                    Demander une dérogation
                  </a>
                }
              </div>
            }

            <!-- STATS CARDS -->
            <div class="row g-4 mb-5">
              <!-- Année de Thèse -->
              <div class="col-lg-3 col-md-6">
                <div class="stat-card" [class]="getYearCardClass()">
                  <div class="stat-icon">
                    <i class="bi bi-calendar-check"></i>
                  </div>
                  <div class="stat-info">
                    <span class="stat-label">Année de thèse</span>
                    <h2 class="stat-value">{{ getAnneeTheseNumber() }}<sup>{{ getAnneeTheseSuffix() }}</sup></h2>
                  </div>
                  <div class="stat-progress">
                    <div class="progress-bar" [style.width.%]="(getAnneeTheseNumber() / 6) * 100"></div>
                  </div>
                </div>
              </div>

              <!-- Publications -->
              <div class="col-lg-3 col-md-6">
                <div class="stat-card stat-publications">
                  <div class="stat-icon">
                    <i class="bi bi-journal-richtext"></i>
                  </div>
                  <div class="stat-info">
                    <span class="stat-label">Publications Q1/Q2</span>
                    <h2 class="stat-value">{{ getPublications() }}<span class="stat-total">/2</span></h2>
                  </div>
                  <div class="stat-progress">
                    <div class="progress-bar" [style.width.%]="(getPublications() / 2) * 100"></div>
                  </div>
                </div>
              </div>

              <!-- Conférences -->
              <div class="col-lg-3 col-md-6">
                <div class="stat-card stat-conferences">
                  <div class="stat-icon">
                    <i class="bi bi-mic"></i>
                  </div>
                  <div class="stat-info">
                    <span class="stat-label">Conférences</span>
                    <h2 class="stat-value">{{ getConferences() }}<span class="stat-total">/2</span></h2>
                  </div>
                  <div class="stat-progress">
                    <div class="progress-bar" [style.width.%]="(getConferences() / 2) * 100"></div>
                  </div>
                </div>
              </div>

              <!-- Heures Formation -->
              <div class="col-lg-3 col-md-6">
                <div class="stat-card stat-formation">
                  <div class="stat-icon">
                    <i class="bi bi-mortarboard"></i>
                  </div>
                  <div class="stat-info">
                    <span class="stat-label">Heures Formation</span>
                    <h2 class="stat-value">{{ getHeuresFormation() }}<span class="stat-total">/200h</span></h2>
                  </div>
                  <div class="stat-progress">
                    <div class="progress-bar" [style.width.%]="(getHeuresFormation() / 200) * 100"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- PRÉREQUIS SOUTENANCE -->
            <div class="prerequis-section mb-5">
              <div class="section-header">
                <h4><i class="bi bi-list-check me-2"></i>Prérequis pour la Soutenance</h4>
                <span class="badge" [class]="canSoutenir() ? 'bg-success' : 'bg-warning'">
                  {{ canSoutenir() ? '✓ Éligible' : 'En cours' }}
                </span>
              </div>
              <div class="prerequis-grid">
                <div class="prerequis-item" [class.completed]="getPublications() >= 2">
                  <div class="prerequis-check">
                    <i class="bi" [class]="getPublications() >= 2 ? 'bi-check-circle-fill' : 'bi-circle'"></i>
                  </div>
                  <div class="prerequis-content">
                    <strong>2 Publications Q1/Q2</strong>
                    <span>{{ getPublications() }}/2 complétées</span>
                  </div>
                </div>

                <div class="prerequis-item" [class.completed]="getConferences() >= 2">
                  <div class="prerequis-check">
                    <i class="bi" [class]="getConferences() >= 2 ? 'bi-check-circle-fill' : 'bi-circle'"></i>
                  </div>
                  <div class="prerequis-content">
                    <strong>2 Conférences</strong>
                    <span>{{ getConferences() }}/2 complétées</span>
                  </div>
                </div>

                <div class="prerequis-item" [class.completed]="getHeuresFormation() >= 200">
                  <div class="prerequis-check">
                    <i class="bi" [class]="getHeuresFormation() >= 200 ? 'bi-check-circle-fill' : 'bi-circle'"></i>
                  </div>
                  <div class="prerequis-content">
                    <strong>200 Heures de Formation</strong>
                    <span>{{ getHeuresFormation() }}/200h complétées</span>
                  </div>
                </div>

                <div class="prerequis-item" [class.completed]="getAnneeTheseNumber() <= 3">
                  <div class="prerequis-check">
                    <i class="bi" [class]="getAnneeTheseNumber() <= 3 ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill text-warning'"></i>
                  </div>
                  <div class="prerequis-content">
                    <strong>Durée ≤ 3 ans</strong>
                    <span>{{ getAnneeTheseNumber() > 3 ? 'Dérogation requise' : 'Dans les délais' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ACTIONS RAPIDES -->
            <h4 class="section-title mb-4"><i class="bi bi-lightning-charge me-2"></i>Actions Rapides</h4>
            <div class="row g-4 mb-5">
              <div class="col-md-6 col-lg-3">
                <a routerLink="/inscriptions" class="action-card action-blue">
                  <div class="action-icon">
                    <i class="bi bi-folder2-open"></i>
                  </div>
                  <div class="action-content">
                    <h5>Mes Dossiers</h5>
                    <p>Inscriptions annuelles</p>
                  </div>
                  <i class="bi bi-arrow-right action-arrow"></i>
                </a>
              </div>

              <div class="col-md-6 col-lg-3">
                <a routerLink="/soutenances" class="action-card action-purple" [class.disabled]="!canSoutenir()">
                  <div class="action-icon">
                    <i class="bi bi-award"></i>
                  </div>
                  <div class="action-content">
                    <h5>Ma Soutenance</h5>
                    <p>{{ canSoutenir() ? 'Déposer ma demande' : 'Prérequis non atteints' }}</p>
                  </div>
                  <i class="bi bi-arrow-right action-arrow"></i>
                </a>
              </div>

              <div class="col-md-6 col-lg-3">
                <a routerLink="/derogations" class="action-card action-orange">
                  <div class="action-icon">
                    <i class="bi bi-clock-history"></i>
                  </div>
                  <div class="action-content">
                    <h5>Dérogations</h5>
                    <p>Demander une prolongation</p>
                  </div>
                  <i class="bi bi-arrow-right action-arrow"></i>
                </a>
              </div>

              <div class="col-md-6 col-lg-3">
                <a routerLink="/profil" class="action-card action-gray">
                  <div class="action-icon">
                    <i class="bi bi-person-gear"></i>
                  </div>
                  <div class="action-content">
                    <h5>Mon Profil</h5>
                    <p>Informations personnelles</p>
                  </div>
                  <i class="bi bi-arrow-right action-arrow"></i>
                </a>
              </div>
            </div>

            <!-- INFORMATIONS PERSONNELLES -->
            <div class="info-card">
              <div class="info-header">
                <h4><i class="bi bi-person-badge me-2"></i>Mon Profil Doctorant</h4>
                <a routerLink="/profil" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-pencil me-1"></i>Modifier
                </a>
              </div>
              <div class="info-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="info-item">
                      <span class="info-label">Nom complet</span>
                      <span class="info-value">{{ authService.currentUser()?.nom }} {{ authService.currentUser()?.prenom }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Matricule</span>
                      <span class="info-value font-monospace">{{ authService.currentUser()?.username }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Email</span>
                      <span class="info-value">{{ authService.currentUser()?.email }}</span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-item">
                      <span class="info-label">Téléphone</span>
                      <span class="info-value">{{ authService.currentUser()?.telephone || 'Non renseigné' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Statut</span>
                      <span class="info-value">
                        <span class="badge bg-success-subtle text-success">
                          <i class="bi bi-patch-check-fill me-1"></i>DOCTORANT VALIDÉ
                        </span>
                      </span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Dossiers soumis</span>
                      <span class="info-value">{{ stats().inscriptions }} inscription(s)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- ============================================== -->
          <!-- SECTION DIRECTEUR                              -->
          <!-- ============================================== -->
          @if (isDirecteur()) {
            <!-- STATS DIRECTEUR -->
            <div class="row g-4 mb-5">
              <div class="col-md-4">
                <div class="stat-card stat-warning">
                  <div class="stat-icon">
                    <i class="bi bi-hourglass-split"></i>
                  </div>
                  <div class="stat-info">
                    <span class="stat-label">Dossiers à valider</span>
                    <h2 class="stat-value">{{ stats().aValider }}</h2>
                  </div>
                </div>
              </div>
            </div>

            <!-- ACTIONS DIRECTEUR -->
            <h4 class="section-title mb-4"><i class="bi bi-lightning-charge me-2"></i>Actions Rapides</h4>
            <div class="row g-4">
              <div class="col-md-6 col-lg-4">
                <a routerLink="/validations" class="action-card action-green">
                  <div class="action-icon">
                    <i class="bi bi-check2-circle"></i>
                  </div>
                  <div class="action-content">
                    <h5>Valider Inscriptions</h5>
                    <p>Examiner les dossiers en attente</p>
                  </div>
                  <i class="bi bi-arrow-right action-arrow"></i>
                </a>
              </div>

              <div class="col-md-6 col-lg-4">
                <a routerLink="/director/soutenances" class="action-card action-purple">
                  <div class="action-icon">
                    <i class="bi bi-mortarboard"></i>
                  </div>
                  <div class="action-content">
                    <h5>Soutenances</h5>
                    <p>Gérer les demandes de soutenance</p>
                  </div>
                  <i class="bi bi-arrow-right action-arrow"></i>
                </a>
              </div>
            </div>
          }

        </div>
      </app-main-layout>
    }
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    /* WELCOME HEADER */
    .welcome-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 2rem;
      color: white;
    }

    .welcome-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .welcome-text h1 {
      color: white;
      font-size: 1.75rem;
    }

    .welcome-text p {
      color: rgba(255,255,255,0.8);
      font-size: 1rem;
    }

    .date-box {
      background: rgba(255,255,255,0.15);
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    /* ALERT BANNER */
    .alert-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      background: #fef3c7;
      border: 1px solid #fcd34d;
    }

    .alert-banner.alert-warning {
      background: #fef3c7;
      border-color: #fcd34d;
    }

    .alert-banner.alert-danger {
      background: #fee2e2;
      border-color: #fca5a5;
    }

    .alert-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background: rgba(0,0,0,0.1);
    }

    .alert-content {
      flex: 1;
    }

    .alert-content p {
      font-size: 0.875rem;
      opacity: 0.8;
    }

    /* STAT CARDS */
    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      position: relative;
      overflow: hidden;
    }

    .stat-card .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .stat-card .stat-label {
      font-size: 0.8rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .stat-card .stat-value {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0;
      line-height: 1;
    }

    .stat-card .stat-value sup {
      font-size: 1rem;
      font-weight: 600;
    }

    .stat-card .stat-total {
      font-size: 1rem;
      color: #94a3b8;
      font-weight: 500;
    }

    .stat-card .stat-progress {
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      margin-top: 1rem;
      overflow: hidden;
    }

    .stat-card .stat-progress .progress-bar {
      height: 100%;
      border-radius: 2px;
      transition: width 0.5s ease;
    }

    /* Stat Card Colors */
    .stat-card.stat-year-green .stat-icon { background: #dcfce7; color: #16a34a; }
    .stat-card.stat-year-green .stat-value { color: #16a34a; }
    .stat-card.stat-year-green .progress-bar { background: #16a34a; }

    .stat-card.stat-year-yellow .stat-icon { background: #fef3c7; color: #d97706; }
    .stat-card.stat-year-yellow .stat-value { color: #d97706; }
    .stat-card.stat-year-yellow .progress-bar { background: #d97706; }

    .stat-card.stat-year-orange .stat-icon { background: #ffedd5; color: #ea580c; }
    .stat-card.stat-year-orange .stat-value { color: #ea580c; }
    .stat-card.stat-year-orange .progress-bar { background: #ea580c; }

    .stat-card.stat-year-red .stat-icon { background: #fee2e2; color: #dc2626; }
    .stat-card.stat-year-red .stat-value { color: #dc2626; }
    .stat-card.stat-year-red .progress-bar { background: #dc2626; }

    .stat-card.stat-publications .stat-icon { background: #dbeafe; color: #2563eb; }
    .stat-card.stat-publications .stat-value { color: #2563eb; }
    .stat-card.stat-publications .progress-bar { background: #2563eb; }

    .stat-card.stat-conferences .stat-icon { background: #f3e8ff; color: #9333ea; }
    .stat-card.stat-conferences .stat-value { color: #9333ea; }
    .stat-card.stat-conferences .progress-bar { background: #9333ea; }

    .stat-card.stat-formation .stat-icon { background: #fce7f3; color: #db2777; }
    .stat-card.stat-formation .stat-value { color: #db2777; }
    .stat-card.stat-formation .progress-bar { background: #db2777; }

    .stat-card.stat-warning .stat-icon { background: #fef3c7; color: #d97706; }
    .stat-card.stat-warning .stat-value { color: #d97706; }

    /* PREREQUIS SECTION */
    .prerequis-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .section-header h4 {
      margin: 0;
      font-weight: 700;
      color: #1e293b;
    }

    .prerequis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .prerequis-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s;
    }

    .prerequis-item.completed {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .prerequis-check i {
      font-size: 1.5rem;
      color: #cbd5e1;
    }

    .prerequis-item.completed .prerequis-check i {
      color: #22c55e;
    }

    .prerequis-content strong {
      display: block;
      font-size: 0.9rem;
      color: #1e293b;
    }

    .prerequis-content span {
      font-size: 0.8rem;
      color: #64748b;
    }

    /* SECTION TITLE */
    .section-title {
      font-weight: 700;
      color: #1e293b;
      display: flex;
      align-items: center;
    }

    /* ACTION CARDS */
    .action-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: white;
      border-radius: 16px;
      text-decoration: none;
      color: inherit;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.12);
    }

    .action-card.disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    .action-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
    }

    .action-content {
      flex: 1;
    }

    .action-content h5 {
      margin: 0 0 0.25rem 0;
      font-weight: 700;
      font-size: 1rem;
      color: #1e293b;
    }

    .action-content p {
      margin: 0;
      font-size: 0.8rem;
      color: #64748b;
    }

    .action-arrow {
      color: #cbd5e1;
      font-size: 1.25rem;
      transition: transform 0.2s;
    }

    .action-card:hover .action-arrow {
      transform: translateX(4px);
      color: #667eea;
    }

    /* Action Card Colors */
    .action-card.action-blue .action-icon { background: #dbeafe; color: #2563eb; }
    .action-card.action-purple .action-icon { background: #f3e8ff; color: #9333ea; }
    .action-card.action-orange .action-icon { background: #ffedd5; color: #ea580c; }
    .action-card.action-green .action-icon { background: #dcfce7; color: #16a34a; }
    .action-card.action-gray .action-icon { background: #f1f5f9; color: #64748b; }

    /* INFO CARD */
    .info-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .info-header h4 {
      margin: 0;
      font-weight: 700;
      color: #1e293b;
    }

    .info-body {
      padding: 1.5rem;
    }

    .info-item {
      margin-bottom: 1rem;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-label {
      display: block;
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.25rem;
    }

    .info-value {
      font-size: 1rem;
      color: #1e293b;
      font-weight: 500;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .welcome-content {
        flex-direction: column;
        text-align: center;
      }

      .stat-card .stat-value {
        font-size: 2rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats = signal({ inscriptions: 0, aValider: 0 });
  today = new Date();

  constructor(
      public authService: AuthService,
      private inscriptionService: InscriptionService,
      private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  isDoctorant(): boolean { return this.authService.currentUser()?.role === Role.DOCTORANT; }
  isDirecteur(): boolean { return this.authService.currentUser()?.role === Role.DIRECTEUR_THESE; }
  isAdmin(): boolean { return this.authService.currentUser()?.role === Role.ADMIN; }

  getWelcomeMessage(): string {
    if (this.isDoctorant()) {
      return 'Bienvenue dans votre espace doctorant. Suivez votre progression et gérez vos dossiers.';
    }
    if (this.isDirecteur()) {
      return 'Bienvenue dans votre espace encadrement. Gérez les dossiers de vos doctorants.';
    }
    return 'Bienvenue sur le Portail Doctorat.';
  }

  // ============================================
  // MÉTHODES POUR LES STATS DOCTORANT
  // ============================================

  getAnneeTheseNumber(): number {
    return this.authService.currentUser()?.anneeThese || 1;
  }

  getAnneeTheseSuffix(): string {
    const annee = this.getAnneeTheseNumber();
    if (annee === 1) return 'ère';
    return 'ème';
  }

  getPublications(): number {
    return this.authService.currentUser()?.nbPublications || 0;
  }

  getConferences(): number {
    return this.authService.currentUser()?.nbConferences || 0;
  }

  getHeuresFormation(): number {
    return this.authService.currentUser()?.heuresFormation || 0;
  }

  canSoutenir(): boolean {
    return this.getPublications() >= 2 &&
        this.getConferences() >= 2 &&
        this.getHeuresFormation() >= 200;
  }

  // ============================================
  // MÉTHODES POUR LES COULEURS SELON L'ANNÉE
  // ============================================

  getYearCardClass(): string {
    const annee = this.getAnneeTheseNumber();
    if (annee <= 2) return 'stat-year-green';
    if (annee === 3) return 'stat-year-yellow';
    if (annee <= 5) return 'stat-year-orange';
    return 'stat-year-red';
  }

  getAlertClass(): string {
    const annee = this.getAnneeTheseNumber();
    if (annee === 3) return 'alert-warning';
    if (annee >= 4) return 'alert-danger';
    return '';
  }

  getAlertIcon(): string {
    const annee = this.getAnneeTheseNumber();
    if (annee >= 5) return 'bi-exclamation-triangle-fill';
    return 'bi-info-circle-fill';
  }

  getAlertTitle(): string {
    const annee = this.getAnneeTheseNumber();
    if (annee === 3) return 'Attention : 3ème année de thèse';
    if (annee === 4) return 'Dérogation requise : 4ème année';
    if (annee === 5) return '⚠️ Attention : 5ème année de thèse';
    if (annee === 6) return '🚨 Dernière année possible !';
    return '';
  }

  getAlertMessage(): string {
    const annee = this.getAnneeTheseNumber();
    if (annee === 3) return 'La durée normale de thèse est de 3 ans. Pensez à planifier votre soutenance.';
    if (annee === 4) return 'Vous devez demander une dérogation pour continuer votre thèse au-delà de 3 ans.';
    if (annee === 5) return 'Il vous reste 2 ans maximum. Planifiez votre soutenance dès que possible.';
    if (annee === 6) return 'C\'est votre dernière année. Vous devez absolument soutenir cette année.';
    return '';
  }

  // ============================================
  // CHARGEMENT DES DONNÉES
  // ============================================

  private loadData(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    if (this.isDoctorant()) {
      this.inscriptionService.getByDoctorant(user.id).subscribe({
        next: (data) => {
          this.stats.update(s => ({ ...s, inscriptions: data.length }));
        },
        error: (err) => console.error('Erreur chargement inscriptions:', err)
      });
    }
    else if (this.isDirecteur()) {
      this.inscriptionService.getInscriptionsByDirecteur(user.id).subscribe({
        next: (data) => {
          const count = data.filter((i: any) => i.statut === 'SOUMIS').length;
          this.stats.update(s => ({ ...s, aValider: count }));
        },
        error: (err) => console.error('Erreur chargement validations:', err)
      });
    }
  }
}