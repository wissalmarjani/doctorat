import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { SoutenanceService } from '@core/services/soutenance.service';
import { Soutenance, StatutSoutenance, MembreJury, RoleJury } from '@core/models/soutenance.model';

@Component({
    selector: 'app-soutenance-detail',
    standalone: true,
    imports: [CommonModule, MainLayoutComponent, FormsModule],
    template: `
        <app-main-layout>
            <div class="page-container p-4">

                <!-- LOADING STATE -->
                @if (isLoading()) {
                    <div class="loading-container">
                        <div class="spinner"></div>
                        <p>Chargement des détails...</p>
                    </div>
                }
                
                @else if (error()) {
                    <div class="error-container">
                        <div class="error-icon">
                            <i class="bi bi-exclamation-triangle"></i>
                        </div>
                        <h3>Erreur de chargement</h3>
                        <p>{{ error() }}</p>
                        <button class="btn-back" (click)="goBack()">
                            <i class="bi bi-arrow-left me-2"></i>Retour à la liste
                        </button>
                    </div>
                }
                
                @else if (soutenance()) {
                    <!-- HEADER -->
                    <div class="page-header" [ngClass]="getHeaderClass()">
                        <div class="header-top">
                            <button class="btn-back-header" (click)="goBack()">
                                <i class="bi bi-arrow-left"></i>
                            </button>
                            <div class="status-badge-large">
                                <i class="bi" [ngClass]="getStatusIcon()"></i>
                                {{ formatStatut(soutenance()!.statut) }}
                            </div>
                        </div>
                        <div class="header-content">
                            <h1 class="page-title">Détails de la Soutenance</h1>
                            <p class="page-subtitle">Soutenance #{{ soutenance()!.id }}</p>
                        </div>
                        <div class="header-meta">
              <span class="meta-item">
                <i class="bi bi-calendar3"></i>
                Créée le {{ soutenance()!.createdAt | date:'dd/MM/yyyy' }}
              </span>
                            @if (soutenance()!.dateSoutenance) {
                                <span class="meta-item">
                  <i class="bi bi-calendar-check"></i>
                  Prévue le {{ soutenance()!.dateSoutenance | date:'dd/MM/yyyy' }}
                </span>
                            }
                        </div>
                    </div>

                    <!-- MAIN CONTENT GRID -->
                    <div class="content-grid">

                        <!-- LEFT COLUMN -->
                        <div class="left-column">

                            <!-- DOCTORANT CARD -->
                            <div class="detail-card">
                                <div class="card-header-section">
                                    <div class="card-icon bg-primary">
                                        <i class="bi bi-person-badge"></i>
                                    </div>
                                    <h3 class="card-title">Doctorant</h3>
                                </div>
                                <div class="card-body">
                                    <div class="profile-section">
                                        <div class="avatar-large" [style.background]="getAvatarColor(soutenance()!.doctorantId)">
                                            {{ getInitials(getDoctorantNom()) }}
                                        </div>
                                        <div class="profile-info">
                                            <h4 class="profile-name">{{ getDoctorantNom() }}</h4>
                                            <span class="profile-id">
                        <i class="bi bi-hash me-1"></i>ID: {{ soutenance()!.doctorantId }}
                      </span>
                                            @if (soutenance()!.doctorantInfo?.email) {
                                                <span class="profile-email">
                          <i class="bi bi-envelope me-1"></i>{{ soutenance()!.doctorantInfo?.email }}
                        </span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- DIRECTEUR CARD -->
                            <div class="detail-card">
                                <div class="card-header-section">
                                    <div class="card-icon bg-success">
                                        <i class="bi bi-person-video3"></i>
                                    </div>
                                    <h3 class="card-title">Directeur de Thèse</h3>
                                </div>
                                <div class="card-body">
                                    <div class="profile-section">
                                        <div class="avatar-large bg-success-gradient">
                                            {{ getInitials(getDirecteurNom()) }}
                                        </div>
                                        <div class="profile-info">
                                            <h4 class="profile-name">{{ getDirecteurNom() }}</h4>
                                            <span class="profile-id">
                        <i class="bi bi-hash me-1"></i>ID: {{ soutenance()!.directeurId }}
                      </span>
                                            @if (soutenance()!.directeurInfo?.email) {
                                                <span class="profile-email">
                          <i class="bi bi-envelope me-1"></i>{{ soutenance()!.directeurInfo?.email }}
                        </span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- SUJET DE THÈSE -->
                            <div class="detail-card">
                                <div class="card-header-section">
                                    <div class="card-icon bg-info">
                                        <i class="bi bi-journal-text"></i>
                                    </div>
                                    <h3 class="card-title">Sujet de Thèse</h3>
                                </div>
                                <div class="card-body">
                                    <p class="these-text">{{ soutenance()!.titreThese || 'Sujet non défini' }}</p>
                                    @if (soutenance()!.resume) {
                                        <div class="resume-section">
                                            <h5>Résumé</h5>
                                            <p class="resume-text">{{ soutenance()!.resume }}</p>
                                        </div>
                                    }
                                </div>
                            </div>

                            <!-- PRÉREQUIS -->
                            <div class="detail-card">
                                <div class="card-header-section">
                                    <div class="card-icon" [ngClass]="prerequisValides() ? 'bg-success' : 'bg-warning'">
                                        <i class="bi" [ngClass]="prerequisValides() ? 'bi-check-circle' : 'bi-exclamation-circle'"></i>
                                    </div>
                                    <h3 class="card-title">Prérequis de Soutenance</h3>
                                    <span class="card-badge" [ngClass]="prerequisValides() ? 'badge-success' : 'badge-warning'">
                    {{ prerequisValides() ? 'Validés' : 'En cours' }}
                  </span>
                                </div>
                                <div class="card-body">
                                    @if (soutenance()!.prerequis) {
                                        <div class="prerequis-grid">
                                            <div class="prerequis-item" [class.completed]="soutenance()!.prerequis!.nombreArticlesQ1Q2 >= 2">
                                                <div class="prerequis-icon">
                                                    <i class="bi bi-journal-richtext"></i>
                                                </div>
                                                <div class="prerequis-info">
                                                    <span class="prerequis-label">Publications Q1/Q2</span>
                                                    <span class="prerequis-value">{{ soutenance()!.prerequis!.nombreArticlesQ1Q2 }} / 2</span>
                                                </div>
                                                <div class="prerequis-progress">
                                                    <div class="progress-bar" [style.width.%]="getProgressPercent(soutenance()!.prerequis!.nombreArticlesQ1Q2, 2)"></div>
                                                </div>
                                            </div>

                                            <div class="prerequis-item" [class.completed]="soutenance()!.prerequis!.nombreConferences >= 2">
                                                <div class="prerequis-icon">
                                                    <i class="bi bi-mic"></i>
                                                </div>
                                                <div class="prerequis-info">
                                                    <span class="prerequis-label">Conférences</span>
                                                    <span class="prerequis-value">{{ soutenance()!.prerequis!.nombreConferences }} / 2</span>
                                                </div>
                                                <div class="prerequis-progress">
                                                    <div class="progress-bar" [style.width.%]="getProgressPercent(soutenance()!.prerequis!.nombreConferences, 2)"></div>
                                                </div>
                                            </div>

                                            <div class="prerequis-item" [class.completed]="soutenance()!.prerequis!.heuresFormation >= 200">
                                                <div class="prerequis-icon">
                                                    <i class="bi bi-clock-history"></i>
                                                </div>
                                                <div class="prerequis-info">
                                                    <span class="prerequis-label">Heures de Formation</span>
                                                    <span class="prerequis-value">{{ soutenance()!.prerequis!.heuresFormation }} / 200h</span>
                                                </div>
                                                <div class="prerequis-progress">
                                                    <div class="progress-bar" [style.width.%]="getProgressPercent(soutenance()!.prerequis!.heuresFormation, 200)"></div>
                                                </div>
                                            </div>
                                        </div>
                                    } @else {
                                        <div class="empty-prerequis">
                                            <i class="bi bi-info-circle"></i>
                                            <p>Prérequis non encore soumis</p>
                                        </div>
                                    }
                                </div>
                            </div>

                        </div>

                        <!-- RIGHT COLUMN -->
                        <div class="right-column">

                            <!-- INFORMATIONS SOUTENANCE -->
                            <div class="detail-card">
                                <div class="card-header-section">
                                    <div class="card-icon bg-purple">
                                        <i class="bi bi-calendar-event"></i>
                                    </div>
                                    <h3 class="card-title">Informations de Soutenance</h3>
                                </div>
                                <div class="card-body">
                                    <div class="info-grid">
                                        <div class="info-item">
                                            <span class="info-label">Date prévue</span>
                                            <span class="info-value">
                        @if (soutenance()!.dateSoutenance) {
                            {{ soutenance()!.dateSoutenance | date:'EEEE dd MMMM yyyy' }}
                        } @else {
                            <span class="text-muted">Non définie</span>
                        }
                      </span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">Heure</span>
                                            <span class="info-value">
                        {{ soutenance()!.heureSoutenance || 'Non définie' }}
                      </span>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-label">Lieu</span>
                                            <span class="info-value">
                        {{ soutenance()!.lieuSoutenance || 'Non défini' }}
                      </span>
                                        </div>
                                        @if (soutenance()!.statut === StatutSoutenance.TERMINEE) {
                                            <div class="info-item highlight">
                                                <span class="info-label">Mention obtenue</span>
                                                <span class="info-value mention">
                          {{ soutenance()!.mention || 'Non attribuée' }}
                                                    @if (soutenance()!.felicitationsJury) {
                                                        <span class="felicitations-badge">
                              <i class="bi bi-star-fill"></i> Félicitations du jury
                            </span>
                                                    }
                        </span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>

                            <!-- JURY -->
                            <div class="detail-card">
                                <div class="card-header-section">
                                    <div class="card-icon bg-orange">
                                        <i class="bi bi-people"></i>
                                    </div>
                                    <h3 class="card-title">Composition du Jury</h3>
                                    <span class="card-count">{{ getMembresJuryCount() }} membres</span>
                                </div>
                                <div class="card-body">
                                    @if (hasMembresJury()) {
                                        <div class="jury-list">
                                            @for (membre of soutenance()!.membresJury; track membre.id) {
                                                <div class="jury-member" [ngClass]="getJuryRoleClass(membre.role)">
                                                    <div class="member-avatar">
                                                        {{ getInitials(membre.nom + ' ' + membre.prenom) }}
                                                    </div>
                                                    <div class="member-info">
                                                        <h5 class="member-name">{{ membre.prenom }} {{ membre.nom }}</h5>
                                                        <span class="member-etablissement">{{ membre.etablissement }}</span>
                                                        <span class="member-grade">{{ membre.grade }}</span>
                                                        <span class="member-email">
                              <i class="bi bi-envelope me-1"></i>{{ membre.email }}
                            </span>
                                                    </div>
                                                    <div class="member-role">
                                                        <span class="role-badge">{{ formatRoleJury(membre.role) }}</span>
                                                        @if (membre.rapportSoumis !== undefined) {
                                                            <span class="rapport-status"
                                                                  [class.received]="membre.rapportSoumis"
                                                                  [class.favorable]="membre.avisFavorable">
                                <i class="bi" [ngClass]="membre.rapportSoumis ? 'bi-check-circle-fill' : 'bi-hourglass-split'"></i>
                                                                {{ membre.rapportSoumis ? (membre.avisFavorable ? 'Favorable' : 'Défavorable') : 'En attente' }}
                              </span>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    } @else {
                                        <div class="empty-jury">
                                            <i class="bi bi-people"></i>
                                            <p>Aucun membre de jury assigné</p>
                                            <span class="empty-hint">Le jury sera proposé par le directeur de thèse</span>
                                        </div>
                                    }
                                </div>
                            </div>

                            <!-- TIMELINE / HISTORIQUE -->
                            <div class="detail-card">
                                <div class="card-header-section">
                                    <div class="card-icon bg-teal">
                                        <i class="bi bi-clock-history"></i>
                                    </div>
                                    <h3 class="card-title">Progression</h3>
                                </div>
                                <div class="card-body">
                                    <div class="timeline">
                                        <div class="timeline-item" [class.completed]="isStepCompleted('BROUILLON')" [class.active]="isCurrentStep('BROUILLON')">
                                            <div class="timeline-marker"></div>
                                            <div class="timeline-content">
                                                <span class="timeline-title">Brouillon</span>
                                                <span class="timeline-desc">Demande créée</span>
                                            </div>
                                        </div>
                                        <div class="timeline-item" [class.completed]="isStepCompleted('SOUMIS')" [class.active]="isCurrentStep('SOUMIS')">
                                            <div class="timeline-marker"></div>
                                            <div class="timeline-content">
                                                <span class="timeline-title">Soumis</span>
                                                <span class="timeline-desc">En attente de validation</span>
                                            </div>
                                        </div>
                                        <div class="timeline-item" [class.completed]="isStepCompleted('PREREQUIS_VALIDES')" [class.active]="isCurrentStep('PREREQUIS_VALIDES')">
                                            <div class="timeline-marker"></div>
                                            <div class="timeline-content">
                                                <span class="timeline-title">Prérequis validés</span>
                                                <span class="timeline-desc">Conditions remplies</span>
                                            </div>
                                        </div>
                                        <div class="timeline-item" [class.completed]="isStepCompleted('JURY_PROPOSE')" [class.active]="isCurrentStep('JURY_PROPOSE')">
                                            <div class="timeline-marker"></div>
                                            <div class="timeline-content">
                                                <span class="timeline-title">Jury proposé</span>
                                                <span class="timeline-desc">Composition à valider</span>
                                            </div>
                                        </div>
                                        <div class="timeline-item" [class.completed]="isStepCompleted('PLANIFIEE')" [class.active]="isCurrentStep('PLANIFIEE')">
                                            <div class="timeline-marker"></div>
                                            <div class="timeline-content">
                                                <span class="timeline-title">Planifiée</span>
                                                <span class="timeline-desc">Date et lieu fixés</span>
                                            </div>
                                        </div>
                                        <div class="timeline-item" [class.completed]="isStepCompleted('AUTORISEE')" [class.active]="isCurrentStep('AUTORISEE')">
                                            <div class="timeline-marker"></div>
                                            <div class="timeline-content">
                                                <span class="timeline-title">Autorisée</span>
                                                <span class="timeline-desc">Soutenance peut avoir lieu</span>
                                            </div>
                                        </div>
                                        <div class="timeline-item" [class.completed]="isStepCompleted('TERMINEE')" [class.active]="isCurrentStep('TERMINEE')">
                                            <div class="timeline-marker"></div>
                                            <div class="timeline-content">
                                                <span class="timeline-title">Terminée</span>
                                                <span class="timeline-desc">Thèse soutenue 🎓</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                    <!-- ACTIONS BAR -->
                    <div class="actions-bar">
                        <button class="btn-action btn-secondary" (click)="goBack()">
                            <i class="bi bi-arrow-left me-2"></i>Retour à la liste
                        </button>

                        <div class="actions-right">
                            @if (soutenance()!.statut === StatutSoutenance.SOUMIS) {
                                <button class="btn-action btn-success" (click)="validerPrerequis()">
                                    <i class="bi bi-check-lg me-2"></i>Valider les prérequis
                                </button>
                                <button class="btn-action btn-danger" (click)="rejeter()">
                                    <i class="bi bi-x-lg me-2"></i>Rejeter
                                </button>
                            }
                            @if (soutenance()!.statut === StatutSoutenance.JURY_PROPOSE) {
                                <button class="btn-action btn-primary" (click)="planifier()">
                                    <i class="bi bi-calendar-plus me-2"></i>Planifier la soutenance
                                </button>
                            }
                            @if (soutenance()!.statut === StatutSoutenance.PLANIFIEE) {
                                <button class="btn-action btn-success" (click)="autoriser()">
                                    <i class="bi bi-check-circle me-2"></i>Autoriser la soutenance
                                </button>
                            }
                            @if (soutenance()!.statut === StatutSoutenance.AUTORISEE) {
                                <button class="btn-action btn-purple" (click)="marquerTerminee()">
                                    <i class="bi bi-mortarboard me-2"></i>Marquer comme terminée
                                </button>
                            }
                            @if (soutenance()!.statut === StatutSoutenance.TERMINEE) {
                                <button class="btn-action btn-info" (click)="genererPV()">
                                    <i class="bi bi-file-earmark-pdf me-2"></i>Générer le PV
                                </button>
                                <button class="btn-action btn-info" (click)="genererAttestation()">
                                    <i class="bi bi-award me-2"></i>Générer l'attestation
                                </button>
                            }
                        </div>
                    </div>
                }

            </div>
        </app-main-layout>
    `,
    styles: [`
      .page-container {
        max-width: 1400px;
        margin: 0 auto;
      }

      /* LOADING & ERROR */
      .loading-container,
      .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        background: white;
        border-radius: 20px;
        padding: 3rem;
      }

      .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #e2e8f0;
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-bottom: 1rem;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .error-icon {
        width: 80px;
        height: 80px;
        background: #fee2e2;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .error-icon i {
        font-size: 2.5rem;
        color: #dc2626;
      }

      .btn-back {
        margin-top: 1rem;
        padding: 0.75rem 1.5rem;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
      }

      /* HEADER */
      .page-header {
        border-radius: 24px;
        padding: 2rem;
        color: white;
        margin-bottom: 2rem;
        position: relative;
        overflow: hidden;
      }

      .page-header::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -10%;
        width: 300px;
        height: 300px;
        background: rgba(255,255,255,0.1);
        border-radius: 50%;
      }

      .page-header.header-soumis {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      }

      .page-header.header-valide {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      }

      .page-header.header-planifiee {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      }

      .page-header.header-terminee {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      }

      .page-header.header-rejetee {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      }

      .page-header.header-default {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .btn-back-header {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        transition: all 0.2s;
      }

      .btn-back-header:hover {
        background: rgba(255,255,255,0.3);
        transform: translateX(-4px);
      }

      .status-badge-large {
        padding: 0.5rem 1.25rem;
        background: rgba(255,255,255,0.2);
        border-radius: 30px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .page-title {
        font-size: 2rem;
        font-weight: 800;
        margin: 0 0 0.5rem 0;
      }

      .page-subtitle {
        margin: 0;
        opacity: 0.9;
        font-size: 1.1rem;
      }

      .header-meta {
        display: flex;
        gap: 1.5rem;
        margin-top: 1.5rem;
      }

      .header-meta .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        opacity: 0.9;
      }

      /* CONTENT GRID */
      .content-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      /* DETAIL CARDS */
      .detail-card {
        background: white;
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        border: 1px solid #e2e8f0;
      }

      .card-header-section {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.25rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #f1f5f9;
      }

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        color: white;
      }

      .card-icon.bg-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      .card-icon.bg-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
      .card-icon.bg-info { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
      .card-icon.bg-warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
      .card-icon.bg-purple { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
      .card-icon.bg-orange { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }
      .card-icon.bg-teal { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); }

      .card-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
        flex: 1;
      }

      .card-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .card-badge.badge-success { background: #dcfce7; color: #16a34a; }
      .card-badge.badge-warning { background: #fef3c7; color: #d97706; }

      .card-count {
        font-size: 0.85rem;
        color: #64748b;
        font-weight: 600;
      }

      /* PROFILE SECTION */
      .profile-section {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .avatar-large {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .bg-success-gradient {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      }

      .profile-name {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 0.25rem 0;
      }

      .profile-id, .profile-email {
        font-size: 0.85rem;
        color: #64748b;
        display: block;
      }

      /* THESE TEXT */
      .these-text {
        font-size: 1rem;
        line-height: 1.7;
        color: #334155;
        margin: 0;
      }

      .resume-section {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
      }

      .resume-section h5 {
        font-size: 0.9rem;
        color: #64748b;
        margin: 0 0 0.5rem 0;
      }

      .resume-text {
        font-size: 0.9rem;
        color: #64748b;
        line-height: 1.6;
      }

      /* PREREQUIS GRID */
      .prerequis-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .prerequis-item {
        display: grid;
        grid-template-columns: 48px 1fr;
        gap: 1rem;
        align-items: center;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 12px;
        position: relative;
      }

      .prerequis-item.completed {
        background: #f0fdf4;
      }

      .prerequis-item.completed .prerequis-icon {
        background: #dcfce7;
        color: #16a34a;
      }

      .prerequis-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: #e2e8f0;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
      }

      .prerequis-label {
        font-size: 0.85rem;
        color: #64748b;
        display: block;
      }

      .prerequis-value {
        font-size: 1rem;
        font-weight: 700;
        color: #1e293b;
      }

      .prerequis-progress {
        grid-column: span 2;
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
        margin-top: 0.5rem;
      }

      .prerequis-progress .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #059669);
        border-radius: 3px;
        transition: width 0.3s;
      }

      .empty-prerequis {
        text-align: center;
        padding: 2rem;
        color: #64748b;
      }

      .empty-prerequis i {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      /* INFO GRID */
      .info-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 12px;
      }

      .info-item.highlight {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      }

      .info-label {
        font-size: 0.85rem;
        color: #64748b;
        font-weight: 500;
      }

      .info-value {
        font-weight: 700;
        color: #1e293b;
      }

      .info-value.mention {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .text-muted {
        color: #94a3b8;
        font-weight: 400;
      }

      .felicitations-badge {
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        font-size: 0.7rem;
        font-weight: 600;
      }

      /* JURY LIST */
      .jury-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .jury-member {
        display: grid;
        grid-template-columns: 48px 1fr auto;
        gap: 1rem;
        align-items: center;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 12px;
        border-left: 4px solid #e2e8f0;
      }

      .jury-member.role-president { border-left-color: #f59e0b; }
      .jury-member.role-rapporteur { border-left-color: #3b82f6; }
      .jury-member.role-examinateur { border-left-color: #10b981; }
      .jury-member.role-directeur { border-left-color: #8b5cf6; }
      .jury-member.role-co_directeur { border-left-color: #ec4899; }

      .member-avatar {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }

      .member-name {
        font-size: 0.95rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 0.25rem 0;
      }

      .member-etablissement, .member-grade {
        font-size: 0.8rem;
        color: #64748b;
        display: block;
      }

      .member-email {
        font-size: 0.75rem;
        color: #94a3b8;
      }

      .member-role {
        text-align: right;
      }

      .role-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: #e2e8f0;
        color: #475569;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .rapport-status {
        display: block;
        font-size: 0.7rem;
        color: #94a3b8;
      }

      .rapport-status.received { color: #f59e0b; }
      .rapport-status.favorable { color: #16a34a; }

      .empty-jury {
        text-align: center;
        padding: 2rem;
        color: #64748b;
      }

      .empty-jury i {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
      }

      .empty-hint {
        display: block;
        font-size: 0.8rem;
        margin-top: 0.5rem;
        opacity: 0.7;
      }

      /* TIMELINE */
      .timeline {
        position: relative;
        padding-left: 24px;
      }

      .timeline::before {
        content: '';
        position: absolute;
        left: 7px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e2e8f0;
      }

      .timeline-item {
        position: relative;
        padding: 1rem 0;
        padding-left: 24px;
      }

      .timeline-marker {
        position: absolute;
        left: -24px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: white;
        border: 2px solid #e2e8f0;
      }

      .timeline-item.completed .timeline-marker {
        background: #10b981;
        border-color: #10b981;
      }

      .timeline-item.active .timeline-marker {
        background: #667eea;
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
      }

      .timeline-title {
        font-weight: 700;
        color: #1e293b;
        display: block;
      }

      .timeline-desc {
        font-size: 0.8rem;
        color: #64748b;
      }

      .timeline-item.completed .timeline-title {
        color: #10b981;
      }

      .timeline-item.active .timeline-title {
        color: #667eea;
      }

      /* ACTIONS BAR */
      .actions-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        border: 1px solid #e2e8f0;
      }

      .actions-right {
        display: flex;
        gap: 1rem;
      }

      .btn-action {
        padding: 0.875rem 1.5rem;
        border: none;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        transition: all 0.2s;
      }

      .btn-action:hover {
        transform: translateY(-2px);
      }

      .btn-action.btn-secondary {
        background: #f1f5f9;
        color: #475569;
      }

      .btn-action.btn-primary {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
      }

      .btn-action.btn-success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
      }

      .btn-action.btn-danger {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
      }

      .btn-action.btn-purple {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
      }

      .btn-action.btn-info {
        background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
        color: white;
      }

      /* RESPONSIVE */
      @media (max-width: 1024px) {
        .content-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 768px) {
        .page-header {
          padding: 1.5rem;
        }

        .page-title {
          font-size: 1.5rem;
        }

        .header-meta {
          flex-direction: column;
          gap: 0.5rem;
        }

        .actions-bar {
          flex-direction: column;
          gap: 1rem;
        }

        .actions-right {
          flex-wrap: wrap;
          justify-content: center;
        }

        .jury-member {
          grid-template-columns: 1fr;
          text-align: center;
        }

        .member-avatar {
          margin: 0 auto;
        }

        .member-role {
          text-align: center;
        }
      }
    `]
})
export class SoutenanceDetailComponent implements OnInit {
    // Exposer les enums au template
    StatutSoutenance = StatutSoutenance;
    RoleJury = RoleJury;

