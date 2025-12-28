import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { SoutenanceService } from '@core/services/soutenance.service';
import { AuthService } from '@core/services/auth.service';

@Component({
    selector: 'app-director-soutenance',
    standalone: true,
    imports: [CommonModule, FormsModule, MainLayoutComponent],
    template: `
        <app-main-layout>
            <div class="page-container">

                <!-- Hero Header -->
                <div class="hero-section">
                    <div class="hero-content">
                        <div class="hero-icon">
                            <i class="bi bi-mortarboard"></i>
                        </div>
                        <div>
                            <h1 class="hero-title">Gestion des Soutenances</h1>
                            <p class="hero-subtitle">Validez les demandes de soutenance de vos doctorants</p>
                        </div>
                    </div>
                    <button class="btn-refresh" (click)="loadData()" [disabled]="isLoading()">
                        @if (isLoading()) {
                            <span class="spinner"></span>
                        } @else {
                            <i class="bi bi-arrow-clockwise"></i>
                        }
                        Actualiser
                    </button>
                    <div class="hero-decoration">
                        <div class="decoration-circle c1"></div>
                        <div class="decoration-circle c2"></div>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon pending">
                            <i class="bi bi-hourglass-split"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ getPendingCount() }}</span>
                            <span class="stat-label">En attente</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon approved">
                            <i class="bi bi-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ getApprovedCount() }}</span>
                            <span class="stat-label">Validées</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon scheduled">
                            <i class="bi bi-calendar-check"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ getScheduledCount() }}</span>
                            <span class="stat-label">Planifiées</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon total">
                            <i class="bi bi-collection"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ soutenances().length }}</span>
                            <span class="stat-label">Total</span>
                        </div>
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
                @if (!isLoading() && soutenances().length === 0) {
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="bi bi-inbox"></i>
                        </div>
                        <h3 class="empty-title">Aucune demande de soutenance</h3>
                        <p class="empty-text">Vos doctorants n'ont pas encore soumis de demande de soutenance.</p>
                    </div>
                }

                <!-- Soutenances List -->
                @if (!isLoading() && soutenances().length > 0) {
                    <div class="soutenances-section">
                        <div class="section-header">
                            <h3 class="section-title">
                                <i class="bi bi-list-task me-2"></i>
                                Demandes de soutenance
                            </h3>
                        </div>

                        <div class="soutenances-list">
                            @for (soutenance of soutenances(); track soutenance.id) {
                                <div class="soutenance-card" [class.expanded]="expandedId() === soutenance.id">
                                    <!-- Main Row -->
                                    <div class="card-main" (click)="toggleExpand(soutenance.id)">
                                        <div class="card-left">
                                            <div class="status-indicator" [ngClass]="getStatusIndicatorClass(soutenance.statut)">
                                                <i class="bi" [ngClass]="getStatusIcon(soutenance.statut)"></i>
                                            </div>
                                        </div>

                                        <div class="card-content">
                                            <div class="card-header-row">
                                                <!-- ✅ AFFICHAGE AMÉLIORÉ DU DOCTORANT (Nom + Contact) -->
                                                <div class="doctorant-info-display">
                                                    <span class="doctorant-name">
                                                        {{ getDoctorantName(soutenance) }}
                                                    </span>
                                                    <div class="doctorant-contact-row">
                                                        <span class="contact-item">
                                                            <i class="bi bi-envelope"></i>
                                                            {{ soutenance.doctorantInfo?.email || 'Email non disponible' }}
                                                        </span>
                                                        @if (soutenance.doctorantInfo?.telephone) {
                                                            <span class="contact-separator">•</span>
                                                            <span class="contact-item">
                                                                <i class="bi bi-telephone"></i>
                                                                {{ soutenance.doctorantInfo.telephone }}
                                                            </span>
                                                        }
                                                    </div>
                                                </div>

                                                <span class="status-badge" [ngClass]="getStatusBadgeClass(soutenance.statut)">
                                                    {{ formatStatus(soutenance.statut) }}
                                                </span>
                                            </div>

                                            <h4 class="thesis-title">{{ getThesisTitle(soutenance) }}</h4>

                                            <div class="card-meta">
                                                <span class="meta-item">
                                                    <i class="bi bi-calendar3"></i>
                                                    Soumis le {{ soutenance.createdAt | date:'dd MMM yyyy' }}
                                                </span>
                                                <span class="meta-item prereq" [class.valid]="arePrerequisValid(soutenance)">
                                                    <i class="bi" [ngClass]="arePrerequisValid(soutenance) ? 'bi-check-circle-fill' : 'bi-exclamation-circle'"></i>
                                                    {{ arePrerequisValid(soutenance) ? 'Prérequis OK' : 'Prérequis incomplets' }}
                                                </span>
                                            </div>
                                        </div>

                                        <div class="card-right">
                                            <i class="bi bi-chevron-down expand-icon" [class.rotated]="expandedId() === soutenance.id"></i>
                                        </div>
                                    </div>

                                    <!-- Expanded Details -->
                                    @if (expandedId() === soutenance.id) {
                                        <div class="card-details">
                                            <div class="details-grid">
                                                <!-- ✅ Prérequis avec logique renforcée -->
                                                <div class="detail-section">
                                                    <h5 class="detail-title">
                                                        <i class="bi bi-list-check"></i>
                                                        État des Prérequis
                                                    </h5>

                                                    <div class="prereq-grid">
                                                        <div class="prereq-item">
                                                            <div class="prereq-icon pub">
                                                                <i class="bi bi-journal-richtext"></i>
                                                            </div>
                                                            <div class="prereq-info-box">
                                                                <span class="prereq-label">Publications Q1/Q2</span>
                                                                <div class="prereq-value">
                                                                    <span class="value">{{ getDoctorantPublications(soutenance) }}</span>
                                                                    <span class="required">/ 2 requises</span>
                                                                </div>
                                                            </div>
                                                            <div class="prereq-status" [class.valid]="getDoctorantPublications(soutenance) >= 2">
                                                                <i class="bi" [ngClass]="getDoctorantPublications(soutenance) >= 2 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                                                            </div>
                                                        </div>

                                                        <div class="prereq-item">
                                                            <div class="prereq-icon conf">
                                                                <i class="bi bi-people"></i>
                                                            </div>
                                                            <div class="prereq-info-box">
                                                                <span class="prereq-label">Conférences</span>
                                                                <div class="prereq-value">
                                                                    <span class="value">{{ getDoctorantConferences(soutenance) }}</span>
                                                                    <span class="required">/ 2 requises</span>
                                                                </div>
                                                            </div>
                                                            <div class="prereq-status" [class.valid]="getDoctorantConferences(soutenance) >= 2">
                                                                <i class="bi" [ngClass]="getDoctorantConferences(soutenance) >= 2 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                                                            </div>
                                                        </div>

                                                        <div class="prereq-item">
                                                            <div class="prereq-icon form">
                                                                <i class="bi bi-book"></i>
                                                            </div>
                                                            <div class="prereq-info-box">
                                                                <span class="prereq-label">Heures Formation</span>
                                                                <div class="prereq-value">
                                                                    <span class="value">{{ getDoctorantHeuresFormation(soutenance) }}h</span>
                                                                    <span class="required">/ 200h requises</span>
                                                                </div>
                                                            </div>
                                                            <div class="prereq-status" [class.valid]="getDoctorantHeuresFormation(soutenance) >= 200">
                                                                <i class="bi" [ngClass]="getDoctorantHeuresFormation(soutenance) >= 200 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Documents -->
                                                <div class="detail-section">
                                                    <h5 class="detail-title">
                                                        <i class="bi bi-file-earmark-text"></i>
                                                        Documents soumis
                                                    </h5>
                                                    <div class="docs-list">
                                                        <a [href]="getDocumentUrl(soutenance.cheminManuscrit)" target="_blank" class="doc-link">
                                                            <i class="bi bi-file-pdf"></i>
                                                            Manuscrit de thèse
                                                        </a>
                                                        <a [href]="getDocumentUrl(soutenance.cheminRapportAntiPlagiat)" target="_blank" class="doc-link">
                                                            <i class="bi bi-shield-check"></i>
                                                            Rapport Anti-plagiat
                                                        </a>
                                                    </div>
                                                </div>

                                                <!-- Actions -->
                                                @if (isPendingStatus(soutenance.statut)) {
                                                    <div class="detail-section actions">
                                                        <h5 class="detail-title">
                                                            <i class="bi bi-check2-square"></i>
                                                            Votre décision
                                                        </h5>

                                                        @if (!showDecisionForm()) {
                                                            <div class="action-buttons">
                                                                <button class="btn-action validate" (click)="initiateValidation(soutenance.id, $event)">
                                                                    <i class="bi bi-check-lg"></i>
                                                                    Valider les prérequis
                                                                </button>
                                                                <button class="btn-action reject" (click)="initiateRejection(soutenance.id, $event)">
                                                                    <i class="bi bi-x-lg"></i>
                                                                    Demander des corrections
                                                                </button>
                                                            </div>
                                                        } @else if (decisionType() === 'validate') {
                                                            <div class="decision-form validate-form">
                                                                <p class="decision-info">
                                                                    <i class="bi bi-info-circle"></i>
                                                                    En validant, vous confirmez que le doctorant remplit tous les prérequis.
                                                                </p>
                                                                <div class="decision-actions">
                                                                    <button class="btn-cancel" (click)="cancelDecision($event)">Annuler</button>
                                                                    <button class="btn-confirm validate"
                                                                            [disabled]="isSubmitting()"
                                                                            (click)="confirmValidation(soutenance.id, $event)">
                                                                        @if (isSubmitting()) {
                                                                            <span class="spinner-sm"></span>
                                                                        } @else {
                                                                            <i class="bi bi-check-lg"></i>
                                                                        }
                                                                        Confirmer
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        } @else {
                                                            <div class="decision-form reject-form">
                                                                <label class="decision-label">
                                                                    <i class="bi bi-chat-left-text"></i>
                                                                    Motif / Corrections demandées
                                                                </label>
                                                                <textarea
                                                                        class="decision-textarea"
                                                                        rows="3"
                                                                        [(ngModel)]="commentaire"
                                                                        placeholder="Précisez les corrections demandées...">
                                                                </textarea>
                                                                <div class="decision-actions">
                                                                    <button class="btn-cancel" (click)="cancelDecision($event)">Annuler</button>
                                                                    <button class="btn-confirm reject"
                                                                            [disabled]="!commentaire.trim() || isSubmitting()"
                                                                            (click)="confirmRejection(soutenance.id, $event)">
                                                                        @if (isSubmitting()) {
                                                                            <span class="spinner-sm"></span>
                                                                        } @else {
                                                                            <i class="bi bi-send"></i>
                                                                        }
                                                                        Envoyer
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        }
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                }

            </div>
        </app-main-layout>
    `,
    styles: [`
      .page-container { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem 3rem; }

      /* Hero Section */
      .hero-section { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); border-radius: 24px; padding: 2rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden; }
      .hero-content { display: flex; align-items: center; gap: 1.25rem; position: relative; z-index: 2; }
      .hero-icon { width: 64px; height: 64px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; color: white; }
      .hero-title { color: white; font-size: 1.6rem; font-weight: 800; margin: 0; }
      .hero-subtitle { color: rgba(255, 255, 255, 0.9); margin: 0.25rem 0 0; font-size: 0.95rem; }
      .btn-refresh { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: white; color: #6d28d9; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; position: relative; z-index: 2; }
      .btn-refresh:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); }
      .hero-decoration { position: absolute; right: 0; top: 0; bottom: 0; width: 200px; }
      .decoration-circle { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.1); }
      .c1 { width: 120px; height: 120px; top: -30px; right: 40px; }
      .c2 { width: 80px; height: 80px; bottom: -20px; right: 120px; }
      .spinner, .spinner-sm { border-radius: 50%; animation: spin 0.8s linear infinite; }
      .spinner { width: 18px; height: 18px; border: 2px solid rgba(109, 40, 217, 0.2); border-top-color: #6d28d9; }
      .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* Stats Grid */
      .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
      .stat-card { background: white; border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0; }
      .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
      .stat-icon.pending { background: #fef3c7; color: #f59e0b; }
      .stat-icon.approved { background: #dcfce7; color: #22c55e; }
      .stat-icon.scheduled { background: #dbeafe; color: #3b82f6; }
      .stat-icon.total { background: #ede9fe; color: #8b5cf6; }
      .stat-info { display: flex; flex-direction: column; }
      .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
      .stat-label { font-size: 0.8rem; color: #64748b; }

      /* Loading & Empty States */
      .loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; background: white; border-radius: 20px; border: 1px solid #e2e8f0; text-align: center; }
      .loading-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #8b5cf6; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 1rem; }
      .empty-icon { width: 80px; height: 80px; background: #ede9fe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
      .empty-icon i { font-size: 2.5rem; color: #8b5cf6; }
      .empty-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem; }
      .empty-text { color: #64748b; }

      /* Soutenances Section */
      .soutenances-section { background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; overflow: hidden; }
      .section-header { padding: 1.25rem 1.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
      .section-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; }
      .section-title i { color: #8b5cf6; }
      .soutenances-list { padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
      .soutenance-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; transition: all 0.2s; }
      .soutenance-card:hover { border-color: #c4b5fd; }
      .soutenance-card.expanded { border-color: #8b5cf6; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.1); }
      .card-main { display: flex; align-items: center; padding: 1.25rem; cursor: pointer; }

      /* Left Status */
      .card-left { margin-right: 1rem; }
      .status-indicator { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
      .status-indicator.pending { background: #fef3c7; color: #f59e0b; }
      .status-indicator.approved { background: #dcfce7; color: #22c55e; }
      .status-indicator.rejected { background: #fee2e2; color: #ef4444; }
      .status-indicator.scheduled { background: #dbeafe; color: #3b82f6; }

      /* Content Area */
      .card-content { flex: 1; }
      .card-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }

      /* Doctorant Info Styles */
      .doctorant-info-display { display: flex; flex-direction: column; gap: 0.15rem; }
      .doctorant-name { font-weight: 700; color: #1e293b; font-size: 1.05rem; }
      .doctorant-contact-row { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.8rem; color: #64748b; }
      .contact-item { display: flex; align-items: center; gap: 0.35rem; }
      .contact-item i { color: #8b5cf6; }
      .contact-separator { color: #cbd5e1; }

      .status-badge { padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
      .status-badge.pending { background: #fef3c7; color: #b45309; }
      .status-badge.approved { background: #dcfce7; color: #15803d; }
      .status-badge.rejected { background: #fee2e2; color: #dc2626; }
      .status-badge.scheduled { background: #dbeafe; color: #1d4ed8; }

      .thesis-title { font-size: 0.95rem; font-weight: 600; color: #334155; margin: 0.5rem 0; line-height: 1.4; }
      .card-meta { display: flex; gap: 1rem; flex-wrap: wrap; }
      .meta-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: #64748b; }
      .meta-item.prereq { color: #f59e0b; }
      .meta-item.prereq.valid { color: #22c55e; }

      .card-right { padding-left: 1rem; }
      .expand-icon { color: #94a3b8; font-size: 1.25rem; transition: transform 0.3s; }
      .expand-icon.rotated { transform: rotate(180deg); }

      /* Details Panel */
      .card-details { background: white; border-top: 1px solid #e2e8f0; padding: 1.5rem; animation: slideDown 0.3s ease-out; }
      @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      .details-grid { display: flex; flex-direction: column; gap: 1.5rem; }
      .detail-section { background: #f8fafc; border-radius: 14px; padding: 1.25rem; border: 1px solid #e2e8f0; }
      .detail-section.actions { border-left: 4px solid #8b5cf6; }
      .detail-title { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem; display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }

      /* Prereq Grid */
      .prereq-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
      .prereq-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: white; border-radius: 10px; border: 1px solid #e2e8f0; }
      .prereq-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
      .prereq-icon.pub { background: #dbeafe; color: #2563eb; }
      .prereq-icon.conf { background: #fce7f3; color: #db2777; }
      .prereq-icon.form { background: #fef3c7; color: #d97706; }
      .prereq-info-box { flex: 1; }
      .prereq-label { display: block; font-size: 0.75rem; color: #64748b; }
      .prereq-value .value { font-size: 1rem; font-weight: 700; color: #1e293b; }
      .prereq-value .required { font-size: 0.75rem; color: #94a3b8; }
      .prereq-status { font-size: 1.25rem; color: #ef4444; }
      .prereq-status.valid { color: #22c55e; }

      /* Docs List */
      .docs-list { display: flex; gap: 1rem; flex-wrap: wrap; }
      .doc-link { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #334155; font-weight: 500; font-size: 0.9rem; transition: all 0.2s; }
      .doc-link:hover { border-color: #8b5cf6; color: #8b5cf6; }
      .doc-link i { font-size: 1.1rem; color: #ef4444; }

      /* Buttons & Form */
      .action-buttons { display: flex; gap: 1rem; }
      .btn-action { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem 1rem; border: none; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
      .btn-action.validate { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; }
      .btn-action.validate:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.35); }
      .btn-action.reject { background: white; color: #f59e0b; border: 2px solid #fcd34d; }
      .btn-action.reject:hover { background: #fef3c7; }

      .decision-form { padding: 1rem; border-radius: 12px; }
      .decision-form.validate-form { background: #f0fdf4; border: 1px solid #86efac; }
      .decision-form.reject-form { background: #fffbeb; border: 1px solid #fcd34d; }
      .decision-info { display: flex; align-items: flex-start; gap: 0.5rem; margin: 0 0 1rem; font-size: 0.875rem; color: #15803d; }
      .decision-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: #b45309; margin-bottom: 0.5rem; }
      .decision-textarea { width: 100%; padding: 0.75rem; border: 1px solid #fcd34d; border-radius: 8px; font-size: 0.9rem; resize: none; background: white; }
      .decision-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
      .btn-cancel { padding: 0.75rem 1.25rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; color: #64748b; font-weight: 600; cursor: pointer; }
      .btn-confirm { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
      .btn-confirm.validate { background: #22c55e; color: white; }
      .btn-confirm.reject { background: #f59e0b; color: white; }
      .btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

      @media (max-width: 768px) {
        .stats-grid { grid-template-columns: repeat(2, 1fr); }
        .prereq-grid { grid-template-columns: 1fr; }
        .action-buttons { flex-direction: column; }
      }
    `]
})
export class DirectorSoutenanceComponent implements OnInit {
    soutenances = signal<any[]>([]);
    isLoading = signal(false);
    isSubmitting = signal(false);
    expandedId = signal<number | null>(null);
    showDecisionForm = signal(false);
    decisionType = signal<'validate' | 'reject' | null>(null);
    commentaire = '';
    currentSoutenanceId: number | null = null;

