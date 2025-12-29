import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DerogationService } from '@core/services/derogation.service';
import { AuthService } from '@core/services/auth.service';
import { Derogation, StatutDerogation } from '@core/models/derogation.model';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';

@Component({
  selector: 'app-derogation-management',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent, FormsModule],
  template: `
    <app-main-layout>
      <div class="page-container">

        <!-- Hero Header -->
        <div class="hero-section">
          <div class="hero-content">
            <div class="hero-icon"><i class="bi bi-clock-history"></i></div>
            <div>
              <h1 class="hero-title">Gestion des Dérogations</h1>
              <p class="hero-subtitle">Traitez les demandes de prolongation de thèse</p>
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
              <span class="stat-value">{{ getEnAttenteAdminCount() }}</span>
              <span class="stat-label">En attente (Admin)</span>
            </div>
          </div>
          <div class="stat-card blue">
            <div class="stat-icon"><i class="bi bi-person-badge"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ getEnAttenteDirecteurCount() }}</span>
              <span class="stat-label">En attente (Directeur)</span>
            </div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon"><i class="bi bi-check-circle"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ getCountByStatus('APPROUVEE') }}</span>
              <span class="stat-label">Approuvées</span>
            </div>
          </div>
          <div class="stat-card red">
            <div class="stat-icon"><i class="bi bi-x-circle"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ getCountByStatus('REFUSEE') }}</span>
              <span class="stat-label">Refusées</span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <div class="tabs">
            <button class="tab-btn" [class.active]="activeTab === 'PENDING_ADMIN'" (click)="setTab('PENDING_ADMIN')">
              <i class="bi bi-hourglass-split"></i>
              À traiter
              @if (getEnAttenteAdminCount() > 0) {
                <span class="tab-badge">{{ getEnAttenteAdminCount() }}</span>
              }
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'PENDING_DIRECTEUR'" (click)="setTab('PENDING_DIRECTEUR')">
              <i class="bi bi-person-badge"></i>
              Chez directeur
              @if (getEnAttenteDirecteurCount() > 0) {
                <span class="tab-badge info">{{ getEnAttenteDirecteurCount() }}</span>
              }
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'HISTORY'" (click)="setTab('HISTORY')">
              <i class="bi bi-clock-history"></i>
              Historique
            </button>
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
        @if (!isLoading() && filteredDerogations().length === 0) {
          <div class="section-card">
            <div class="empty-state">
              <div class="empty-icon">
                <i class="bi" [ngClass]="getEmptyIcon()"></i>
              </div>
              <h3>{{ getEmptyTitle() }}</h3>
              <p>{{ getEmptyMessage() }}</p>
            </div>
          </div>
        }

        <!-- Liste des dérogations -->
        @if (!isLoading() && filteredDerogations().length > 0) {
          <div class="section-card">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Doctorant</th>
                    <th>Type</th>
                    <th>Motif</th>
                    <th>Date demande</th>
                    <th>Statut</th>
                    <th>{{ activeTab === 'PENDING_ADMIN' ? 'Actions' : '' }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (derog of filteredDerogations(); track derog.id) {
                    <tr [class.clickable]="true" (click)="showDetails(derog)">
                      <td>
                        <div class="user-cell">
                          <div class="user-avatar"><i class="bi bi-person"></i></div>
                          <div class="user-info">
                            <span class="user-name">
                              {{ derog.doctorantPrenom || '' }} {{ derog.doctorantNom || 'Doctorant #' + derog.doctorantId }}
                            </span>
                            <span class="user-id">Dossier #{{ derog.id }}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="type-badge" [ngClass]="getTypeBadgeClass(derog.typeDerogation)">
                          {{ formatType(derog.typeDerogation) }}
                        </span>
                      </td>
                      <td>
                        <div class="motif-cell" [title]="derog.motif">
                          {{ truncateMotif(derog.motif) }}
                        </div>
                      </td>
                      <td>
                        <span class="date-badge">
                          <i class="bi bi-calendar3"></i>
                          {{ derog.dateDemande | date:'dd/MM/yyyy' }}
                        </span>
                      </td>
                      <td>
                        <span class="status-badge" [ngClass]="getStatusBadgeClass(derog.statut)">
                          <i class="bi" [ngClass]="getStatusIcon(derog.statut)"></i>
                          {{ getStatusLabel(derog.statut) }}
                        </span>
                      </td>
                      <td (click)="$event.stopPropagation()">
                        @if (activeTab === 'PENDING_ADMIN') {
                          <div class="action-buttons">
                            <button class="btn-accept" (click)="accepter(derog.id)" title="Accepter">
                              <i class="bi bi-check-lg"></i>
                              Accepter
                            </button>
                            <button class="btn-refuse" (click)="refuser(derog.id)" title="Refuser">
                              <i class="bi bi-x-lg"></i>
                              Refuser
                            </button>
                          </div>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Info Card -->
        <div class="info-card">
          <div class="info-icon"><i class="bi bi-info-circle"></i></div>
          <div class="info-content">
            <strong>Workflow de validation</strong>
            <p>Les demandes passent par deux étapes : validation par le directeur de thèse, puis décision finale par l'administration. Vous ne voyez ici que les demandes déjà validées par les directeurs.</p>
          </div>
        </div>

        <!-- Modal Détails -->
        @if (selectedDerogation()) {
          <div class="modal-overlay" (click)="closeDetails()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3><i class="bi bi-file-earmark-text"></i> Détails de la demande #{{ selectedDerogation()!.id }}</h3>
                <button class="btn-close" (click)="closeDetails()"><i class="bi bi-x-lg"></i></button>
              </div>
              <div class="modal-body">
                
                <!-- Workflow Steps -->
                <div class="workflow-display">
                  <div class="workflow-step" [class.completed]="true">
                    <div class="step-icon"><i class="bi bi-check-lg"></i></div>
                    <div class="step-info">
                      <span class="step-title">Demande soumise</span>
                      <span class="step-date">{{ selectedDerogation()!.dateDemande | date:'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                  </div>
                  <div class="workflow-line" [class.active]="getWorkflowStep(selectedDerogation()!) >= 2"></div>
                  <div class="workflow-step" 
                       [class.completed]="getWorkflowStep(selectedDerogation()!) >= 2"
                       [class.current]="selectedDerogation()!.statut === 'EN_ATTENTE_DIRECTEUR'"
                       [class.rejected]="selectedDerogation()!.statut === 'REFUSEE' && !selectedDerogation()!.valideParDirecteur">
                    <div class="step-icon">
                      @if (getWorkflowStep(selectedDerogation()!) >= 2) {
                        <i class="bi bi-check-lg"></i>
                      } @else if (selectedDerogation()!.statut === 'REFUSEE' && !selectedDerogation()!.valideParDirecteur) {
                        <i class="bi bi-x-lg"></i>
                      } @else {
                        <i class="bi bi-hourglass-split"></i>
                      }
                    </div>
                    <div class="step-info">
                      <span class="step-title">Directeur</span>
                      @if (selectedDerogation()!.dateValidationDirecteur) {
                        <span class="step-date">{{ selectedDerogation()!.dateValidationDirecteur | date:'dd/MM/yyyy HH:mm' }}</span>
                      }
                    </div>
                  </div>
                  <div class="workflow-line" [class.active]="getWorkflowStep(selectedDerogation()!) >= 3"></div>
                  <div class="workflow-step"
                       [class.completed]="selectedDerogation()!.statut === 'APPROUVEE'"
                       [class.current]="selectedDerogation()!.statut === 'EN_ATTENTE_ADMIN'"
                       [class.rejected]="selectedDerogation()!.statut === 'REFUSEE' && selectedDerogation()!.valideParDirecteur">
                    <div class="step-icon">
                      @if (selectedDerogation()!.statut === 'APPROUVEE') {
                        <i class="bi bi-check-lg"></i>
                      } @else if (selectedDerogation()!.statut === 'REFUSEE' && selectedDerogation()!.valideParDirecteur) {
                        <i class="bi bi-x-lg"></i>
                      } @else if (selectedDerogation()!.statut === 'EN_ATTENTE_ADMIN') {
                        <i class="bi bi-hourglass-split"></i>
                      } @else {
                        <i class="bi bi-circle"></i>
                      }
                    </div>
                    <div class="step-info">
                      <span class="step-title">Administration</span>
                      @if (selectedDerogation()!.dateDecision) {
                        <span class="step-date">{{ selectedDerogation()!.dateDecision | date:'dd/MM/yyyy HH:mm' }}</span>
                      }
                    </div>
                  </div>
                </div>

                <div class="detail-grid">
                  <div class="detail-item">
                    <label>Doctorant</label>
                    <span>{{ selectedDerogation()!.doctorantPrenom || '' }} {{ selectedDerogation()!.doctorantNom || 'ID: ' + selectedDerogation()!.doctorantId }}</span>
                  </div>
                  <div class="detail-item">
                    <label>Type</label>
                    <span class="type-badge" [ngClass]="getTypeBadgeClass(selectedDerogation()!.typeDerogation)">
                      {{ formatType(selectedDerogation()!.typeDerogation) }}
                    </span>
                  </div>
                  <div class="detail-item full">
                    <label>Motif</label>
                    <p class="motif-full">{{ selectedDerogation()!.motif }}</p>
                  </div>
                  @if (selectedDerogation()!.commentaireDirecteur) {
                    <div class="detail-item full">
                      <label>Commentaire du directeur</label>
                      <p class="comment">« {{ selectedDerogation()!.commentaireDirecteur }} »</p>
                    </div>
                  }
                  @if (selectedDerogation()!.commentaireDecision) {
                    <div class="detail-item full">
                      <label>Décision administration</label>
                      <p class="comment">« {{ selectedDerogation()!.commentaireDecision }} »</p>
                    </div>
                  }
                  @if (selectedDerogation()!.dateExpiration) {
                    <div class="detail-item">
                      <label>Date d'expiration</label>
                      <span>{{ selectedDerogation()!.dateExpiration | date:'dd/MM/yyyy' }}</span>
                    </div>
                  }
                </div>
              </div>
              @if (selectedDerogation()!.statut === 'EN_ATTENTE_ADMIN') {
                <div class="modal-footer">
                  <button class="btn-modal-refuse" (click)="refuser(selectedDerogation()!.id); closeDetails()">
                    <i class="bi bi-x-lg"></i> Refuser
                  </button>
                  <button class="btn-modal-accept" (click)="accepter(selectedDerogation()!.id); closeDetails()">
                    <i class="bi bi-check-lg"></i> Accepter
                  </button>
                </div>
              }
            </div>
          </div>
        }

      </div>
    </app-main-layout>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem 3rem; }

    /* Hero */
    .hero-section { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 24px; padding: 2rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; }
    .hero-content { display: flex; align-items: center; gap: 1.25rem; color: white; }
    .hero-icon { width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; }
    .hero-title { margin: 0; font-size: 1.6rem; font-weight: 800; }
    .hero-subtitle { margin: 0.25rem 0 0; opacity: 0.9; }
    .btn-refresh { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: white; color: #d97706; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-refresh:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .btn-refresh:disabled { opacity: 0.7; cursor: not-allowed; }
    .spinner { width: 16px; height: 16px; border: 2px solid #fef3c7; border-top-color: #d97706; border-radius: 50%; animation: spin 0.8s linear infinite; }

    /* Stats */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: white; border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; }
    .stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
    .stat-card.orange .stat-icon { background: #fff7ed; color: #ea580c; }
    .stat-card.blue .stat-icon { background: #eff6ff; color: #3b82f6; }
    .stat-card.green .stat-icon { background: #ecfdf5; color: #16a34a; }
    .stat-card.red .stat-icon { background: #fef2f2; color: #dc2626; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; display: block; }
    .stat-label { font-size: 0.8rem; color: #64748b; }

    /* Tabs */
    .tabs-container { display: flex; justify-content: center; margin-bottom: 1.5rem; }
    .tabs { background: #f1f5f9; padding: 5px; border-radius: 50px; display: inline-flex; gap: 5px; }
    .tab-btn { border: none; background: transparent; padding: 0.75rem 1.5rem; border-radius: 40px; font-weight: 600; color: #64748b; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; }
    .tab-btn:hover { color: #334155; }
    .tab-btn.active { background: white; color: #d97706; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .tab-badge { background: #ef4444; color: white; padding: 0.15rem 0.5rem; border-radius: 50px; font-size: 0.75rem; }
    .tab-badge.info { background: #3b82f6; }

    /* Loading */
    .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; color: #64748b; gap: 1rem; }
    .loading-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #f59e0b; border-radius: 50%; animation: spin 0.8s linear infinite; }

    /* Section Card */
    .section-card { background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 1.5rem; }

    /* Table */
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 1rem 1.25rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .data-table tbody tr { transition: background 0.2s; cursor: pointer; }
    .data-table tbody tr:hover { background: #fffbeb; }

    /* User Cell */
    .user-cell { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-weight: 600; color: #1e293b; }
    .user-id { font-size: 0.8rem; color: #64748b; font-family: monospace; }

    /* Type Badge */
    .type-badge { padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
    .type-badge.year4 { background: #fef3c7; color: #b45309; }
    .type-badge.year5 { background: #ffedd5; color: #c2410c; }
    .type-badge.year6 { background: #fee2e2; color: #dc2626; }
    .type-badge.other { background: #e0e7ff; color: #4338ca; }

    /* Motif Cell */
    .motif-cell { max-width: 250px; color: #475569; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Date Badge */
    .date-badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; background: #f1f5f9; border-radius: 6px; font-size: 0.8rem; color: #475569; }

    /* Status Badge */
    .status-badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.875rem; border-radius: 50px; font-size: 0.8rem; font-weight: 600; }
    .status-badge.pending-directeur { background: #dbeafe; color: #1d4ed8; }
    .status-badge.pending-admin { background: #fef3c7; color: #b45309; }
    .status-badge.success { background: #dcfce7; color: #15803d; }
    .status-badge.danger { background: #fee2e2; color: #dc2626; }

    /* Action Buttons */
    .action-buttons { display: flex; gap: 0.5rem; }
    .btn-accept { display: flex; align-items: center; gap: 0.35rem; padding: 0.5rem 0.875rem; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-accept:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(34,197,94,0.3); }
    .btn-refuse { display: flex; align-items: center; gap: 0.35rem; padding: 0.5rem 0.875rem; background: white; color: #dc2626; border: 2px solid #fecaca; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-refuse:hover { background: #fef2f2; border-color: #f87171; }

    /* Empty State */
    .empty-state { padding: 4rem 2rem; text-align: center; }
    .empty-icon { width: 80px; height: 80px; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
    .empty-icon i { font-size: 2rem; color: #f59e0b; }
    .empty-state h3 { margin: 0 0 0.5rem; font-size: 1.1rem; color: #1e293b; }
    .empty-state p { margin: 0; color: #64748b; }

    /* Info Card */
    .info-card { display: flex; gap: 1rem; padding: 1.25rem; background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 1px solid #fed7aa; border-radius: 16px; }
    .info-icon { width: 44px; height: 44px; background: #f59e0b; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; flex-shrink: 0; }
    .info-content { color: #9a3412; }
    .info-content strong { display: block; margin-bottom: 0.25rem; }
    .info-content p { margin: 0; font-size: 0.875rem; line-height: 1.5; }

    /* Modal */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-content { background: white; border-radius: 20px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
    .modal-header h3 { margin: 0; font-size: 1.1rem; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }
    .modal-header i { color: #f59e0b; }
    .btn-close { background: none; border: none; font-size: 1.25rem; color: #64748b; cursor: pointer; padding: 0.25rem; }
    .btn-close:hover { color: #1e293b; }
    .modal-body { padding: 1.5rem; }
    .modal-footer { display: flex; gap: 1rem; padding: 1.25rem 1.5rem; border-top: 1px solid #e2e8f0; background: #f8fafc; }
    .btn-modal-refuse { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; background: white; border: 2px solid #fecaca; color: #dc2626; border-radius: 10px; font-weight: 600; cursor: pointer; }
    .btn-modal-refuse:hover { background: #fef2f2; }
    .btn-modal-accept { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; background: linear-gradient(135deg, #22c55e, #16a34a); border: none; color: white; border-radius: 10px; font-weight: 600; cursor: pointer; }
    .btn-modal-accept:hover { transform: translateY(-1px); }

    /* Workflow Display in Modal */
    .workflow-display { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 12px; }
    .workflow-step { display: flex; flex-direction: column; align-items: center; }
    .workflow-step .step-icon { width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0; color: #94a3b8; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; }
    .workflow-step.completed .step-icon { background: #22c55e; color: white; }
    .workflow-step.current .step-icon { background: #f59e0b; color: white; }
    .workflow-step.rejected .step-icon { background: #ef4444; color: white; }
    .workflow-step .step-info { text-align: center; }
    .workflow-step .step-title { display: block; font-size: 0.8rem; font-weight: 600; color: #1e293b; }
    .workflow-step .step-date { display: block; font-size: 0.7rem; color: #64748b; }
    .workflow-line { width: 50px; height: 3px; background: #e2e8f0; margin: 0 0.5rem; margin-bottom: 2rem; }
    .workflow-line.active { background: #22c55e; }

    /* Detail Grid */
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .detail-item.full { grid-column: 1 / -1; }
    .detail-item label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
    .detail-item span { font-size: 0.95rem; color: #1e293b; }
    .motif-full { margin: 0; padding: 1rem; background: #f8fafc; border-radius: 8px; font-size: 0.9rem; color: #475569; line-height: 1.6; }
    .comment { margin: 0; padding: 0.75rem 1rem; background: #fef3c7; border-radius: 8px; font-size: 0.9rem; color: #92400e; font-style: italic; }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 992px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .hero-section { flex-direction: column; gap: 1.5rem; text-align: center; }
      .hero-content { flex-direction: column; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .action-buttons { flex-direction: column; }
      .detail-grid { grid-template-columns: 1fr; }
      .workflow-display { flex-direction: column; gap: 0.5rem; }
      .workflow-line { width: 3px; height: 20px; margin: 0; }
    }
  `]
})
export class DerogationManagementComponent implements OnInit {
  derogations = signal<Derogation[]>([]);
  isLoading = signal(true);
  activeTab = 'PENDING_ADMIN';
  selectedDerogation = signal<Derogation | null>(null);