    soutenance = signal<Soutenance | null>(null);
    isLoading = signal(true);
    error = signal<string | null>(null);

    // Ordre des statuts pour la timeline
    private statutOrder = [
        StatutSoutenance.BROUILLON,
        StatutSoutenance.SOUMIS,
        StatutSoutenance.PREREQUIS_VALIDES,
        StatutSoutenance.JURY_PROPOSE,
        StatutSoutenance.PLANIFIEE,
        StatutSoutenance.AUTORISEE,
        StatutSoutenance.TERMINEE
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private soutenanceService: SoutenanceService
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadSoutenance(+id);
        } else {
            this.error.set('ID de soutenance invalide');
            this.isLoading.set(false);
        }
    }

    loadSoutenance(id: number): void {
        this.isLoading.set(true);
        this.soutenanceService.getSoutenanceById(id).subscribe({
            next: (data: Soutenance) => {
                this.soutenance.set(data);
                this.isLoading.set(false);
            },
            error: (err: Error) => {
                console.error('Erreur:', err);
                this.error.set('Impossible de charger les détails de la soutenance');
                this.isLoading.set(false);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/admin/soutenances']);
    }

    // ============================================
    // HELPER METHODS - Adaptées au backend
    // ============================================

    getDoctorantNom(): string {
        const s = this.soutenance();
        if (s?.doctorantInfo) {
            return `${s.doctorantInfo.prenom} ${s.doctorantInfo.nom}`;
        }
        return 'Doctorant #' + (s?.doctorantId || '?');
    }

    getDirecteurNom(): string {
        const s = this.soutenance();
        if (s?.directeurInfo) {
            return `${s.directeurInfo.prenom} ${s.directeurInfo.nom}`;
        }
        return 'Directeur #' + (s?.directeurId || '?');
    }

    getProgressPercent(value: number, max: number): number {
        return Math.min((value / max) * 100, 100);
    }

    prerequisValides(): boolean {
        const prereq = this.soutenance()?.prerequis;
        if (!prereq) return false;
        // Utiliser le champ backend OU calculer
        if (prereq.prerequisValides !== undefined) {
            return prereq.prerequisValides;
        }
        return (
            prereq.nombreArticlesQ1Q2 >= 2 &&
            prereq.nombreConferences >= 2 &&
            prereq.heuresFormation >= 200
        );
    }

    hasMembresJury(): boolean {
        const membres = this.soutenance()?.membresJury;
        return !!membres && membres.length > 0;
    }

    getMembresJuryCount(): number {
        return this.soutenance()?.membresJury?.length || 0;
    }

    isStepCompleted(step: string): boolean {
        const currentStatut = this.soutenance()?.statut;
        if (!currentStatut) return false;

        const currentIndex = this.statutOrder.indexOf(currentStatut);
        const stepStatut = step as StatutSoutenance;
        const stepIndex = this.statutOrder.indexOf(stepStatut);

        return stepIndex < currentIndex;
    }

    isCurrentStep(step: string): boolean {
        return this.soutenance()?.statut === step;
    }

    // ============================================
    // DISPLAY HELPERS
    // ============================================

    getHeaderClass(): string {
        const statut = this.soutenance()?.statut;
        switch (statut) {
            case StatutSoutenance.SOUMIS: return 'header-soumis';
            case StatutSoutenance.PREREQUIS_VALIDES:
            case StatutSoutenance.JURY_PROPOSE: return 'header-valide';
            case StatutSoutenance.PLANIFIEE:
            case StatutSoutenance.AUTORISEE: return 'header-planifiee';
            case StatutSoutenance.TERMINEE: return 'header-terminee';
            case StatutSoutenance.REJETEE: return 'header-rejetee';
            default: return 'header-default';
        }
    }

    getStatusIcon(): string {
        const statut = this.soutenance()?.statut;
        switch (statut) {
            case StatutSoutenance.BROUILLON: return 'bi-pencil';
            case StatutSoutenance.SOUMIS: return 'bi-clock-history';
            case StatutSoutenance.PREREQUIS_VALIDES: return 'bi-check-circle';
            case StatutSoutenance.JURY_PROPOSE: return 'bi-people';
            case StatutSoutenance.PLANIFIEE: return 'bi-calendar-check';
            case StatutSoutenance.AUTORISEE: return 'bi-check-circle-fill';
            case StatutSoutenance.TERMINEE: return 'bi-mortarboard';
            case StatutSoutenance.REJETEE: return 'bi-x-circle';
            default: return 'bi-file-earmark';
        }
    }

    formatStatut(statut: StatutSoutenance): string {
        const labels: Record<string, string> = {
            'BROUILLON': 'Brouillon',
            'SOUMIS': 'En attente',
            'PREREQUIS_VALIDES': 'Prérequis validés',
            'JURY_PROPOSE': 'Jury proposé',
            'PLANIFIEE': 'Planifiée',
            'AUTORISEE': 'Autorisée',
            'TERMINEE': 'Terminée',
            'REJETEE': 'Rejetée'
        };
        return labels[statut] || statut;
    }

    formatRoleJury(role: RoleJury): string {
        const labels: Record<string, string> = {
            'PRESIDENT': 'Président',
            'RAPPORTEUR': 'Rapporteur',
            'EXAMINATEUR': 'Examinateur',
            'DIRECTEUR': 'Directeur',
            'CO_DIRECTEUR': 'Co-directeur'
        };
        return labels[role] || role;
    }

    getJuryRoleClass(role: RoleJury): string {
        return 'role-' + role.toLowerCase();
    }

    getInitials(name: string): string {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    }

    getAvatarColor(id: number): string {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
        ];
        return colors[(id || 0) % colors.length];
    }

    // ============================================
    // ACTIONS
    // ============================================

    validerPrerequis(): void {
        if (confirm('Valider les prérequis de cette soutenance ?')) {
            alert('Prérequis validés ! (À implémenter avec le service)');
        }
    }

    rejeter(): void {
        const motif = prompt('Motif du rejet :');
        if (motif) {
            alert('Soutenance rejetée ! (À implémenter avec le service)');
        }
    }

    planifier(): void {
        alert('Ouvrir le modal de planification (À implémenter)');
    }

    autoriser(): void {
        if (confirm('Autoriser cette soutenance à avoir lieu ?')) {
            alert('Soutenance autorisée ! (À implémenter avec le service)');
        }
    }

    marquerTerminee(): void {
        alert('Ouvrir le modal pour saisir la mention (À implémenter)');
    }

    genererPV(): void {
        alert('Génération du PV de soutenance... (À implémenter avec le service document)');
    }

    genererAttestation(): void {
        alert('Génération de l\'attestation... (À implémenter avec le service document)');
    }
}