    constructor(
        private soutenanceService: SoutenanceService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.isLoading.set(true);
        const currentUser = this.authService.currentUser();

        if (!currentUser?.id) {
            this.isLoading.set(false);
            return;
        }

        this.soutenanceService.getSoutenancesByDirecteur(currentUser.id).subscribe({
            next: (data: any[]) => {
                console.log('📋 Soutenances reçues:', data);
                this.soutenances.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erreur chargement soutenances:', err);
                this.isLoading.set(false);
            }
        });
    }

    toggleExpand(id: number) {
        if (this.expandedId() === id) {
            this.expandedId.set(null);
            this.showDecisionForm.set(false);
            this.decisionType.set(null);
            this.commentaire = '';
        } else {
            this.expandedId.set(id);
            this.showDecisionForm.set(false);
            this.decisionType.set(null);
            this.commentaire = '';
        }
    }

    getDoctorantName(soutenance: any): string {
        if (soutenance.doctorantInfo) {
            return `${soutenance.doctorantInfo.prenom} ${soutenance.doctorantInfo.nom}`;
        }
        return `Doctorant #${soutenance.doctorantId}`;
    }

    getThesisTitle(soutenance: any): string {
        return soutenance.titreThese || soutenance.sujetThese || 'Sujet non défini';
    }

