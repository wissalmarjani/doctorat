import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { SoutenanceService } from '@core/services/soutenance.service';
import { AuthService } from '@core/services/auth.service';
import { forkJoin } from 'rxjs';

interface MembreJury {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    etablissement: string;
    grade: string;
    specialite: string;
    role: string;
}

interface JurySelection {
    presidentId: number | null;
    rapporteurId: number | null;
    examinateurId: number | null;
}

@Component({
    selector: 'app-director-soutenance',
    standalone: true,
    imports: [CommonModule, FormsModule, MainLayoutComponent],
    template: `
        <app-main-layout>
            <div class="page-container">
                <!-- HERO -->
                <div class="hero-header">
                    <div class="hero-content">
                        <div class="hero-icon"><i class="bi bi-mortarboard-fill"></i></div>
                        <div><h1 class="hero-title">Gestion des Soutenances</h1><p class="hero-subtitle">Validez les demandes et proposez le jury</p></div>
                    </div>
                    <button class="btn-refresh" (click)="loadData()" [disabled]="isLoading()">
                        @if (isLoading()) { <span class="spinner-btn"></span> } @else { <i class="bi bi-arrow-clockwise"></i> } Actualiser
                    </button>
                </div>

                <!-- STATS -->
                <div class="stats-grid">
                    <div class="stat-card warning"><div class="stat-icon-wrap"><i class="bi bi-hourglass-split"></i></div><div class="stat-info"><span class="stat-value">{{ getPendingValidationCount() }}</span><span class="stat-label">À valider</span></div></div>
                    <div class="stat-card success"><div class="stat-icon-wrap"><i class="bi bi-people-fill"></i></div><div class="stat-info"><span class="stat-value">{{ getJuryNeededCount() }}</span><span class="stat-label">Jury à proposer</span></div></div>
                    <div class="stat-card info"><div class="stat-icon-wrap"><i class="bi bi-clock-history"></i></div><div class="stat-info"><span class="stat-value">{{ getWaitingAdminCount() }}</span><span class="stat-label">Attente admin</span></div></div>
                    <div class="stat-card neutral"><div class="stat-icon-wrap"><i class="bi bi-collection-fill"></i></div><div class="stat-info"><span class="stat-value">{{ soutenances().length }}</span><span class="stat-label">Total</span></div></div>
                </div>

                @if (isLoading()) { <div class="loading-state"><div class="spinner-large"></div><p>Chargement...</p></div> }
                @if (!isLoading() && soutenances().length === 0) { <div class="empty-state"><div class="empty-icon"><i class="bi bi-inbox"></i></div><h3>Aucune demande</h3></div> }

                @if (!isLoading() && soutenances().length > 0) {
                    <div class="soutenances-section">
                        <div class="section-header"><h3 class="section-title"><i class="bi bi-list-task"></i>Demandes</h3><span class="section-count">{{ soutenances().length }} dossier(s)</span></div>
                        <div class="soutenances-list">
                            @for (soutenance of soutenances(); track soutenance.id) {
                                <div class="soutenance-card" [class.expanded]="expandedId() === soutenance.id" [attr.data-status]="soutenance.statut">
                                    <div class="card-header" (click)="toggleExpand(soutenance.id)">
                                        <div class="header-left">
                                            <div class="status-indicator" [ngClass]="getStatusIndicatorClass(soutenance.statut)"><i class="bi" [ngClass]="getStatusIcon(soutenance.statut)"></i></div>
                                            <div class="header-info">
                                                <div class="header-top"><span class="doctorant-name">{{ getDoctorantName(soutenance) }}</span><span class="status-badge" [ngClass]="getStatusBadgeClass(soutenance.statut)">{{ formatStatus(soutenance.statut) }}</span></div>
                                                <h4 class="thesis-title">{{ getThesisTitle(soutenance) }}</h4>
                                                <div class="header-meta">
                                                    <span class="meta-item"><i class="bi bi-calendar3"></i>{{ soutenance.createdAt | date:'dd MMM yyyy' }}</span>
                                                    @if (needsDirectorAction(soutenance.statut)) { <span class="action-required"><i class="bi bi-exclamation-circle-fill"></i>{{ getActionNeededText(soutenance.statut) }}</span> }
                                                </div>
                                            </div>
                                        </div>
                                        <button class="expand-btn" [class.rotated]="expandedId() === soutenance.id"><i class="bi bi-chevron-down"></i></button>
                                    </div>

                                    @if (expandedId() === soutenance.id) {
                                        <div class="card-body">
                                            <!-- PRÉREQUIS -->
                                            <div class="detail-card prerequis-card">
                                                <h5 class="detail-title"><i class="bi bi-award"></i>Prérequis Académiques</h5>
                                                <div class="prerequis-grid">
                                                    <div class="prereq-item" [class.valid]="getPublications(soutenance) >= 2">
                                                        <div class="prereq-icon publications"><i class="bi bi-journal-richtext"></i></div>
                                                        <div class="prereq-info"><span class="prereq-value">{{ getPublications(soutenance) }}</span><span class="prereq-label">Publications</span></div>
                                                        <div class="prereq-status">@if (getPublications(soutenance) >= 2) { <i class="bi bi-check-circle-fill valid-icon"></i> } @else { <span class="prereq-target">min: 2</span> }</div>
                                                    </div>
                                                    <div class="prereq-item" [class.valid]="getConferences(soutenance) >= 2">
                                                        <div class="prereq-icon conferences"><i class="bi bi-mic-fill"></i></div>
                                                        <div class="prereq-info"><span class="prereq-value">{{ getConferences(soutenance) }}</span><span class="prereq-label">Conférences</span></div>
                                                        <div class="prereq-status">@if (getConferences(soutenance) >= 2) { <i class="bi bi-check-circle-fill valid-icon"></i> } @else { <span class="prereq-target">min: 2</span> }</div>
                                                    </div>
                                                    <div class="prereq-item" [class.valid]="getHeuresFormation(soutenance) >= 200">
                                                        <div class="prereq-icon heures"><i class="bi bi-clock-history"></i></div>
                                                        <div class="prereq-info"><span class="prereq-value">{{ getHeuresFormation(soutenance) }}h</span><span class="prereq-label">Formation</span></div>
                                                        <div class="prereq-status">@if (getHeuresFormation(soutenance) >= 200) { <i class="bi bi-check-circle-fill valid-icon"></i> } @else { <span class="prereq-target">min: 200h</span> }</div>
                                                    </div>
                                                </div>
                                                <div class="prereq-progress">
                                                    <div class="progress-info"><span>Progression</span><span class="progress-pct">{{ calculatePrereqProgress(soutenance) }}%</span></div>
                                                    <div class="progress-bar"><div class="progress-fill" [style.width.%]="calculatePrereqProgress(soutenance)" [class.complete]="calculatePrereqProgress(soutenance) >= 100"></div></div>
                                                </div>
                                            </div>

                                            <!-- DOCUMENTS -->
                                            <div class="detail-card">
                                                <h5 class="detail-title"><i class="bi bi-folder2-open"></i>Documents</h5>
                                                <div class="documents-grid">
                                                    <a [href]="getDocumentUrl(soutenance.cheminManuscrit)" target="_blank" class="doc-link" [class.disabled]="!soutenance.cheminManuscrit">
                                                        <div class="doc-icon manuscrit"><i class="bi bi-file-earmark-pdf"></i></div>
                                                        <span class="doc-name">Manuscrit</span>
                                                        <span class="doc-badge" [class.available]="soutenance.cheminManuscrit">{{ soutenance.cheminManuscrit ? 'Disponible' : 'Absent' }}</span>
                                                    </a>
                                                    <a [href]="getDocumentUrl(soutenance.cheminRapportAntiPlagiat)" target="_blank" class="doc-link" [class.disabled]="!soutenance.cheminRapportAntiPlagiat">
                                                        <div class="doc-icon rapport"><i class="bi bi-shield-check"></i></div>
                                                        <span class="doc-name">Anti-plagiat</span>
                                                        <span class="doc-badge" [class.available]="soutenance.cheminRapportAntiPlagiat">{{ soutenance.cheminRapportAntiPlagiat ? 'Disponible' : 'Absent' }}</span>
                                                    </a>
                                                </div>
                                            </div>

                                            <!-- SOUMIS: Validation -->
                                            @if (soutenance.statut === 'SOUMIS') {
                                                <div class="detail-card action-card">
                                                    <h5 class="detail-title"><i class="bi bi-clipboard-check"></i>Votre décision</h5>
                                                    @if (!showDecisionForm() || currentSoutenanceId !== soutenance.id) {
                                                        <div class="choice-grid">
                                                            <button class="choice-card approve" (click)="initiateValidation(soutenance.id, $event)">
                                                                <div class="choice-icon"><i class="bi bi-check-circle-fill"></i></div>
                                                                <div class="choice-text"><strong>Valider</strong><span>Transmettre à l'admin</span></div>
                                                            </button>
                                                            <button class="choice-card reject" (click)="initiateRejection(soutenance.id, $event)">
                                                                <div class="choice-icon"><i class="bi bi-pencil-square"></i></div>
                                                                <div class="choice-text"><strong>Corrections</strong><span>Demander modifications</span></div>
                                                            </button>
                                                        </div>
                                                    } @else if (decisionType() === 'validate') {
                                                        <div class="decision-panel approve">
                                                            <p>Confirmer la validation des prérequis de <strong>{{ getDoctorantName(soutenance) }}</strong> ?</p>
                                                            <div class="panel-actions">
                                                                <button class="btn-cancel" (click)="cancelDecision($event)">Annuler</button>
                                                                <button class="btn-confirm success" [disabled]="isSubmitting()" (click)="confirmValidation(soutenance.id, $event)">@if (isSubmitting()) { <span class="spinner-sm"></span> } Confirmer</button>
                                                            </div>
                                                        </div>
                                                    } @else {
                                                        <div class="decision-panel reject">
                                                            <textarea class="decision-textarea" [(ngModel)]="commentaire" placeholder="Décrivez les corrections nécessaires..."></textarea>
                                                            <div class="panel-actions">
                                                                <button class="btn-cancel" (click)="cancelDecision($event)">Annuler</button>
                                                                <button class="btn-confirm danger" [disabled]="!commentaire.trim() || isSubmitting()" (click)="confirmRejection(soutenance.id, $event)">@if (isSubmitting()) { <span class="spinner-sm"></span> } Envoyer</button>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            }

                                            <!-- PREREQUIS_VALIDES -->
                                            @if (soutenance.statut === 'PREREQUIS_VALIDES') {
                                                <div class="detail-card status-card waiting">
                                                    <div class="status-icon"><i class="bi bi-hourglass-split"></i></div>
                                                    <div class="status-text"><h5>En attente de l'administration</h5><p>Votre validation a été transmise.</p></div>
                                                </div>
                                            }

                                            <!-- AUTORISEE: Sélection Jury -->
                                            @if (soutenance.statut === 'AUTORISEE') {
                                                <div class="detail-card jury-card">
                                                    <div class="jury-header">
                                                        <h5 class="detail-title"><i class="bi bi-people-fill"></i>Composition du Jury</h5>
                                                        <span class="authorized-badge"><i class="bi bi-check-circle-fill"></i>Autorisée</span>
                                                    </div>
                                                    <p class="jury-instruction">Sélectionnez les 3 membres du jury :</p>
                                                    <div class="jury-selection-grid">
                                                        <div class="jury-select-card" [class.selected]="jurySelection.presidentId">
                                                            <div class="select-header president"><i class="bi bi-star-fill"></i><span>Président</span></div>
                                                            <select [(ngModel)]="jurySelection.presidentId">
                                                                <option [ngValue]="null">-- Choisir --</option>
                                                                @for (m of presidentsDisponibles(); track m.id) { <option [ngValue]="m.id">{{ m.prenom }} {{ m.nom }} - {{ m.etablissement }}</option> }
                                                            </select>
                                                        </div>
                                                        <div class="jury-select-card" [class.selected]="jurySelection.rapporteurId">
                                                            <div class="select-header rapporteur"><i class="bi bi-file-text-fill"></i><span>Rapporteur</span></div>
                                                            <select [(ngModel)]="jurySelection.rapporteurId">
                                                                <option [ngValue]="null">-- Choisir --</option>
                                                                @for (m of rapporteursDisponibles(); track m.id) { <option [ngValue]="m.id">{{ m.prenom }} {{ m.nom }} - {{ m.etablissement }}</option> }
                                                            </select>
                                                        </div>
                                                        <div class="jury-select-card" [class.selected]="jurySelection.examinateurId">
                                                            <div class="select-header examinateur"><i class="bi bi-search"></i><span>Examinateur</span></div>
                                                            <select [(ngModel)]="jurySelection.examinateurId">
                                                                <option [ngValue]="null">-- Choisir --</option>
                                                                @for (m of examinateursDisponibles(); track m.id) { <option [ngValue]="m.id">{{ m.prenom }} {{ m.nom }} - {{ m.etablissement }}</option> }
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div class="jury-submit">
                                                        <div class="selection-count">{{ getSelectionCount() }}/3 sélectionnés</div>
                                                        <button class="btn-submit-jury" [disabled]="!isJurySelectionValid() || isSubmitting()" (click)="submitJurySelection(soutenance.id, $event)">
                                                            @if (isSubmitting()) { <span class="spinner-sm"></span> } @else { <i class="bi bi-send-check"></i> } Soumettre le jury
                                                        </button>
                                                    </div>
                                                </div>
                                            }

                                            <!-- JURY_PROPOSE -->
                                            @if (soutenance.statut === 'JURY_PROPOSE') {
                                                <div class="detail-card status-card waiting">
                                                    <div class="status-icon"><i class="bi bi-people-fill"></i></div>
                                                    <div class="status-text"><h5>Jury en cours de validation</h5><p>L'administration va planifier la date.</p></div>
                                                </div>
                                                @if (soutenance.membresJury?.length) {
                                                    <div class="detail-card jury-display">
                                                        <h5 class="detail-title"><i class="bi bi-people"></i>Jury proposé</h5>
                                                        <div class="jury-members-grid">
                                                            @for (m of getUniqueJuryMembers(soutenance.membresJury); track m.id) {
                                                                <div class="jury-member" [ngClass]="'role-' + m.role.toLowerCase()">
                                                                    <div class="member-avatar">{{ getInitials(m.prenom + ' ' + m.nom) }}</div>
                                                                    <div class="member-info"><span class="member-name">{{ m.prenom }} {{ m.nom }}</span><span class="member-ets">{{ m.etablissement }}</span></div>
                                                                    <span class="role-tag">{{ formatRole(m.role) }}</span>
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>
                                                }
                                            }

                                            <!-- PLANIFIEE -->
                                            @if (soutenance.statut === 'PLANIFIEE') {
                                                <div class="detail-card status-card scheduled">
                                                    <div class="status-icon"><i class="bi bi-calendar-check-fill"></i></div>
                                                    <div class="status-text">
                                                        <h5>Soutenance planifiée</h5>
                                                        <div class="schedule-info">
                                                            <span><i class="bi bi-calendar-event"></i>{{ soutenance.dateSoutenance | date:'dd/MM/yyyy' }}</span>
                                                            @if (soutenance.heureSoutenance) { <span><i class="bi bi-clock"></i>{{ soutenance.heureSoutenance }}</span> }
                                                            @if (soutenance.lieuSoutenance) { <span><i class="bi bi-geo-alt"></i>{{ soutenance.lieuSoutenance }}</span> }
                                                        </div>
                                                    </div>
                                                </div>
                                            }

                                            <!-- TERMINEE -->
                                            @if (soutenance.statut === 'TERMINEE') {
                                                <div class="detail-card status-card completed">
                                                    <div class="status-icon"><i class="bi bi-trophy-fill"></i></div>
                                                    <div class="status-text">
                                                        <h5>Terminée</h5>
                                                        <span class="mention-badge">{{ soutenance.mention || 'N/A' }}</span>
                                                        @if (soutenance.felicitationsJury) { <span class="felicitations"><i class="bi bi-star-fill"></i>Félicitations</span> }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                }

                @if (toastMessage()) {
                    <div class="toast" [ngClass]="toastType()"><i class="bi" [ngClass]="toastType() === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'"></i>{{ toastMessage() }}</div>
                }
            </div>
        </app-main-layout>
    `,
    styles: [`
      .page-container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem 3rem; }

      /* Hero */
      .hero-header { background: linear-gradient(135deg, #8b5cf6, #6d28d9); border-radius: 20px; padding: 2rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; color: white; }
      .hero-content { display: flex; align-items: center; gap: 1.25rem; }
      .hero-icon { width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; }
      .hero-title { font-size: 1.5rem; font-weight: 800; margin: 0; }
      .hero-subtitle { margin: 0.25rem 0 0; opacity: 0.9; font-size: 0.95rem; }
      .btn-refresh { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; background: white; color: #6d28d9; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }

      /* Stats */
      .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
      .stat-card { background: white; border-radius: 14px; padding: 1rem; display: flex; align-items: center; gap: 1rem; border: 1px solid #e2e8f0; }
      .stat-icon-wrap { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
      .stat-card.warning .stat-icon-wrap { background: #fef3c7; color: #d97706; }
      .stat-card.success .stat-icon-wrap { background: #dcfce7; color: #16a34a; }
      .stat-card.info .stat-icon-wrap { background: #e0e7ff; color: #6366f1; }
      .stat-card.neutral .stat-icon-wrap { background: #f1f5f9; color: #64748b; }
      .stat-value { font-size: 1.5rem; font-weight: 800; color: #1e293b; display: block; }
      .stat-label { font-size: 0.75rem; color: #64748b; }

      /* Loading/Empty */
      .loading-state, .empty-state { background: white; border-radius: 16px; padding: 3rem; text-align: center; border: 1px solid #e2e8f0; }
      .spinner-large { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
      .spinner-btn { width: 16px; height: 16px; border: 2px solid rgba(109,40,217,0.3); border-top-color: #6d28d9; border-radius: 50%; animation: spin 0.8s linear infinite; }
      .spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; margin-right: 0.25rem; }
      @keyframes spin { 100% { transform: rotate(360deg); } }
      .empty-icon { width: 70px; height: 70px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
      .empty-icon i { font-size: 2rem; color: #94a3b8; }

      /* Section */
      .soutenances-section { background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
      .section-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
      .section-title { display: flex; align-items: center; gap: 0.5rem; margin: 0; font-size: 1rem; font-weight: 700; color: #1e293b; }
      .section-title i { color: #8b5cf6; }
      .section-count { font-size: 0.85rem; color: #64748b; }
      .soutenances-list { padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }

      /* Card */
      .soutenance-card { background: white; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; transition: all 0.2s; }
      .soutenance-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
      .soutenance-card.expanded { border-color: #c7d2fe; box-shadow: 0 8px 25px rgba(139,92,246,0.1); }
      .soutenance-card[data-status="SOUMIS"] { border-left: 4px solid #f59e0b; }
      .soutenance-card[data-status="PREREQUIS_VALIDES"] { border-left: 4px solid #6366f1; }
      .soutenance-card[data-status="AUTORISEE"] { border-left: 4px solid #10b981; }
      .soutenance-card[data-status="JURY_PROPOSE"] { border-left: 4px solid #3b82f6; }
      .soutenance-card[data-status="PLANIFIEE"] { border-left: 4px solid #8b5cf6; }
      .soutenance-card[data-status="TERMINEE"] { border-left: 4px solid #22c55e; }

      .card-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; cursor: pointer; }
      .card-header:hover { background: #f8fafc; }
      .header-left { display: flex; align-items: flex-start; gap: 1rem; flex: 1; }
      .status-indicator { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
      .status-indicator.pending { background: #fef3c7; color: #d97706; }
      .status-indicator.waiting-admin { background: #e0e7ff; color: #6366f1; }
      .status-indicator.jury { background: #dcfce7; color: #16a34a; }
      .status-indicator.scheduled { background: #f3e8ff; color: #8b5cf6; }
      .status-indicator.approved { background: #dcfce7; color: #22c55e; }
      .header-top { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
      .doctorant-name { font-weight: 700; color: #1e293b; }
      .thesis-title { font-size: 0.9rem; font-weight: 600; color: #475569; margin: 0.25rem 0; }
      .header-meta { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
      .meta-item { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: #64748b; }
      .action-required { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; font-weight: 600; color: #dc2626; background: #fef2f2; padding: 0.2rem 0.5rem; border-radius: 4px; }
      .status-badge { padding: 0.25rem 0.6rem; border-radius: 50px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; }
      .status-badge.pending { background: #fef3c7; color: #b45309; }
      .status-badge.waiting-admin { background: #e0e7ff; color: #4338ca; }
      .status-badge.jury { background: #dcfce7; color: #166534; }
      .status-badge.scheduled { background: #f3e8ff; color: #7c3aed; }
      .status-badge.approved { background: #dcfce7; color: #15803d; }
      .expand-btn { width: 36px; height: 36px; border-radius: 8px; border: none; background: #f1f5f9; color: #64748b; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
      .expand-btn.rotated { background: #8b5cf6; color: white; transform: rotate(180deg); }

      .card-body { padding: 1.25rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 1rem; }
      .detail-card { background: white; border-radius: 12px; padding: 1.25rem; border: 1px solid #e2e8f0; }
      .detail-title { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: #475569; margin: 0 0 1rem; }
      .detail-title i { color: #8b5cf6; }

      /* Prérequis */
      .prerequis-card { background: linear-gradient(135deg, #faf5ff, #f3e8ff); border-color: #c4b5fd; }
      .prerequis-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1rem; }
      .prereq-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem; background: white; border-radius: 10px; border: 1px solid #e2e8f0; }
      .prereq-item.valid { border-color: #86efac; background: #f0fdf4; }
      .prereq-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
      .prereq-icon.publications { background: #dbeafe; color: #2563eb; }
      .prereq-icon.conferences { background: #fef3c7; color: #d97706; }
      .prereq-icon.heures { background: #f3e8ff; color: #8b5cf6; }
      .prereq-value { display: block; font-size: 1.25rem; font-weight: 800; color: #1e293b; }
      .prereq-label { font-size: 0.7rem; color: #64748b; }
      .prereq-status { margin-left: auto; }
      .prereq-target { font-size: 0.65rem; color: #94a3b8; background: #f1f5f9; padding: 0.15rem 0.4rem; border-radius: 4px; }
      .valid-icon { color: #22c55e; font-size: 1.1rem; }
      .prereq-progress { padding: 0.75rem; background: white; border-radius: 8px; border: 1px solid #e2e8f0; }
      .progress-info { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
      .progress-pct { color: #8b5cf6; }
      .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
      .progress-fill { height: 100%; background: linear-gradient(90deg, #8b5cf6, #6d28d9); border-radius: 4px; transition: width 0.3s; }
      .progress-fill.complete { background: linear-gradient(90deg, #22c55e, #16a34a); }

      /* Documents */
      .documents-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
      .doc-link { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; text-decoration: none; transition: all 0.2s; }
      .doc-link:hover:not(.disabled) { border-color: #8b5cf6; }
      .doc-link.disabled { opacity: 0.5; pointer-events: none; }
      .doc-icon { width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
      .doc-icon.manuscrit { background: #fee2e2; color: #dc2626; }
      .doc-icon.rapport { background: #dbeafe; color: #2563eb; }
      .doc-name { font-weight: 600; color: #1e293b; font-size: 0.85rem; flex: 1; }
      .doc-badge { font-size: 0.65rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: #f1f5f9; color: #64748b; }
      .doc-badge.available { background: #dcfce7; color: #15803d; }

      /* Action Card */
      .action-card { border-color: #fcd34d; background: linear-gradient(135deg, #fffbeb, #fef3c7); }
      .choice-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
      .choice-card { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; border-radius: 10px; border: 2px solid; background: white; cursor: pointer; text-align: left; transition: all 0.2s; }
      .choice-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
      .choice-card.approve { border-color: #86efac; }
      .choice-card.approve:hover { border-color: #22c55e; }
      .choice-card.approve .choice-icon { background: #dcfce7; color: #16a34a; }
      .choice-card.reject { border-color: #fecaca; }
      .choice-card.reject:hover { border-color: #ef4444; }
      .choice-card.reject .choice-icon { background: #fee2e2; color: #dc2626; }
      .choice-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
      .choice-text strong { display: block; font-size: 0.9rem; color: #1e293b; }
      .choice-text span { font-size: 0.75rem; color: #64748b; }

      /* Decision Panel */
      .decision-panel { margin-top: 0.75rem; padding: 1rem; border-radius: 10px; }
      .decision-panel.approve { background: #f0fdf4; border: 1px solid #86efac; }
      .decision-panel.reject { background: #fef2f2; border: 1px solid #fecaca; }
      .decision-panel p { margin: 0 0 1rem; font-size: 0.9rem; color: #1e293b; }
      .decision-textarea { width: 100%; padding: 0.75rem; border: 1px solid #fca5a5; border-radius: 8px; font-size: 0.9rem; resize: vertical; min-height: 80px; margin-bottom: 1rem; }
      .decision-textarea:focus { outline: none; border-color: #ef4444; }
      .panel-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
      .btn-cancel { padding: 0.6rem 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-weight: 600; color: #64748b; cursor: pointer; }
      .btn-confirm { display: flex; align-items: center; padding: 0.6rem 1.25rem; border: none; border-radius: 8px; font-weight: 600; color: white; cursor: pointer; }
      .btn-confirm.success { background: #22c55e; }
      .btn-confirm.danger { background: #ef4444; }
      .btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

      /* Status Card */
      .status-card { display: flex; align-items: center; gap: 1rem; border: none; }
      .status-card.waiting { background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1px solid #93c5fd; }
      .status-card.scheduled { background: linear-gradient(135deg, #faf5ff, #f3e8ff); border: 1px solid #c4b5fd; }
      .status-card.completed { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1px solid #86efac; }
      .status-card .status-icon { width: 50px; height: 50px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; }
      .status-card.waiting .status-icon { color: #3b82f6; }
      .status-card.scheduled .status-icon { color: #8b5cf6; }
      .status-card.completed .status-icon { color: #22c55e; }
      .status-text h5 { margin: 0 0 0.25rem; font-size: 1rem; font-weight: 700; color: #1e293b; }
      .status-text p { margin: 0; font-size: 0.85rem; color: #64748b; }
      .schedule-info { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.5rem; }
      .schedule-info span { display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; font-weight: 600; color: #475569; background: white; padding: 0.35rem 0.75rem; border-radius: 6px; }
      .schedule-info i { color: #8b5cf6; }
      .mention-badge { display: inline-block; font-size: 1.1rem; font-weight: 800; color: #15803d; margin-top: 0.5rem; }
      .felicitations { display: inline-flex; align-items: center; gap: 0.35rem; margin-left: 0.75rem; padding: 0.35rem 0.75rem; background: #fef3c7; border-radius: 50px; font-size: 0.8rem; font-weight: 600; color: #b45309; }

      /* Jury Card */
      .jury-card { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-color: #86efac; }
      .jury-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
      .authorized-badge { display: flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; background: #dcfce7; border-radius: 50px; font-size: 0.75rem; font-weight: 600; color: #15803d; }
      .jury-instruction { margin: 0 0 1rem; font-size: 0.85rem; color: #64748b; }
      .jury-selection-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem; }
      .jury-select-card { background: white; border-radius: 10px; padding: 1rem; border: 2px solid #e2e8f0; transition: all 0.2s; }
      .jury-select-card.selected { border-color: #86efac; }
      .select-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; font-weight: 700; font-size: 0.85rem; }
      .select-header.president { color: #d97706; }
      .select-header.rapporteur { color: #2563eb; }
      .select-header.examinateur { color: #8b5cf6; }
      .select-header i { font-size: 1rem; }
      .jury-select-card select { width: 100%; padding: 0.6rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; background: white; }
      .jury-select-card select:focus { outline: none; border-color: #8b5cf6; }
      .jury-submit { display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: white; border-radius: 10px; border: 1px solid #e2e8f0; }
      .selection-count { font-size: 0.85rem; font-weight: 600; color: #475569; }
      .btn-submit-jury { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
      .btn-submit-jury:disabled { opacity: 0.6; cursor: not-allowed; }

      /* Jury Display */
      .jury-display { background: #f8fafc; }
      .jury-members-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
      .jury-member { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem; background: white; border-radius: 10px; border: 1px solid #e2e8f0; }
      .member-avatar { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: white; flex-shrink: 0; }
      .jury-member.role-president .member-avatar { background: linear-gradient(135deg, #f59e0b, #d97706); }
      .jury-member.role-rapporteur .member-avatar { background: linear-gradient(135deg, #3b82f6, #2563eb); }
      .jury-member.role-examinateur .member-avatar { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
      .member-info { flex: 1; min-width: 0; }
      .member-name { display: block; font-weight: 600; color: #1e293b; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .member-ets { display: block; font-size: 0.7rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .role-tag { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; flex-shrink: 0; }
      .jury-member.role-president .role-tag { background: #fef3c7; color: #b45309; }
      .jury-member.role-rapporteur .role-tag { background: #dbeafe; color: #1d4ed8; }
      .jury-member.role-examinateur .role-tag { background: #f3e8ff; color: #7c3aed; }

      /* Toast */
      .toast { position: fixed; bottom: 2rem; right: 2rem; display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem 1.25rem; border-radius: 10px; color: white; font-weight: 600; font-size: 0.9rem; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
      .toast.success { background: #22c55e; }
      .toast.error { background: #ef4444; }

      @media (max-width: 1024px) { .jury-selection-grid, .jury-members-grid, .prerequis-grid { grid-template-columns: 1fr; } }
      @media (max-width: 768px) { .hero-header { flex-direction: column; gap: 1rem; text-align: center; } .hero-content { flex-direction: column; } .stats-grid { grid-template-columns: repeat(2, 1fr); } .choice-grid, .documents-grid { grid-template-columns: 1fr; } }
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

    presidentsDisponibles = signal<MembreJury[]>([]);
    rapporteursDisponibles = signal<MembreJury[]>([]);
    examinateursDisponibles = signal<MembreJury[]>([]);
    jurySelection: JurySelection = { presidentId: null, rapporteurId: null, examinateurId: null };

    toastMessage = signal<string>('');
    toastType = signal<'success' | 'error'>('success');

    constructor(private soutenanceService: SoutenanceService, private authService: AuthService) {}

    ngOnInit() { this.loadData(); this.loadMembresJuryDisponibles(); }

    loadData() {
        this.isLoading.set(true);
        const currentUser = this.authService.currentUser();
        if (!currentUser?.id) { this.isLoading.set(false); return; }
        this.soutenanceService.getSoutenancesByDirecteur(currentUser.id).subscribe({
            next: (data) => { this.soutenances.set(data); this.isLoading.set(false); },
            error: () => { this.isLoading.set(false); this.showToast('Erreur', 'error'); }
        });
    }

    loadMembresJuryDisponibles() {
        this.soutenanceService.getMembresJuryByRole('PRESIDENT').subscribe({ next: (d) => this.presidentsDisponibles.set(d) });
        this.soutenanceService.getMembresJuryByRole('RAPPORTEUR').subscribe({ next: (d) => this.rapporteursDisponibles.set(d) });
        this.soutenanceService.getMembresJuryByRole('EXAMINATEUR').subscribe({ next: (d) => this.examinateursDisponibles.set(d) });
    }

    toggleExpand(id: number) { this.expandedId() === id ? (this.expandedId.set(null), this.resetForms()) : (this.expandedId.set(id), this.resetForms()); }
    resetForms() { this.showDecisionForm.set(false); this.decisionType.set(null); this.commentaire = ''; this.currentSoutenanceId = null; this.jurySelection = { presidentId: null, rapporteurId: null, examinateurId: null }; }
    showToast(msg: string, type: 'success' | 'error') { this.toastMessage.set(msg); this.toastType.set(type); setTimeout(() => this.toastMessage.set(''), 4000); }

    // Prérequis
    getPublications(s: any): number { return s.doctorantInfo?.nbPublications || 0; }
    getConferences(s: any): number { return s.doctorantInfo?.nbConferences || 0; }
    getHeuresFormation(s: any): number { return s.doctorantInfo?.heuresFormation || 0; }
    calculatePrereqProgress(s: any): number {
        const pubs = Math.min(this.getPublications(s) / 2, 1) * 33.33;
        const confs = Math.min(this.getConferences(s) / 2, 1) * 33.33;
        const heures = Math.min(this.getHeuresFormation(s) / 200, 1) * 33.34;
        return Math.round(pubs + confs + heures);
    }

    // Helpers
    getDoctorantName(s: any): string { return s.doctorantInfo ? `${s.doctorantInfo.prenom} ${s.doctorantInfo.nom}` : `Doctorant #${s.doctorantId}`; }
    getThesisTitle(s: any): string { return s.titreThese || 'Sujet non défini'; }
    getDocumentUrl(filename: string): string { return this.soutenanceService.getDocumentUrl(filename); }
    getInitials(name: string): string { const p = name.trim().split(' '); return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name[0]?.toUpperCase() || '?'; }
    needsDirectorAction(statut: string): boolean { return ['SOUMIS', 'AUTORISEE'].includes(statut); }
    getActionNeededText(statut: string): string { return statut === 'SOUMIS' ? 'Valider prérequis' : statut === 'AUTORISEE' ? 'Sélectionner jury' : ''; }

    getPendingValidationCount(): number { return this.soutenances().filter(s => s.statut === 'SOUMIS').length; }
    getJuryNeededCount(): number { return this.soutenances().filter(s => s.statut === 'AUTORISEE').length; }
    getWaitingAdminCount(): number { return this.soutenances().filter(s => ['PREREQUIS_VALIDES', 'JURY_PROPOSE'].includes(s.statut)).length; }

    getStatusIndicatorClass(statut: string): string { return { 'SOUMIS': 'pending', 'PREREQUIS_VALIDES': 'waiting-admin', 'AUTORISEE': 'jury', 'JURY_PROPOSE': 'waiting-admin', 'PLANIFIEE': 'scheduled', 'TERMINEE': 'approved' }[statut] || 'pending'; }
    getStatusIcon(statut: string): string { return { 'SOUMIS': 'bi-hourglass-split', 'PREREQUIS_VALIDES': 'bi-clock', 'AUTORISEE': 'bi-people-fill', 'JURY_PROPOSE': 'bi-send', 'PLANIFIEE': 'bi-calendar-check', 'TERMINEE': 'bi-trophy-fill' }[statut] || 'bi-circle'; }
    getStatusBadgeClass(statut: string): string { return this.getStatusIndicatorClass(statut); }
    formatStatus(statut: string): string { return { 'SOUMIS': 'À Valider', 'PREREQUIS_VALIDES': 'Attente Admin', 'AUTORISEE': 'Jury requis', 'JURY_PROPOSE': 'Jury Soumis', 'PLANIFIEE': 'Planifiée', 'TERMINEE': 'Terminée' }[statut] || statut; }
    formatRole(role: string): string { return { 'PRESIDENT': 'Président', 'RAPPORTEUR': 'Rapporteur', 'EXAMINATEUR': 'Examinateur' }[role] || role; }
    getUniqueJuryMembers(members: any[]): any[] { if (!members) return []; const seen = new Map(); return members.filter(m => { const k = `${m.nom}-${m.prenom}-${m.role}`; if (seen.has(k)) return false; seen.set(k, true); return true; }); }

    getSelectionCount(): number { let c = 0; if (this.jurySelection.presidentId) c++; if (this.jurySelection.rapporteurId) c++; if (this.jurySelection.examinateurId) c++; return c; }
    isJurySelectionValid(): boolean { return !!(this.jurySelection.presidentId && this.jurySelection.rapporteurId && this.jurySelection.examinateurId); }

    submitJurySelection(soutenanceId: number, event: Event) {
        event.stopPropagation();
        if (!this.isJurySelectionValid()) return;
        this.isSubmitting.set(true);
        const president = this.presidentsDisponibles().find(m => m.id === this.jurySelection.presidentId)!;
        const rapporteur = this.rapporteursDisponibles().find(m => m.id === this.jurySelection.rapporteurId)!;
        const examinateur = this.examinateursDisponibles().find(m => m.id === this.jurySelection.examinateurId)!;
        const addRequests = [
            this.soutenanceService.ajouterMembreJury(soutenanceId, { nom: president.nom, prenom: president.prenom, email: president.email, etablissement: president.etablissement, grade: president.grade, specialite: president.specialite, role: 'PRESIDENT' }),
            this.soutenanceService.ajouterMembreJury(soutenanceId, { nom: rapporteur.nom, prenom: rapporteur.prenom, email: rapporteur.email, etablissement: rapporteur.etablissement, grade: rapporteur.grade, specialite: rapporteur.specialite, role: 'RAPPORTEUR' }),
            this.soutenanceService.ajouterMembreJury(soutenanceId, { nom: examinateur.nom, prenom: examinateur.prenom, email: examinateur.email, etablissement: examinateur.etablissement, grade: examinateur.grade, specialite: examinateur.specialite, role: 'EXAMINATEUR' })
        ];
        forkJoin(addRequests).subscribe({
            next: () => {
                this.soutenanceService.proposerJury(soutenanceId).subscribe({
                    next: () => { this.showToast('Jury proposé !', 'success'); this.loadData(); this.resetForms(); this.isSubmitting.set(false); },
                    error: (e) => { this.showToast(e.error?.error || 'Erreur', 'error'); this.isSubmitting.set(false); }
                });
            },
            error: () => { this.showToast('Erreur ajout', 'error'); this.isSubmitting.set(false); }
        });
    }

    initiateValidation(id: number, e: Event) { e.stopPropagation(); this.currentSoutenanceId = id; this.showDecisionForm.set(true); this.decisionType.set('validate'); }
    initiateRejection(id: number, e: Event) { e.stopPropagation(); this.currentSoutenanceId = id; this.showDecisionForm.set(true); this.decisionType.set('reject'); this.commentaire = ''; }
    cancelDecision(e: Event) { e.stopPropagation(); this.showDecisionForm.set(false); this.decisionType.set(null); this.commentaire = ''; this.currentSoutenanceId = null; }

    confirmValidation(id: number, e: Event) {
        e.stopPropagation();
        this.isSubmitting.set(true);
        this.soutenanceService.validerPrerequisDirecteur(id, 'Prérequis validés').subscribe({
            next: () => { this.showToast('Prérequis validés !', 'success'); this.loadData(); this.showDecisionForm.set(false); this.isSubmitting.set(false); },
            error: (err) => { this.showToast(err.error?.error || 'Erreur', 'error'); this.isSubmitting.set(false); }
        });
    }

    confirmRejection(id: number, e: Event) {
        e.stopPropagation();
        if (!this.commentaire.trim()) return;
        this.isSubmitting.set(true);
        this.soutenanceService.rejeterDemandeDirecteur(id, this.commentaire.trim()).subscribe({
            next: () => { this.showToast('Corrections demandées', 'success'); this.loadData(); this.showDecisionForm.set(false); this.isSubmitting.set(false); },
            error: (err) => { this.showToast(err.error?.error || 'Erreur', 'error'); this.isSubmitting.set(false); }
        });
    }
}