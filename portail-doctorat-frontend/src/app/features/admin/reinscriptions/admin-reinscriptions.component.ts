import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { InscriptionService } from '@core/services/inscription.service';
import { UserService } from '@core/services/user.service';

@Component({
    selector: 'app-admin-reinscriptions',
    standalone: true,
    imports: [CommonModule, FormsModule, MainLayoutComponent],
    template: `
    <app-main-layout>
      <div class="page-container">

        <!-- Hero Header -->
        <div class="hero-section">
          <div class="hero-content">
            <div class="hero-icon"><i class="bi bi-journal-check"></i></div>
            <div>
              <h1 class="hero-title">Gestion des Réinscriptions</h1>
              <p class="hero-subtitle">Validez les demandes de réinscription approuvées par les directeurs</p>
            </div>
          </div>
          <div class="hero-stats">
            <div class="hero-stat">
              <span class="stat-number">{{ inscriptions().length }}</span>
              <span class="stat-label">En attente</span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <button class="tab" [class.active]="activeTab() === 'reinscriptions'" (click)="activeTab.set('reinscriptions')">
            <i class="bi bi-arrow-repeat"></i>
            Réinscriptions
            @if (inscriptions().length > 0) {
              <span class="tab-badge">{{ inscriptions().length }}</span>
            }
          </button>
          <button class="tab" [class.active]="activeTab() === 'premieres'" (click)="switchToPremieres()">
            <i class="bi bi-person-plus"></i>
            Premières Inscriptions
            @if (premieresInscriptions().length > 0) {
              <span class="tab-badge">{{ premieresInscriptions().length }}</span>
            }
          </button>
        </div>

        <!-- Info Banner -->
        <div class="info-banner">
          <div class="info-icon"><i class="bi bi-info-circle"></i></div>
          <div class="info-content">
            @if (activeTab() === 'reinscriptions') {
              <strong>Réinscriptions validées par les directeurs</strong>
              <p>Ces demandes ont été approuvées par les directeurs de thèse et attendent votre validation finale pour confirmer la réinscription.</p>
            } @else {
              <strong>Premières inscriptions</strong>
              <p>Ces candidats ont été acceptés et attendent la validation de leur première inscription au doctorat.</p>
            }
          </div>
        </div>

        <!-- Loading -->
        @if (isLoading()) {
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <span>Chargement des demandes...</span>
          </div>
        }

        <!-- Empty State -->
        @if (!isLoading() && getCurrentList().length === 0) {
          <div class="empty-state">
            <div class="empty-icon"><i class="bi bi-inbox"></i></div>
            <h3>Aucune demande en attente</h3>
            <p>{{ activeTab() === 'reinscriptions' ? 'Aucune réinscription à valider pour le moment.' : 'Aucune première inscription à traiter.' }}</p>
          </div>
        }

        <!-- Liste des demandes -->
        @if (!isLoading() && getCurrentList().length > 0) {
          <div class="inscriptions-list">
            @for (inscription of getCurrentList(); track inscription.id) {
              <div class="inscription-card">
                <div class="card-header">
                  <div class="doctorant-info">
                    <div class="avatar">{{ getInitials(inscription) }}</div>
                    <div class="info">
                      <h4>{{ getDoctorantName(inscription) }}</h4>
                      <span class="matricule">{{ inscription.doctorant?.username || 'N/A' }}</span>
                    </div>
                  </div>
                  <div class="card-badges">
                    <span class="badge type" [class.reinscription]="inscription.typeInscription === 'REINSCRIPTION'">
                      {{ inscription.typeInscription === 'REINSCRIPTION' ? 'Réinscription' : '1ère inscription' }}
                    </span>
                    @if (inscription.anneeInscription) {
                      <span class="badge year">{{ inscription.anneeInscription }}ème année</span>
                    }
                    <span class="badge status pending">En attente Admin</span>
                  </div>
                </div>

                <div class="card-body">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label"><i class="bi bi-journal-text"></i> Sujet de thèse</span>
                      <span class="value">{{ inscription.sujetThese || 'Non défini' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label"><i class="bi bi-building"></i> Laboratoire</span>
                      <span class="value">{{ inscription.laboratoireAccueil || 'Non défini' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label"><i class="bi bi-person-badge"></i> Directeur</span>
                      <span class="value">{{ getDirecteurName(inscription) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label"><i class="bi bi-calendar3"></i> Date de soumission</span>
                      <span class="value">{{ inscription.createdAt | date:'dd MMM yyyy' }}</span>
                    </div>
                  </div>

                  <!-- Commentaire du directeur si réinscription -->
                  @if (inscription.commentaireDirecteur) {
                    <div class="directeur-comment">
                      <i class="bi bi-chat-left-quote"></i>
                      <div>
                        <span class="comment-label">Commentaire du directeur</span>
                        <p>{{ inscription.commentaireDirecteur }}</p>
                      </div>
                    </div>
                  }

                  <!-- Prérequis du doctorant -->
                  @if (inscription.doctorant && inscription.typeInscription === 'REINSCRIPTION') {
                    <div class="prereq-section">
                      <h5><i class="bi bi-list-check"></i> Prérequis du doctorant</h5>
                      <div class="prereq-grid">
                        <div class="prereq-item" [class.complete]="(inscription.doctorant.nbPublications || 0) >= 2">
                          <span class="prereq-label">Publications</span>
                          <span class="prereq-value">{{ inscription.doctorant.nbPublications || 0 }}/2</span>
                        </div>
                        <div class="prereq-item" [class.complete]="(inscription.doctorant.nbConferences || 0) >= 2">
                          <span class="prereq-label">Conférences</span>
                          <span class="prereq-value">{{ inscription.doctorant.nbConferences || 0 }}/2</span>
                        </div>
                        <div class="prereq-item" [class.complete]="(inscription.doctorant.heuresFormation || 0) >= 200">
                          <span class="prereq-label">Formation</span>
                          <span class="prereq-value">{{ inscription.doctorant.heuresFormation || 0 }}/200h</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <div class="card-actions">
                  <div class="comment-input">
                    <input type="text" [(ngModel)]="commentaires[inscription.id]" 
                           placeholder="Ajouter un commentaire (optionnel)">
                  </div>
                  <div class="action-buttons">
                    <button class="btn-reject" (click)="rejeter(inscription)" [disabled]="isProcessing()">
                      <i class="bi bi-x-lg"></i> Rejeter
                    </button>
                    <button class="btn-approve" (click)="valider(inscription)" [disabled]="isProcessing()">
                      @if (isProcessing()) {
                        <span class="spinner"></span>
                      } @else {
                        <i class="bi bi-check-lg"></i>
                      }
                      Valider
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Toast -->
        @if (toast().show) {
          <div class="toast" [class.success]="toast().type === 'success'" [class.error]="toast().type === 'error'">
            <i class="bi" [class.bi-check-circle-fill]="toast().type === 'success'" [class.bi-x-circle-fill]="toast().type === 'error'"></i>
            {{ toast().message }}
          </div>
        }

      </div>
    </app-main-layout>
  `,
    styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem 3rem; }
    
    .hero-section { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 24px; padding: 2rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
    .hero-content { display: flex; align-items: center; gap: 1.25rem; }
    .hero-icon { width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; color: white; }
    .hero-title { color: white; font-size: 1.6rem; font-weight: 800; margin: 0; }
    .hero-subtitle { color: rgba(255,255,255,0.9); margin: 0.25rem 0 0; }
    .hero-stats { display: flex; gap: 1.5rem; }
    .hero-stat { text-align: center; padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.15); border-radius: 12px; }
    .stat-number { display: block; font-size: 2rem; font-weight: 800; color: white; }
    .stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.8); }

    .tabs-container { display: flex; gap: 0.5rem; padding: 0.5rem; background: white; border-radius: 16px; margin-bottom: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem 1rem; border: none; background: transparent; border-radius: 12px; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
    .tab:hover { background: #f8fafc; }
    .tab.active { background: #3b82f6; color: white; }
    .tab-badge { padding: 0.15rem 0.5rem; background: #ef4444; color: white; border-radius: 50px; font-size: 0.75rem; }
    .tab.active .tab-badge { background: white; color: #3b82f6; }

    .info-banner { display: flex; gap: 1rem; padding: 1.25rem; background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1px solid #93c5fd; border-radius: 16px; margin-bottom: 1.5rem; }
    .info-icon { width: 44px; height: 44px; background: #3b82f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; }
    .info-content { color: #1e40af; }
    .info-content strong { display: block; margin-bottom: 0.25rem; }
    .info-content p { margin: 0; font-size: 0.875rem; }

    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; color: #64748b; gap: 1rem; }
    .loading-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 4rem 2rem; background: white; border-radius: 20px; border: 1px solid #e2e8f0; }
    .empty-icon { width: 80px; height: 80px; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
    .empty-icon i { font-size: 2.5rem; color: #3b82f6; }
    .empty-state h3 { margin: 0 0 0.5rem; color: #1e293b; }
    .empty-state p { margin: 0; color: #64748b; }

    .inscriptions-list { display: flex; flex-direction: column; gap: 1.25rem; }

    .inscription-card { background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; overflow: hidden; }

    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; gap: 1rem; }
    .doctorant-info { display: flex; align-items: center; gap: 1rem; }
    .avatar { width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.1rem; }
    .doctorant-info .info h4 { margin: 0; font-size: 1.1rem; color: #1e293b; }
    .matricule { font-size: 0.85rem; color: #64748b; font-family: monospace; }
    .card-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .badge { padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; }
    .badge.type { background: #f1f5f9; color: #475569; }
    .badge.type.reinscription { background: #f3e8ff; color: #7c3aed; }
    .badge.year { background: #dbeafe; color: #2563eb; }
    .badge.status.pending { background: #fef3c7; color: #b45309; }

    .card-body { padding: 1.5rem; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .info-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .info-item .label { font-size: 0.75rem; color: #64748b; display: flex; align-items: center; gap: 0.35rem; }
    .info-item .value { font-size: 0.95rem; font-weight: 500; color: #1e293b; }

    .directeur-comment { display: flex; gap: 0.75rem; margin-top: 1.5rem; padding: 1rem; background: #f0fdf4; border-radius: 12px; border-left: 4px solid #22c55e; }
    .directeur-comment i { color: #22c55e; font-size: 1.25rem; flex-shrink: 0; }
    .comment-label { display: block; font-size: 0.75rem; color: #166534; font-weight: 600; margin-bottom: 0.25rem; }
    .directeur-comment p { margin: 0; color: #166534; font-size: 0.9rem; }

    .prereq-section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; }
    .prereq-section h5 { margin: 0 0 1rem; font-size: 0.9rem; color: #475569; display: flex; align-items: center; gap: 0.5rem; }
    .prereq-grid { display: flex; gap: 1rem; }
    .prereq-item { flex: 1; padding: 0.75rem 1rem; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; text-align: center; }
    .prereq-item.complete { background: #f0fdf4; border-color: #86efac; }
    .prereq-label { display: block; font-size: 0.75rem; color: #64748b; margin-bottom: 0.25rem; }
    .prereq-value { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
    .prereq-item.complete .prereq-value { color: #16a34a; }

    .card-actions { display: flex; flex-direction: column; gap: 1rem; padding: 1.25rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    .comment-input input { width: 100%; padding: 0.75rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; outline: none; }
    .comment-input input:focus { border-color: #3b82f6; }
    .action-buttons { display: flex; gap: 0.75rem; }
    .btn-reject, .btn-approve { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem 1.25rem; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-reject { background: #fee2e2; color: #dc2626; }
    .btn-reject:hover { background: #fecaca; }
    .btn-approve { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; box-shadow: 0 4px 15px rgba(34,197,94,0.35); }
    .btn-approve:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(34,197,94,0.45); }
    .btn-approve:disabled, .btn-reject:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }

    .toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 0.75rem; font-weight: 500; box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 1000; }
    .toast.success { background: #22c55e; color: white; }
    .toast.error { background: #ef4444; color: white; }

    @media (max-width: 768px) {
      .hero-section { flex-direction: column; gap: 1.5rem; text-align: center; }
      .hero-content { flex-direction: column; }
      .info-grid { grid-template-columns: 1fr; }
      .prereq-grid { flex-direction: column; }
      .action-buttons { flex-direction: column; }
      .tabs-container { flex-direction: column; }
    }
  `]
})
export class AdminReinscriptionsComponent implements OnInit {
    inscriptions = signal<any[]>([]);
    premieresInscriptions = signal<any[]>([]);
    activeTab = signal<'reinscriptions' | 'premieres'>('reinscriptions');
    isLoading = signal(true);
    isProcessing = signal(false);
    commentaires: { [key: number]: string } = {};
    toast = signal<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});

    constructor(
        private inscriptionService: InscriptionService,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading.set(true);

        // Charger les réinscriptions en attente admin
        this.inscriptionService.getReinscritionsEnAttenteAdmin().subscribe({
            next: (data) => this.enrichWithUserInfo(data, 'reinscriptions'),
            error: (err) => {
                console.error('Erreur:', err);
                this.isLoading.set(false);
            }
        });
    }

    switchToPremieres(): void {
        this.activeTab.set('premieres');
        if (this.premieresInscriptions().length === 0) {
            this.isLoading.set(true);
            this.inscriptionService.getPremieresInscriptionsEnAttenteAdmin().subscribe({
                next: (data) => this.enrichWithUserInfo(data, 'premieres'),
                error: (err) => {
                    console.error('Erreur:', err);
                    this.isLoading.set(false);
                }
            });
        }
    }

    enrichWithUserInfo(inscriptions: any[], type: 'reinscriptions' | 'premieres'): void {
        if (inscriptions.length === 0) {
            if (type === 'reinscriptions') {
                this.inscriptions.set([]);
            } else {
                this.premieresInscriptions.set([]);
            }
            this.isLoading.set(false);
            return;
        }

        let loaded = 0;
        inscriptions.forEach(inscription => {
            // Charger info doctorant
            if (inscription.doctorantId) {
                this.userService.getUserById(inscription.doctorantId).subscribe({
                    next: (user) => {
                        inscription.doctorant = user;
                        this.checkLoaded(++loaded, inscriptions.length, inscriptions, type);
                    },
                    error: () => this.checkLoaded(++loaded, inscriptions.length, inscriptions, type)
                });
            }

            // Charger info directeur
            if (inscription.directeurId) {
                this.userService.getUserById(inscription.directeurId).subscribe({
                    next: (user) => inscription.directeur = user,
                    error: () => {}
                });
            }
        });
    }

    checkLoaded(loaded: number, total: number, inscriptions: any[], type: 'reinscriptions' | 'premieres'): void {
        if (loaded === total) {
            if (type === 'reinscriptions') {
                this.inscriptions.set(inscriptions);
            } else {
                this.premieresInscriptions.set(inscriptions);
            }
            this.isLoading.set(false);
        }
    }

    getCurrentList(): any[] {
        return this.activeTab() === 'reinscriptions' ? this.inscriptions() : this.premieresInscriptions();
    }

    getDoctorantName(inscription: any): string {
        if (inscription.doctorant) {
            return `${inscription.doctorant.prenom || ''} ${inscription.doctorant.nom || ''}`.trim() || 'Doctorant';
        }
        return 'Doctorant';
    }

    getDirecteurName(inscription: any): string {
        if (inscription.directeur) {
            return `${inscription.directeur.prenom || ''} ${inscription.directeur.nom || ''}`.trim();
        }
        return inscription.directeurId ? `ID: ${inscription.directeurId}` : 'Non assigné';
    }

    getInitials(inscription: any): string {
        if (inscription.doctorant) {
            return ((inscription.doctorant.prenom?.charAt(0) || '') + (inscription.doctorant.nom?.charAt(0) || '')).toUpperCase() || '?';
        }
        return '?';
    }

    valider(inscription: any): void {
        this.isProcessing.set(true);
        const commentaire = this.commentaires[inscription.id] || '';

        this.inscriptionService.validerParAdmin(inscription.id, commentaire).subscribe({
            next: () => {
                this.showToast('Inscription validée avec succès', 'success');
                this.isProcessing.set(false);
                this.loadData();
            },
            error: (err) => {
                console.error('Erreur:', err);
                this.showToast('Erreur lors de la validation', 'error');
                this.isProcessing.set(false);
            }
        });
    }

    rejeter(inscription: any): void {
        const motif = this.commentaires[inscription.id];
        if (!motif || motif.trim() === '') {
            this.showToast('Veuillez indiquer un motif de refus', 'error');
            return;
        }

        if (!confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) return;

        this.isProcessing.set(true);

        this.inscriptionService.rejeterParAdmin(inscription.id, motif).subscribe({
            next: () => {
                this.showToast('Demande rejetée', 'success');
                this.isProcessing.set(false);
                this.loadData();
            },
            error: (err) => {
                console.error('Erreur:', err);
                this.showToast('Erreur lors du rejet', 'error');
                this.isProcessing.set(false);
            }
        });
    }

    showToast(message: string, type: 'success' | 'error'): void {
        this.toast.set({show: true, message, type});
        setTimeout(() => this.toast.set({show: false, message: '', type: 'success'}), 4000);
    }
}