    // ✅ NOUVEAU : Récupération robuste des stats (checke partout)
    getDoctorantPublications(soutenance: any): number {
        // 1. Priorité: Champs mappés dans UserInfo
        if (soutenance.doctorantInfo?.nbPublications != null) return soutenance.doctorantInfo.nbPublications;
        if (soutenance.doctorantInfo?.nb_publications != null) return soutenance.doctorantInfo.nb_publications;

        // 2. Fallback: Champs dans prerequis
        if (soutenance.prerequis?.nombreArticlesQ1Q2 != null) return soutenance.prerequis.nombreArticlesQ1Q2;

        return 0;
    }

    getDoctorantConferences(soutenance: any): number {
        if (soutenance.doctorantInfo?.nbConferences != null) return soutenance.doctorantInfo.nbConferences;
        if (soutenance.doctorantInfo?.nb_conferences != null) return soutenance.doctorantInfo.nb_conferences;

        if (soutenance.prerequis?.nombreConferences != null) return soutenance.prerequis.nombreConferences;

        return 0;
    }

    getDoctorantHeuresFormation(soutenance: any): number {
        if (soutenance.doctorantInfo?.heuresFormation != null) return soutenance.doctorantInfo.heuresFormation;
        if (soutenance.doctorantInfo?.heures_formation != null) return soutenance.doctorantInfo.heures_formation;

        if (soutenance.prerequis?.heuresFormation != null) return soutenance.prerequis.heuresFormation;

        return 0;
    }