  constructor(
      private derogationService: DerogationService,
      private authService: AuthService
  ) {}

  ngOnInit() { this.loadDerogations(); }

  loadDerogations() {
    this.isLoading.set(true);
    this.derogationService.getAllDerogations().subscribe({
      next: (data: Derogation[]) => { this.derogations.set(data); this.isLoading.set(false); },
      error: (err: any) => { console.error(err); this.isLoading.set(false); }
    });
  }

  setTab(tab: string) { this.activeTab = tab; }

  filteredDerogations(): Derogation[] {
    const all = this.derogations();
    if (this.activeTab === 'PENDING_ADMIN') {
      return all.filter(d => d.statut === 'EN_ATTENTE_ADMIN');
    }
    if (this.activeTab === 'PENDING_DIRECTEUR') {
      return all.filter(d => d.statut === 'EN_ATTENTE_DIRECTEUR' || d.statut === 'EN_ATTENTE');
    }
    return all.filter(d => d.statut === 'APPROUVEE' || d.statut === 'REFUSEE');
  }

  getEnAttenteAdminCount(): number {
    return this.derogations().filter(d => d.statut === 'EN_ATTENTE_ADMIN').length;
  }

  getEnAttenteDirecteurCount(): number {
    return this.derogations().filter(d => d.statut === 'EN_ATTENTE_DIRECTEUR' || d.statut === 'EN_ATTENTE').length;
  }

