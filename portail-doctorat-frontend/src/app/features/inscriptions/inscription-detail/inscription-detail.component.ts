import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { InscriptionService } from '@core/services/inscription.service';
import { AuthService } from '@core/services/auth.service';
import { Inscription } from '@core/models/inscription.model';
import { Role } from '@core/models/user.model';

@Component({
  selector: 'app-inscription-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MainLayoutComponent],
  template: `
    <app-main-layout>
      <div class="page-container">

        <!-- HEADER -->
        <div class="page-header">
          <button class="btn btn-back" (click)="goBack()">
            <i class="bi bi-arrow-left"></i> Retour
          </button>
        </div>

        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement du dossier...</p>
          </div>
        } @else if (inscription()) {

          <!-- CARTE PRINCIPALE -->
          <div class="detail-card">

            <!-- EN-TÊTE AVEC STATUT -->
            <div class="detail-header">
              <div class="header-info">
                <h1>Dossier d'Inscription</h1>
                <p class="header-meta">
                  <span class="meta-item">
                    <i class="bi bi-hash"></i>{{ inscription()?.id }}
                  </span>
                  <span class="meta-item">
                    <i class="bi bi-calendar3"></i>{{ inscription()?.createdAt | date:'dd MMMM yyyy à HH:mm' }}
                  </span>
                </p>
              </div>
              <div class="status-badge" [class]="getStatusClass()">
                <i class="bi" [class]="getStatusIcon()"></i>
                {{ getStatusLabel() }}
              </div>
            </div>

            <!-- BANDEAU DE STATUT DÉTAILLÉ -->
            <div class="status-banner" [class]="getStatusBannerClass()">
              <div class="status-banner-icon">
                <i class="bi" [class]="getStatusBannerIcon()"></i>
              </div>
              <div class="status-banner-content">
                <strong>{{ getStatusBannerTitle() }}</strong>
                <p>{{ getStatusBannerMessage() }}</p>
              </div>
            </div>

            <!-- CONTENU -->
            <div class="detail-body">

              <!-- SECTION : ANNÉE UNIVERSITAIRE -->
              <div class="detail-section">
                <h3 class="section-title">
                  <i class="bi bi-calendar-event"></i>
                  Année Universitaire
                </h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Campagne</span>
                    <span class="info-value highlight">
                      {{ inscription()?.campagne?.anneeUniversitaire || '2025-2026' }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Type d'inscription</span>
                    <span class="info-value">
                      <span class="badge-type">
                        {{ inscription()?.typeInscription === 'PREMIERE_INSCRIPTION' ? '1ère Inscription' : 'Réinscription' }}
                      </span>
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Année de thèse</span>
                    <span class="info-value">{{ getAnneeThese() }}</span>
                  </div>
                </div>
              </div>

              <!-- SECTION : PROJET DE THÈSE -->
              <div class="detail-section">
                <h3 class="section-title">
                  <i class="bi bi-lightbulb"></i>
                  Projet de Thèse
                </h3>
                <div class="thesis-box">
                  <label>Sujet de recherche</label>
                  <p>{{ inscription()?.sujetThese }}</p>
                </div>
                <div class="info-grid mt-4">
                  <div class="info-item">
                    <span class="info-label">Laboratoire d'accueil</span>
                    <span class="info-value">{{ inscription()?.laboratoireAccueil || 'Non renseigné' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Collaboration externe</span>
                    <span class="info-value">{{ inscription()?.collaborationExterne || 'Aucune' }}</span>
                  </div>
                </div>
              </div>

              <!-- SECTION : ENCADREMENT -->
              <div class="detail-section">
                <h3 class="section-title">
                  <i class="bi bi-people"></i>
                  Encadrement
                </h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Directeur de thèse</span>
                    <span class="info-value">
                      {{ inscription()?.directeurNom || 'En attente d\'assignation' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- COMMENTAIRES (si rejeté) -->
              @if (inscription()?.commentaireDirecteur) {
                <div class="detail-section">
                  <h3 class="section-title text-danger">
                    <i class="bi bi-chat-left-text"></i>
                    Commentaire du Directeur
                  </h3>
                  <div class="comment-box">
                    <i class="bi bi-quote"></i>
                    <p>{{ inscription()?.commentaireDirecteur }}</p>
                  </div>
                </div>
              }

              @if (inscription()?.commentaireAdmin) {
                <div class="detail-section">
                  <h3 class="section-title text-danger">
                    <i class="bi bi-chat-left-text"></i>
                    Commentaire de l'Administration
                  </h3>
                  <div class="comment-box">
                    <i class="bi bi-quote"></i>
                    <p>{{ inscription()?.commentaireAdmin }}</p>
                  </div>
                </div>
              }

            </div>

            <!-- ACTIONS -->
            <div class="detail-footer">
              @if (isBrouillon() && isStudentOwner()) {
                <div class="action-group">
                  <p class="action-hint">
                    <i class="bi bi-info-circle"></i>
                    Ce dossier est en brouillon. Vous pouvez le modifier ou le soumettre pour validation.
                  </p>
                  <div class="action-buttons">
                    <a [routerLink]="['/inscriptions', inscription()?.id, 'edit']" class="btn btn-outline">
                      <i class="bi bi-pencil"></i> Modifier
                    </a>
                    <button class="btn btn-primary" (click)="soumettre()" [disabled]="isSubmitting()">
                      @if (isSubmitting()) {
                        <span class="spinner-border spinner-border-sm"></span>
                      } @else {
                        <i class="bi bi-send"></i>
                      }
                      Soumettre pour validation
                    </button>
                  </div>
                </div>
              }

              @if (isRejected() && isStudentOwner()) {
                <div class="action-group">
                  <p class="action-hint text-danger">
                    <i class="bi bi-exclamation-triangle"></i>
                    Votre dossier a été rejeté. Veuillez corriger et resoumettre.
                  </p>
                  <div class="action-buttons">
                    <a [routerLink]="['/inscriptions', inscription()?.id, 'edit']" class="btn btn-primary">
                      <i class="bi bi-pencil"></i> Modifier et resoumettre
                    </a>
                  </div>
                </div>
              }

              @if (canDirecteurValidate()) {
                <div class="action-group">
                  <p class="action-hint">
                    <i class="bi bi-shield-check"></i>
                    En tant que Directeur de thèse, vous devez valider ou rejeter ce dossier.
                  </p>
                  <div class="action-buttons">
                    <button class="btn btn-danger" (click)="rejeter()">
                      <i class="bi bi-x-circle"></i> Rejeter
                    </button>
                    <button class="btn btn-success" (click)="valider()">
                      <i class="bi bi-check-circle"></i> Valider le dossier
                    </button>
                  </div>
                </div>
              }

              @if (isSoumis() && isStudentOwner() && !canDirecteurValidate()) {
                <div class="action-group">
                  <p class="action-hint text-muted">
                    <i class="bi bi-hourglass-split"></i>
                    Votre dossier est en cours d'examen. Vous serez notifié dès qu'une décision sera prise.
                  </p>
                </div>
              }

              @if (isValideFinal()) {
                <div class="action-group text-center">
                  <div class="success-icon">
                    <i class="bi bi-patch-check-fill"></i>
                  </div>
                  <p class="success-message">
                    🎉 Félicitations ! Votre inscription a été validée.
                  </p>
                </div>
              }
            </div>

          </div>

        } @else {
          <div class="empty-state">
            <i class="bi bi-exclamation-circle"></i>
            <h3>Dossier introuvable</h3>
            <p>Ce dossier n'existe pas ou vous n'avez pas les droits pour le consulter.</p>
            <button class="btn btn-primary" (click)="goBack()">Retour</button>
          </div>
        }

      </div>
    </app-main-layout>
  `,
  styles: [`
    .page-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    /* HEADER */
    .page-header {
      margin-bottom: 1.5rem;
    }

    .btn-back {
      background: white;
      border: 1px solid #e2e8f0;
      padding: 0.625rem 1.25rem;
      border-radius: 10px;
      font-weight: 500;
      color: #64748b;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: #f8fafc;
      color: #1e293b;
    }

    /* LOADING */
    .loading-state {
      text-align: center;
      padding: 4rem;
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

    /* DETAIL CARD */
    .detail-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 25px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    /* HEADER */
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .detail-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .header-meta {
      display: flex;
      gap: 1.5rem;
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-badge {
      padding: 0.625rem 1.25rem;
      border-radius: 50px;
      font-weight: 600;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: white;
    }

    .status-badge.status-brouillon { color: #64748b; }
    .status-badge.status-soumis { color: #d97706; }
    .status-badge.status-valide-directeur { color: #2563eb; }
    .status-badge.status-valide-admin { color: #16a34a; }
    .status-badge.status-rejete { color: #dc2626; }

    /* STATUS BANNER */
    .status-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 2rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .status-banner.banner-brouillon {
      background: #f8fafc;
      color: #475569;
    }

    .status-banner.banner-soumis {
      background: #fef3c7;
      color: #92400e;
    }

    .status-banner.banner-valide-directeur {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-banner.banner-valide-admin {
      background: #dcfce7;
      color: #166534;
    }

    .status-banner.banner-rejete {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-banner-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      background: rgba(255,255,255,0.5);
      flex-shrink: 0;
    }

    .status-banner-content strong {
      display: block;
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }

    .status-banner-content p {
      margin: 0;
      font-size: 0.875rem;
      opacity: 0.9;
    }

    /* BODY */
    .detail-body {
      padding: 2rem;
    }

    .detail-section {
      margin-bottom: 2rem;
    }

    .detail-section:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .section-title i {
      color: #667eea;
    }

    .section-title.text-danger i {
      color: #dc2626;
    }

    /* INFO GRID */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .info-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 600;
    }

    .info-value {
      font-size: 1rem;
      color: #1e293b;
      font-weight: 500;
    }

    .info-value.highlight {
      font-size: 1.25rem;
      font-weight: 700;
      color: #667eea;
    }

    .badge-type {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      background: #f1f5f9;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      color: #475569;
    }

    /* THESIS BOX */
    .thesis-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
    }

    .thesis-box label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 600;
      display: block;
      margin-bottom: 0.5rem;
    }

    .thesis-box p {
      margin: 0;
      font-size: 1rem;
      color: #1e293b;
      line-height: 1.6;
    }

    /* COMMENT BOX */
    .comment-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      padding: 1.25rem;
      position: relative;
    }

    .comment-box i {
      position: absolute;
      top: 1rem;
      left: 1rem;
      font-size: 2rem;
      color: #fca5a5;
      opacity: 0.5;
    }

    .comment-box p {
      margin: 0;
      padding-left: 2.5rem;
      color: #991b1b;
      font-style: italic;
    }

    /* FOOTER */
    .detail-footer {
      padding: 1.5rem 2rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .action-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .action-hint {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }

    .action-hint.text-danger {
      color: #dc2626;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
      text-decoration: none;
    }

    .btn-outline {
      background: white;
      border: 1px solid #e2e8f0;
      color: #64748b;
    }

    .btn-outline:hover {
      background: #f8fafc;
      color: #1e293b;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      background: #cbd5e1;
      transform: none;
      box-shadow: none;
    }

    .btn-success {
      background: #16a34a;
      color: white;
    }

    .btn-success:hover {
      background: #15803d;
    }

    .btn-danger {
      background: #dc2626;
      color: white;
    }

    .btn-danger:hover {
      background: #b91c1c;
    }

    /* SUCCESS STATE */
    .success-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      box-shadow: 0 10px 30px rgba(34, 197, 94, 0.3);
    }

    .success-icon i {
      font-size: 2.5rem;
      color: white;
    }

    .success-message {
      font-size: 1.125rem;
      font-weight: 600;
      color: #16a34a;
      margin: 0;
    }

    /* EMPTY STATE */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
    }

    .empty-state i {
      font-size: 4rem;
      color: #e2e8f0;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin-bottom: 0.5rem;
      color: #1e293b;
    }

    .empty-state p {
      color: #64748b;
      margin-bottom: 1.5rem;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .detail-header {
        flex-direction: column;
        gap: 1rem;
      }

      .header-meta {
        flex-direction: column;
        gap: 0.5rem;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class InscriptionDetailComponent implements OnInit {
  inscription = signal<Inscription | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private inscriptionService: InscriptionService,
      private authService: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInscription(+id);
    }
  }

  private loadInscription(id: number) {
    this.inscriptionService.getInscriptionById(id).subscribe({
      next: (data) => {
        this.inscription.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  // ============================================
  // HELPERS POUR LE STATUT
  // ============================================

  private getStatut(): string {
    return this.inscription()?.statut?.toString() || 'BROUILLON';
  }

  isBrouillon(): boolean {
    return this.getStatut() === 'BROUILLON';
  }

  isSoumis(): boolean {
    return this.getStatut() === 'SOUMIS';
  }

  isValideDirecteur(): boolean {
    return this.getStatut() === 'VALIDE_DIRECTEUR';
  }

  isValideFinal(): boolean {
    return this.getStatut() === 'VALIDE_ADMIN';
  }

  isRejected(): boolean {
    const statut = this.getStatut();
    return statut === 'REJETE_DIRECTEUR' || statut === 'REJETE_ADMIN';
  }

  isStudentOwner(): boolean {
    const user = this.authService.currentUser();
    return user?.id === this.inscription()?.doctorantId;
  }

  canDirecteurValidate(): boolean {
    const user = this.authService.currentUser();
    const ins = this.inscription();
    return (
        user?.role === Role.DIRECTEUR_THESE &&
        this.isSoumis()
    );
  }

  // ============================================
  // MÉTHODES D'AFFICHAGE
  // ============================================

  getStatusClass(): string {
    const statut = this.getStatut();
    if (statut === 'BROUILLON') return 'status-brouillon';
    if (statut === 'SOUMIS') return 'status-soumis';
    if (statut === 'VALIDE_DIRECTEUR') return 'status-valide-directeur';
    if (statut === 'VALIDE_ADMIN') return 'status-valide-admin';
    if (statut.includes('REJETE')) return 'status-rejete';
    return 'status-brouillon';
  }

  getStatusLabel(): string {
    const statut = this.getStatut();
    const labels: Record<string, string> = {
      'BROUILLON': 'Brouillon',
      'SOUMIS': 'En attente',
      'VALIDE_DIRECTEUR': 'Validé (Dir.)',
      'VALIDE_ADMIN': 'Validé ✓',
      'REJETE_DIRECTEUR': 'Rejeté',
      'REJETE_ADMIN': 'Rejeté'
    };
    return labels[statut] || statut;
  }

  getStatusIcon(): string {
    const statut = this.getStatut();
    if (statut === 'BROUILLON') return 'bi-pencil';
    if (statut === 'SOUMIS') return 'bi-hourglass-split';
    if (statut === 'VALIDE_DIRECTEUR') return 'bi-check';
    if (statut === 'VALIDE_ADMIN') return 'bi-check-all';
    if (statut.includes('REJETE')) return 'bi-x';
    return 'bi-file-earmark';
  }

  // STATUS BANNER
  getStatusBannerClass(): string {
    const statut = this.getStatut();
    if (statut === 'BROUILLON') return 'banner-brouillon';
    if (statut === 'SOUMIS') return 'banner-soumis';
    if (statut === 'VALIDE_DIRECTEUR') return 'banner-valide-directeur';
    if (statut === 'VALIDE_ADMIN') return 'banner-valide-admin';
    if (statut.includes('REJETE')) return 'banner-rejete';
    return 'banner-brouillon';
  }

  getStatusBannerIcon(): string {
    const statut = this.getStatut();
    if (statut === 'BROUILLON') return 'bi-pencil-square';
    if (statut === 'SOUMIS') return 'bi-hourglass-split';
    if (statut === 'VALIDE_DIRECTEUR') return 'bi-person-check';
    if (statut === 'VALIDE_ADMIN') return 'bi-patch-check-fill';
    if (statut.includes('REJETE')) return 'bi-x-circle';
    return 'bi-file-earmark';
  }

  getStatusBannerTitle(): string {
    const statut = this.getStatut();
    const titles: Record<string, string> = {
      'BROUILLON': 'Brouillon non soumis',
      'SOUMIS': 'En attente de validation',
      'VALIDE_DIRECTEUR': 'Validé par le Directeur',
      'VALIDE_ADMIN': 'Inscription validée',
      'REJETE_DIRECTEUR': 'Dossier rejeté par le Directeur',
      'REJETE_ADMIN': 'Dossier rejeté par l\'Administration'
    };
    return titles[statut] || 'Statut inconnu';
  }

  getStatusBannerMessage(): string {
    const statut = this.getStatut();
    const messages: Record<string, string> = {
      'BROUILLON': 'Ce dossier n\'a pas encore été soumis. Complétez-le et soumettez-le pour validation.',
      'SOUMIS': 'Votre dossier est en cours d\'examen par votre directeur de thèse. Vous serez notifié de la décision.',
      'VALIDE_DIRECTEUR': 'Votre directeur a approuvé votre dossier. Il est maintenant en attente de validation par l\'administration.',
      'VALIDE_ADMIN': 'Félicitations ! Votre inscription pour cette année universitaire est confirmée.',
      'REJETE_DIRECTEUR': 'Votre directeur a rejeté ce dossier. Consultez les commentaires ci-dessous et corrigez votre demande.',
      'REJETE_ADMIN': 'L\'administration a rejeté ce dossier. Consultez les commentaires ci-dessous pour plus d\'informations.'
    };
    return messages[statut] || '';
  }

  getAnneeThese(): string {
    const annee = this.inscription()?.anneeInscription || 1;
    if (annee === 1) return '1ère année';
    return `${annee}ème année`;
  }

  // ============================================
  // ACTIONS
  // ============================================

  soumettre(): void {
    if (!this.inscription()?.id) return;

    if (confirm('Êtes-vous sûr de vouloir soumettre ce dossier pour validation ?')) {
      this.isSubmitting.set(true);

      this.inscriptionService.soumettre(this.inscription()!.id).subscribe({
        next: (updated) => {
          this.inscription.set(updated);
          this.isSubmitting.set(false);
          alert('Votre dossier a été soumis avec succès !');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          console.error('Erreur soumission:', err);
          alert('Erreur lors de la soumission. Veuillez réessayer.');
        }
      });
    }
  }

  valider(): void {
    if (confirm('Confirmer la validation de ce dossier ?')) {
      this.inscriptionService.validerParDirecteur(this.inscription()!.id, 'Dossier approuvé').subscribe({
        next: () => {
          alert('Dossier validé avec succès !');
          this.router.navigate(['/validations']);
        },
        error: (err) => {
          console.error('Erreur validation:', err);
          alert('Erreur lors de la validation.');
        }
      });
    }
  }

  rejeter(): void {
    const motif = prompt('Veuillez indiquer le motif du rejet :');
    if (motif && motif.trim()) {
      this.inscriptionService.rejeterParDirecteur(this.inscription()!.id, motif.trim()).subscribe({
        next: () => {
          alert('Dossier rejeté.');
          this.router.navigate(['/validations']);
        },
        error: (err) => {
          console.error('Erreur rejet:', err);
          alert('Erreur lors du rejet.');
        }
      });
    }
  }

  goBack(): void {
    const user = this.authService.currentUser();
    if (user?.role === Role.DIRECTEUR_THESE) {
      this.router.navigate(['/validations']);
    } else {
      this.router.navigate(['/inscriptions']);
    }
  }
}