    arePrerequisValid(soutenance: any): boolean {
        const pubs = this.getDoctorantPublications(soutenance);
        const confs = this.getDoctorantConferences(soutenance);
        const heures = this.getDoctorantHeuresFormation(soutenance);
        return pubs >= 2 && confs >= 2 && heures >= 200;
    }

    getDocumentUrl(filename: string): string {
        return this.soutenanceService.getDocumentUrl(filename);
    }

    isPendingStatus(statut: string): boolean {
        return ['SOUMIS', 'BROUILLON', 'EN_ATTENTE'].includes(statut);
    }

    getPendingCount(): number {
        return this.soutenances().filter(s => this.isPendingStatus(s.statut)).length;
    }

    getApprovedCount(): number {
        return this.soutenances().filter(s =>
            ['PREREQUIS_VALIDES', 'JURY_PROPOSE', 'AUTORISEE', 'VALIDEE'].includes(s.statut)
        ).length;
    }

    getScheduledCount(): number {
        return this.soutenances().filter(s => s.statut === 'PLANIFIEE').length;
    }

    getStatusIndicatorClass(statut: string): string {
        if (['PREREQUIS_VALIDES', 'JURY_PROPOSE', 'AUTORISEE', 'VALIDEE'].includes(statut)) return 'approved';
        if (statut === 'PLANIFIEE') return 'scheduled';
        if (['REJETEE', 'REFUSEE'].includes(statut)) return 'rejected';
        return 'pending';
    }