  getCountByStatus(status: string): number {
    return this.derogations().filter(d => d.statut === status).length;
  }

  formatType(type: string): string {
    const types: Record<string, string> = {
      'PROLONGATION_4EME_ANNEE': '4ème Année',
      'PROLONGATION_5EME_ANNEE': '5ème Année',
      'PROLONGATION_6EME_ANNEE': '6ème Année',
      'SUSPENSION_TEMPORAIRE': 'Suspension',
      'AUTRE': 'Autre'
    };
    return types[type] || type;
  }

  getTypeBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      'PROLONGATION_4EME_ANNEE': 'year4',
      'PROLONGATION_5EME_ANNEE': 'year5',
      'PROLONGATION_6EME_ANNEE': 'year6'
    };
    return classes[type] || 'other';
  }

  getStatusBadgeClass(statut: StatutDerogation): string {
    const classes: Record<string, string> = {
      'EN_ATTENTE_DIRECTEUR': 'pending-directeur',
      'EN_ATTENTE_ADMIN': 'pending-admin',
      'EN_ATTENTE': 'pending-admin',
      'APPROUVEE': 'success',
      'REFUSEE': 'danger'
    };
    return classes[statut] || '';
  }

  getStatusIcon(statut: StatutDerogation): string {
    const icons: Record<string, string> = {
      'EN_ATTENTE_DIRECTEUR': 'bi-person-badge',
      'EN_ATTENTE_ADMIN': 'bi-hourglass-split',
      'EN_ATTENTE': 'bi-hourglass-split',
      'APPROUVEE': 'bi-check-circle-fill',
      'REFUSEE': 'bi-x-circle-fill'
    };
    return icons[statut] || 'bi-circle';
  }

  getStatusLabel(statut: StatutDerogation): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE_DIRECTEUR': 'Chez directeur',
      'EN_ATTENTE_ADMIN': 'À traiter',
      'EN_ATTENTE': 'En attente',
      'APPROUVEE': 'Approuvée',
      'REFUSEE': 'Refusée'
    };
    return labels[statut] || statut;
  }

  truncateMotif(motif: string): string {
    return motif.length > 60 ? motif.substring(0, 60) + '...' : motif;
  }

  getEmptyIcon(): string {
    if (this.activeTab === 'PENDING_ADMIN') return 'bi-hourglass';
    if (this.activeTab === 'PENDING_DIRECTEUR') return 'bi-person-badge';
    return 'bi-clock-history';
  }

  getEmptyTitle(): string {
    if (this.activeTab === 'PENDING_ADMIN') return 'Aucune demande à traiter';
    if (this.activeTab === 'PENDING_DIRECTEUR') return 'Aucune demande chez les directeurs';
    return 'Aucun historique';
  }

  getEmptyMessage(): string {
    if (this.activeTab === 'PENDING_ADMIN') return 'Les demandes validées par les directeurs apparaîtront ici.';
    if (this.activeTab === 'PENDING_DIRECTEUR') return 'Les demandes en attente de validation directeur apparaîtront ici.';
    return 'Les demandes traitées apparaîtront ici.';
  }

  getWorkflowStep(derog: Derogation): number {
    if (derog.statut === 'EN_ATTENTE_DIRECTEUR' || derog.statut === 'EN_ATTENTE') return 1;
    if (derog.statut === 'EN_ATTENTE_ADMIN') return 2;
    return 3;
  }

  showDetails(derog: Derogation) {
    this.selectedDerogation.set(derog);
  }

  closeDetails() {
    this.selectedDerogation.set(null);
  }

  accepter(id: number) {
    if (confirm('Accorder cette dérogation ?')) {
      const adminId = this.authService.currentUser()?.id || 1;
      this.derogationService.approuverDerogation(id, adminId, 'Approuvée par l\'administration').subscribe({
        next: () => {
          alert('Dérogation accordée.');
          this.loadDerogations();
        },
        error: (err: any) => alert(err.error?.error || 'Erreur lors de la validation')
      });
    }
  }

  refuser(id: number) {
    const motif = prompt('Motif du refus :');
    if (motif) {
      const adminId = this.authService.currentUser()?.id || 1;
      this.derogationService.refuserDerogation(id, adminId, motif).subscribe({
        next: () => {
          alert('Dérogation refusée.');
          this.loadDerogations();
        },
        error: (err: any) => alert(err.error?.error || 'Erreur lors du refus')
      });
    }
  }
}