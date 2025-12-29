import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { AuthService } from '@core/services/auth.service';
import { DerogationService } from '@core/services/derogation.service';
import { Derogation, StatutDerogation, TypeDerogation } from '@core/models/derogation.model';

@Component({
    selector: 'app-director-derogations',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, MainLayoutComponent],
    template: `
    <app-main-layout>
      <div class="page-container">

        <!-- Hero Header -->
        <div class="hero-section">
          <div class="hero-content">
            <a routerLink="/dashboard" class="back-btn"><i class="bi bi-arrow-left"></i></a>
            <div class="hero-icon"><i class="bi bi-clock-history"></i></div>
            <div>
              <h1 class="hero-title">Demandes de Dérogation</h1>
              <p class="hero-subtitle">Validez les demandes de prolongation de vos doctorants</p>
            </div>
          </div>
          <button class="btn-refresh" (click)="loadDerogations()" [disabled]="isLoading()">
            @if (isLoading()) {
              <span class="spinner"></span>
            } @else {
              <i class="bi bi-arrow-clockwise"></i>
            }
            Actualiser
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card orange">
            <div class="stat-icon"><i class="bi bi-hourglass-split"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ getEnAttenteCount() }}</span>
              <span class="stat-label">À traiter</span>
            </div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon"><i class="bi bi-check-circle"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ getValidesCount() }}</span>
              <span class="stat-label">Validées</span>
            </div>
          </div>
          <div class="stat-card red">
            <div class="stat-icon"><i class="bi bi-x-circle"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ getRefuseesCount() }}</span>
              <span class="stat-label">Refusées</span>
            </div>
          </div>
          <div class="stat-card purple">
            <div class="stat-icon"><i class="bi bi-collection"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ derogations().length }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
        </div>

        <!-- Info Banner -->
        <div class="info-banner">
          <i class="bi bi-info-circle"></i>
          <div>
            <strong>Votre rôle</strong>
            <p>En tant que directeur de thèse, vous devez examiner et valider les demandes de dérogation de vos doctorants avant qu'elles ne soient transmises à l'administration pour décision finale.</p>
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
        @if (!isLoading() && derogations().length === 0) {
          <div class="empty-state">
            <div class="empty-icon"><i class="bi bi-inbox"></i></div>
            <h3>Aucune demande de dérogation</h3>
            <p>Vos doctorants n'ont pas encore soumis de demande de dérogation.</p>
          </div>
        }

        <!-- Liste des dérogations -->
        @if (!isLoading() && derogations().length > 0) {
          
          <!-- Demandes en attente -->
          @if (getDerogationsEnAttente().length > 0) {
            <div class="section-card">
              <div class="section-header pending">
                <div class="section-icon"><i class="bi bi-hourglass-split"></i></div>
                <h3>Demandes en attente de votre validation</h3>
                <span class="section-badge">{{ getDerogationsEnAttente().length }}</span>
              </div>
              <div class="derogation-list">
                @for (derog of getDerogationsEnAttente(); track derog.id) {
                  <div class="derogation-card pending" [class.expanded]="expandedId() === derog.id">
                    <div class="card-main" (click)="toggleExpand(derog.id)">
                      <div class="card-left">
                        <div class="doctorant-avatar">
                          {{ getInitials(derog) }}
                        </div>
                      </div>
                      <div class="card-content">
                        <div class="card-header-row">
                          <div class="doctorant-info">
                            <span class="doctorant-name">{{ derog.doctorantPrenom || '' }} {{ derog.doctorantNom || 'Doctorant #' + derog.doctorantId }}</span>
                            <span class="doctorant-email">{{ derog.doctorantEmail || 'Email non disponible' }}</span>
                          </div>
                          <span class="type-badge" [class]="getTypeBadgeClass(derog.typeDerogation)">
                            {{ formatType(derog.typeDerogation) }}
                          </span>
                        </div>
                        <p class="derogation-motif">{{ derog.motif }}</p>
                        <div class="card-meta">
                          <span class="meta-item">
                            <i class="bi bi-calendar3"></i>
                            Demandé le {{ derog.dateDemande | date:'dd/MM/yyyy' }}
                          </span>
                          <span class="meta-item">
                            <i class="bi bi-hash"></i>
                            Dossier #{{ derog.id }}
                          </span>
                        </div>
                      </div>
                      <div class="card-right">
                        <i class="bi bi-chevron-down expand-icon" [class.rotated]="expandedId() === derog.id"></i>
                      </div>
                    </div>

                    <!-- Expanded Actions -->
                    @if (expandedId() === derog.id) {
                      <div class="card-actions" (click)="$event.stopPropagation()">
                        <div class="motif-full">
                          <label>Motif complet de la demande :</label>
                          <p>{{ derog.motif }}</p>
                        </div>
                        
                        <div class="comment-section">
                          <label for="comment-{{ derog.id }}">
                            <i class="bi bi-chat-left-text"></i>
                            Votre commentaire (optionnel pour validation, obligatoire pour refus)
                          </label>
                          <textarea 
                            [id]="'comment-' + derog.id"
                            [(ngModel)]="commentaires[derog.id]"
                            placeholder="Ajoutez un commentaire..."
                            rows="3">
                          </textarea>
                        </div>

                        <div class="action-buttons">
                          <button class="btn-refuse" (click)="refuser(derog)" [disabled]="isProcessing()">
                            <i class="bi bi-x-lg"></i>
                            Refuser
                          </button>
                          <button class="btn-validate" (click)="valider(derog)" [disabled]="isProcessing()">
                            @if (isProcessing()) {
                              <span class="spinner-small"></span>
                            } @else {
                              <i class="bi bi-check-lg"></i>
                            }
                            Valider et transmettre
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

          <!-- Demandes traitées -->
          @if (getDerogationsTraitees().length > 0) {
            <div class="section-card">
              <div class="section-header history">
                <div class="section-icon"><i class="bi bi-clock-history"></i></div>
                <h3>Historique des demandes traitées</h3>
              </div>
              <div class="derogation-list">
                @for (derog of getDerogationsTraitees(); track derog.id) {
                  <div class="derogation-card" [class]="getCardClass(derog)" (click)="toggleExpand(derog.id)">
                    <div class="card-main">
                      <div class="card-left">
                        <div class="doctorant-avatar small">
                          {{ getInitials(derog) }}
                        </div>
                      </div>
                      <div class="card-content">
                        <div class="card-header-row">
                          <div class="doctorant-info">
                            <span class="doctorant-name">{{ derog.doctorantPrenom || '' }} {{ derog.doctorantNom || 'Doctorant #' + derog.doctorantId }}</span>
                          </div>
                          <div class="status-badges">
                            <span class="type-badge small" [class]="getTypeBadgeClass(derog.typeDerogation)">
                              {{ formatType(derog.typeDerogation) }}
                            </span>
                            <span class="status-badge" [class]="getStatusBadgeClass(derog.statut)">
                              <i class="bi" [class]="getStatusIcon(derog.statut)"></i>
                              {{ getStatusLabel(derog.statut) }}
                            </span>
                          </div>
                        </div>
                        <div class="card-meta">
                          <span class="meta-item">
                            <i class="bi bi-calendar3"></i>
                            {{ derog.dateDemande | date:'dd/MM/yyyy' }}
                          </span>
                          @if (derog.dateValidationDirecteur) {
                            <span class="meta-item">
                              <i class="bi bi-check2"></i>
                              Traité le {{ derog.dateValidationDirecteur | date:'dd/MM/yyyy' }}
                            </span>
                          }
                        </div>
                      </div>
                      <div class="card-right">
                        <i class="bi bi-chevron-down expand-icon" [class.rotated]="expandedId() === derog.id"></i>
                      </div>
                    </div>

                    @if (expandedId() === derog.id) {
                      <div class="card-details" (click)="$event.stopPropagation()">
                        <div class="detail-row">
                          <label>Motif de la demande</label>
                          <p>{{ derog.motif }}</p>
                        </div>
                        @if (derog.commentaireDirecteur) {
                          <div class="detail-row">
                            <label>Votre commentaire</label>
                            <p class="comment">« {{ derog.commentaireDirecteur }} »</p>
                          </div>
                        }
                        @if (derog.statut === 'APPROUVEE' || derog.statut === 'REFUSEE') {
                          <div class="detail-row">
                            <label>Décision finale (Admin)</label>
                            <p class="admin-decision" [class]="derog.statut === 'APPROUVEE' ? 'success' : 'danger'">
                              <i class="bi" [class]="derog.statut === 'APPROUVEE' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                              {{ derog.statut === 'APPROUVEE' ? 'Approuvée' : 'Refusée' }}
                              @if (derog.commentaireDecision) {
                                - {{ derog.commentaireDecision }}
                              }
                            </p>
                          </div>
                        }
                        @if (derog.statut === 'EN_ATTENTE_ADMIN') {
                          <div class="waiting-admin">
                            <i class="bi bi-hourglass-split"></i>
                            <span>En attente de la décision de l'administration</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        }

        <!-- Toast -->
        @if (toastMessage()) {
          <div class="toast" [class]="toastType()">
            <i class="bi" [class]="toastType() === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
            {{ toastMessage() }}
          </div>
        }

      </div>
    </app-main-layout>
  `,
    styles: [`
    .page-container { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem 3rem; }

    /* Hero */
    .hero-section { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 24px; padding: 2rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; }
    .hero-content { display: flex; align-items: center; gap: 1rem; color: white; }
    .back-btn { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none; transition: all 0.2s; }
    .back-btn:hover { background: rgba(255,255,255,0.3); }
    .hero-icon { width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .hero-title { margin: 0; font-size: 1.5rem; font-weight: 800; }
    .hero-subtitle { margin: 0.25rem 0 0; opacity: 0.9; font-size: 0.95rem; }
    .btn-refresh { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: white; color: #d97706; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-refresh:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .btn-refresh:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
    .spinner { width: 16px; height: 16px; border: 2px solid #fef3c7; border-top-color: #d97706; border-radius: 50%; animation: spin 0.8s linear infinite; }

    /* Stats */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: white; border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; }
    .stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
    .stat-card.orange .stat-icon { background: #fff7ed; color: #ea580c; }
    .stat-card.green .stat-icon { background: #ecfdf5; color: #16a34a; }
    .stat-card.red .stat-icon { background: #fef2f2; color: #dc2626; }
    .stat-card.purple .stat-icon { background: #f3e8ff; color: #9333ea; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; display: block; }
    .stat-label { font-size: 0.8rem; color: #64748b; }

    /* Info Banner */
    .info-banner { display: flex; gap: 1rem; padding: 1rem 1.25rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; margin-bottom: 1.5rem; color: #1e40af; }
    .info-banner > i { font-size: 1.25rem; flex-shrink: 0; }
    .info-banner strong { display: block; margin-bottom: 0.2rem; }
    .info-banner p { margin: 0; font-size: 0.875rem; }

    /* Loading & Empty */
    .loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; color: #64748b; gap: 1rem; background: white; border-radius: 20px; border: 1px solid #e2e8f0; }
    .loading-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #f59e0b; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .empty-icon { width: 80px; height: 80px; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .empty-icon i { font-size: 2rem; color: #f59e0b; }
    .empty-state h3 { margin: 0; color: #1e293b; }
    .empty-state p { margin: 0; }

    /* Section Card */
    .section-card { background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 1.5rem; }
    .section-header { display: flex; align-items: center; gap: 0.75rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
    .section-header.pending { background: linear-gradient(135deg, #fff7ed, #ffedd5); }
    .section-header.history { background: #f8fafc; }
    .section-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
    .section-header.pending .section-icon { background: #f59e0b; color: white; }
    .section-header.history .section-icon { background: #e2e8f0; color: #64748b; }
    .section-header h3 { margin: 0; font-size: 1rem; font-weight: 700; color: #1e293b; flex: 1; }
    .section-badge { background: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.85rem; font-weight: 700; }

    /* Derogation List */
    .derogation-list { padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .derogation-card { background: #f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; transition: all 0.2s; }
    .derogation-card:hover { border-color: #cbd5e1; }
    .derogation-card.pending { border-left: 4px solid #f59e0b; }
    .derogation-card.pending.expanded { border-color: #f59e0b; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15); }
    .derogation-card.validated { border-left: 4px solid #22c55e; }
    .derogation-card.refused { border-left: 4px solid #ef4444; }
    .derogation-card.waiting { border-left: 4px solid #3b82f6; }

    .card-main { display: flex; align-items: center; padding: 1.25rem; cursor: pointer; }
    .card-left { margin-right: 1rem; }
    .doctorant-avatar { width: 50px; height: 50px; border-radius: 12px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; }
    .doctorant-avatar.small { width: 40px; height: 40px; font-size: 0.9rem; }
    .card-content { flex: 1; min-width: 0; }
    .card-header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.5rem; }
    .doctorant-info { display: flex; flex-direction: column; }
    .doctorant-name { font-weight: 700; color: #1e293b; font-size: 1rem; }
    .doctorant-email { font-size: 0.8rem; color: #64748b; }
    .derogation-motif { color: #475569; font-size: 0.9rem; line-height: 1.5; margin: 0 0 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-meta { display: flex; gap: 1rem; flex-wrap: wrap; }
    .meta-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: #64748b; }
    .card-right { margin-left: 1rem; }
    .expand-icon { color: #94a3b8; font-size: 1.25rem; transition: transform 0.3s; }
    .expand-icon.rotated { transform: rotate(180deg); }

    /* Type Badge */
    .type-badge { padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; white-space: nowrap; }
    .type-badge.small { padding: 0.25rem 0.5rem; font-size: 0.7rem; }
    .type-badge.year4 { background: #fef3c7; color: #b45309; }
    .type-badge.year5 { background: #ffedd5; color: #c2410c; }
    .type-badge.year6 { background: #fee2e2; color: #dc2626; }
    .type-badge.other { background: #e0e7ff; color: #4338ca; }

    /* Status Badge */
    .status-badges { display: flex; gap: 0.5rem; align-items: center; }
    .status-badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; }
    .status-badge.pending { background: #fef3c7; color: #b45309; }
    .status-badge.success { background: #dcfce7; color: #15803d; }
    .status-badge.danger { background: #fee2e2; color: #dc2626; }
    .status-badge.info { background: #dbeafe; color: #1d4ed8; }

    /* Card Actions (Expanded) */
    .card-actions { background: white; border-top: 1px solid #e2e8f0; padding: 1.5rem; animation: slideDown 0.3s ease-out; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .motif-full { margin-bottom: 1.25rem; }
    .motif-full label { display: block; font-size: 0.8rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase; }
    .motif-full p { margin: 0; padding: 1rem; background: #f8fafc; border-radius: 10px; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; }
    .comment-section { margin-bottom: 1.5rem; }
    .comment-section label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
    .comment-section label i { color: #f59e0b; }
    .comment-section textarea { width: 100%; padding: 0.875rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; resize: vertical; transition: all 0.2s; }
    .comment-section textarea:focus { outline: none; border-color: #f59e0b; box-shadow: 0 0 0 4px rgba(245,158,11,0.1); }
    .action-buttons { display: flex; gap: 1rem; }
    .btn-refuse { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem 1.5rem; background: white; border: 2px solid #fecaca; color: #dc2626; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-refuse:hover { background: #fef2f2; border-color: #f87171; }
    .btn-refuse:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-validate { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem 1.5rem; background: linear-gradient(135deg, #22c55e, #16a34a); border: none; color: white; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(34,197,94,0.3); }
    .btn-validate:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(34,197,94,0.4); }
    .btn-validate:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .spinner-small { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }

    /* Card Details (History) */
    .card-details { background: white; border-top: 1px solid #e2e8f0; padding: 1.25rem; }
    .detail-row { margin-bottom: 1rem; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-row label { display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 0.35rem; }
    .detail-row p { margin: 0; color: #1e293b; font-size: 0.9rem; }
    .detail-row .comment { font-style: italic; color: #475569; padding: 0.75rem; background: #fef3c7; border-radius: 8px; }
    .admin-decision { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; border-radius: 8px; font-weight: 600; }
    .admin-decision.success { background: #dcfce7; color: #15803d; }
    .admin-decision.danger { background: #fee2e2; color: #dc2626; }
    .waiting-admin { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1rem; background: #dbeafe; border-radius: 10px; color: #1d4ed8; font-weight: 500; }

    /* Toast */
    .toast { position: fixed; bottom: 2rem; right: 2rem; display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; border-radius: 12px; font-weight: 600; box-shadow: 0 10px 40px rgba(0,0,0,0.2); animation: slideIn 0.3s ease-out; z-index: 1000; }
    .toast.success { background: #22c55e; color: white; }
    .toast.error { background: #ef4444; color: white; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .hero-section { flex-direction: column; gap: 1.5rem; text-align: center; }
      .hero-content { flex-direction: column; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .action-buttons { flex-direction: column; }
      .card-header-row { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class DirectorDerogationsComponent implements OnInit {
    derogations = signal<Derogation[]>([]);
    isLoading = signal(true);
    isProcessing = signal(false);
    expandedId = signal<number | null>(null);

    toastMessage = signal('');
    toastType = signal<'success' | 'error'>('success');

    commentaires: { [key: number]: string } = {};

    constructor(
        private authService: AuthService,
        private derogationService: DerogationService
    ) {}

    ngOnInit(): void {
        this.loadDerogations();
    }

    loadDerogations(): void {
        const directeurId = this.authService.currentUser()?.id;
        if (!directeurId) {
            this.isLoading.set(false);
            return;
        }

        this.isLoading.set(true);
        this.derogationService.getDerogationsDirecteur(directeurId).subscribe({
            next: (data) => {
                this.derogations.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erreur chargement dérogations:', err);
                this.isLoading.set(false);
                this.showToast('Erreur lors du chargement des demandes', 'error');
            }
        });
    }

    toggleExpand(id: number): void {
        this.expandedId.set(this.expandedId() === id ? null : id);
    }

    getDerogationsEnAttente(): Derogation[] {
        return this.derogations().filter(d =>
            d.statut === 'EN_ATTENTE_DIRECTEUR' || d.statut === 'EN_ATTENTE'
        );
    }

    getDerogationsTraitees(): Derogation[] {
        return this.derogations().filter(d =>
            d.statut !== 'EN_ATTENTE_DIRECTEUR' && d.statut !== 'EN_ATTENTE'
        );
    }

    getEnAttenteCount(): number {
        return this.getDerogationsEnAttente().length;
    }

    getValidesCount(): number {
        return this.derogations().filter(d =>
            d.statut === 'EN_ATTENTE_ADMIN' || d.statut === 'APPROUVEE'
        ).length;
    }

    getRefuseesCount(): number {
        return this.derogations().filter(d => d.statut === 'REFUSEE').length;
    }

    getInitials(derog: Derogation): string {
        const prenom = derog.doctorantPrenom || '';
        const nom = derog.doctorantNom || '';
        if (prenom || nom) {
            return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
        }
        return '?';
    }

    formatType(type: TypeDerogation): string {
        const types: Record<string, string> = {
            'PROLONGATION_4EME_ANNEE': '4ème Année',
            'PROLONGATION_5EME_ANNEE': '5ème Année',
            'PROLONGATION_6EME_ANNEE': '6ème Année',
            'SUSPENSION_TEMPORAIRE': 'Suspension',
            'AUTRE': 'Autre'
        };
        return types[type] || type;
    }

    getTypeBadgeClass(type: TypeDerogation): string {
        const classes: Record<string, string> = {
            'PROLONGATION_4EME_ANNEE': 'year4',
            'PROLONGATION_5EME_ANNEE': 'year5',
            'PROLONGATION_6EME_ANNEE': 'year6'
        };
        return classes[type] || 'other';
    }

    getCardClass(derog: Derogation): string {
        if (derog.statut === 'EN_ATTENTE_ADMIN') return 'waiting';
        if (derog.statut === 'APPROUVEE') return 'validated';
        if (derog.statut === 'REFUSEE') return 'refused';
        return '';
    }

    getStatusBadgeClass(statut: StatutDerogation): string {
        const classes: Record<string, string> = {
            'EN_ATTENTE_ADMIN': 'info',
            'APPROUVEE': 'success',
            'REFUSEE': 'danger'
        };
        return classes[statut] || 'pending';
    }

    getStatusIcon(statut: StatutDerogation): string {
        const icons: Record<string, string> = {
            'EN_ATTENTE_ADMIN': 'bi-hourglass-split',
            'APPROUVEE': 'bi-check-circle-fill',
            'REFUSEE': 'bi-x-circle-fill'
        };
        return icons[statut] || 'bi-circle';
    }

    getStatusLabel(statut: StatutDerogation): string {
        const labels: Record<string, string> = {
            'EN_ATTENTE_ADMIN': 'Chez Admin',
            'APPROUVEE': 'Approuvée',
            'REFUSEE': 'Refusée'
        };
        return labels[statut] || statut;
    }

    valider(derog: Derogation): void {
        const directeurId = this.authService.currentUser()?.id;
        if (!directeurId) return;

        this.isProcessing.set(true);
        const commentaire = this.commentaires[derog.id] || '';

        this.derogationService.validerParDirecteur(derog.id, directeurId, commentaire).subscribe({
            next: () => {
                this.showToast('Demande validée et transmise à l\'administration', 'success');
                this.expandedId.set(null);
                this.loadDerogations();
                this.isProcessing.set(false);
            },
            error: (err) => {
                console.error('Erreur validation:', err);
                this.showToast(err.error?.error || 'Erreur lors de la validation', 'error');
                this.isProcessing.set(false);
            }
        });
    }

    refuser(derog: Derogation): void {
        const directeurId = this.authService.currentUser()?.id;
        if (!directeurId) return;

        const commentaire = this.commentaires[derog.id];
        if (!commentaire || commentaire.trim() === '') {
            this.showToast('Veuillez indiquer un motif de refus', 'error');
            return;
        }

        if (!confirm('Êtes-vous sûr de vouloir refuser cette demande ?')) {
            return;
        }

        this.isProcessing.set(true);

        this.derogationService.refuserParDirecteur(derog.id, directeurId, commentaire).subscribe({
            next: () => {
                this.showToast('Demande refusée', 'success');
                this.expandedId.set(null);
                this.loadDerogations();
                this.isProcessing.set(false);
            },
            error: (err) => {
                console.error('Erreur refus:', err);
                this.showToast(err.error?.error || 'Erreur lors du refus', 'error');
                this.isProcessing.set(false);
            }
        });
    }

    private showToast(message: string, type: 'success' | 'error'): void {
        this.toastMessage.set(message);
        this.toastType.set(type);
        setTimeout(() => this.toastMessage.set(''), 4000);
    }
}