    getStatusIcon(statut: string): string {
        if (['PREREQUIS_VALIDES', 'JURY_PROPOSE', 'AUTORISEE', 'VALIDEE'].includes(statut)) return 'bi-check-lg';
        if (statut === 'PLANIFIEE') return 'bi-calendar-check';
        if (['REJETEE', 'REFUSEE'].includes(statut)) return 'bi-x-lg';
        if (statut === 'TERMINEE') return 'bi-trophy';
        return 'bi-hourglass-split';
    }

    getStatusBadgeClass(statut: string): string {
        if (['PREREQUIS_VALIDES', 'JURY_PROPOSE', 'AUTORISEE', 'VALIDEE'].includes(statut)) return 'approved';
        if (statut === 'PLANIFIEE') return 'scheduled';
        if (['REJETEE', 'REFUSEE'].includes(statut)) return 'rejected';
        return 'pending';
    }

    formatStatus(statut: string): string {
        const statusMap: Record<string, string> = {
            'BROUILLON': 'Brouillon',
            'SOUMIS': 'Soumise',
            'EN_ATTENTE': 'En attente',
            'PREREQUIS_VALIDES': 'Prérequis validés',
            'JURY_PROPOSE': 'Jury proposé',
            'AUTORISEE': 'Autorisée',
            'VALIDEE': 'Validée',
            'PLANIFIEE': 'Planifiée',
            'TERMINEE': 'Terminée',
            'REJETEE': 'Corrections demandées',
            'REFUSEE': 'Refusée'
        };
        return statusMap[statut] || statut;
    }

    initiateValidation(id: number, event: Event) {
        event.stopPropagation();
        this.currentSoutenanceId = id;
        this.showDecisionForm.set(true);
        this.decisionType.set('validate');
    }

    initiateRejection(id: number, event: Event) {
        event.stopPropagation();
        this.currentSoutenanceId = id;
        this.showDecisionForm.set(true);
        this.decisionType.set('reject');
        this.commentaire = '';
    }

    cancelDecision(event: Event) {
        event.stopPropagation();
        this.showDecisionForm.set(false);
        this.decisionType.set(null);
        this.commentaire = '';
        this.currentSoutenanceId = null;
    }

    confirmValidation(id: number, event: Event) {
        event.stopPropagation();
        if (confirm('Confirmer la validation des prérequis ?')) {
            this.isSubmitting.set(true);
            this.soutenanceService.validerPrerequisDirecteur(id, 'Prérequis validés par le directeur').subscribe({
                next: () => {
                    this.loadData();
                    this.showDecisionForm.set(false);
                    this.isSubmitting.set(false);
                },
                error: (err) => {
                    alert('Erreur: ' + err.message);
                    this.isSubmitting.set(false);
                }
            });
        }
    }

    confirmRejection(id: number, event: Event) {
        event.stopPropagation();
        if (!this.commentaire.trim()) return;
        if (confirm('Confirmer la demande de corrections ?')) {
            this.isSubmitting.set(true);
            this.soutenanceService.rejeterDemandeDirecteur(id, this.commentaire.trim()).subscribe({
                next: () => {
                    this.loadData();
                    this.showDecisionForm.set(false);
                    this.isSubmitting.set(false);
                },
                error: (err) => {
                    alert('Erreur: ' + err.message);
                    this.isSubmitting.set(false);
                }
            });
        }
    }
}