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

                <!-- Hero Header -->
                <div class="hero-section">
                    <div class="hero-content">
                        <div class="hero-icon">
                            <i class="bi bi-mortarboard"></i>
                        </div>
                        <div>
                            <h1 class="hero-title">Gestion des Soutenances</h1>
                            <p class="hero-subtitle">Validez les demandes et proposez les membres du jury</p>
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
                            <span class="stat-value">{{ getPendingValidationCount() }}</span>
                            <span class="stat-label">À valider</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon jury-needed">
                            <i class="bi bi-people"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ getJuryNeededCount() }}</span>
                            <span class="stat-label">Jury à proposer</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon approved">
                            <i class="bi bi-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ getCompletedCount() }}</span>
                            <span class="stat-label">Traitées</span>
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
                                                @if (needsDirectorAction(soutenance.statut)) {
                                                    <span class="meta-item action-needed">
                                                        <i class="bi bi-exclamation-circle-fill"></i>
                                                        {{ getActionNeededText(soutenance.statut) }}
                                                    </span>
                                                } @else {
                                                    <span class="meta-item prereq" [class.valid]="arePrerequisValid(soutenance)">
                                                        <i class="bi" [ngClass]="arePrerequisValid(soutenance) ? 'bi-check-circle-fill' : 'bi-exclamation-circle'"></i>
                                                        {{ arePrerequisValid(soutenance) ? 'Prérequis OK' : 'Prérequis incomplets' }}
                                                    </span>
                                                }
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
                                                <!-- Prérequis Section -->
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

                                                <!-- Documents Section -->
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

                                                <!-- ========== ACTION: VALIDATION PREREQUIS (Statut: SOUMIS) ========== -->
                                                @if (soutenance.statut === 'SOUMIS') {
                                                    <div class="detail-section actions">
                                                        <h5 class="detail-title">
                                                            <i class="bi bi-check2-square"></i>
                                                            Validation des prérequis
                                                        </h5>

                                                        @if (!showDecisionForm() || currentSoutenanceId !== soutenance.id) {
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
                                                        } @else if (decisionType() === 'reject') {
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

                                                <!-- ========== ACTION: PROPOSITION JURY (Statut: PREREQUIS_VALIDES) ========== -->
                                                @if (soutenance.statut === 'PREREQUIS_VALIDES') {
                                                    <div class="detail-section jury-section">
                                                        <h5 class="detail-title">
                                                            <i class="bi bi-people-fill"></i>
                                                            Sélection des membres du jury
                                                        </h5>

                                                        <p class="jury-info">
                                                            <i class="bi bi-info-circle"></i>
                                                            Sélectionnez un membre pour chaque rôle du jury.
                                                        </p>

                                                        <!-- 3 Dropdowns pour les jurys -->
                                                        <div class="jury-dropdowns-container">
                                                            <!-- Dropdown Président -->
                                                            <div class="jury-dropdown-card president">
                                                                <div class="dropdown-header">
                                                                    <div class="role-icon president">
                                                                        <i class="bi bi-star-fill"></i>
                                                                    </div>
                                                                    <div class="role-info">
                                                                        <span class="role-title">Président du Jury</span>
                                                                        <span class="role-required">Obligatoire</span>
                                                                    </div>
                                                                </div>
                                                                <select class="jury-select"
                                                                        [(ngModel)]="jurySelection.presidentId"
                                                                        (ngModelChange)="onJurySelectionChange()">
                                                                    <option [ngValue]="null">-- Sélectionner un président --</option>
                                                                    @for (membre of presidentsDisponibles(); track membre.id) {
                                                                        <option [ngValue]="membre.id">
                                                                            {{ membre.prenom }} {{ membre.nom }} - {{ membre.etablissement }}
                                                                        </option>
                                                                    }
                                                                </select>
                                                                @if (getSelectedPresident()) {
                                                                    <div class="selected-membre-info">
                                                                        <div class="membre-detail">
                                                                            <i class="bi bi-mortarboard"></i>
                                                                            {{ getSelectedPresident()?.grade }}
                                                                        </div>
                                                                        <div class="membre-detail">
                                                                            <i class="bi bi-envelope"></i>
                                                                            {{ getSelectedPresident()?.email }}
                                                                        </div>
                                                                        @if (getSelectedPresident()?.specialite) {
                                                                            <div class="membre-detail">
                                                                                <i class="bi bi-bookmark"></i>
                                                                                {{ getSelectedPresident()?.specialite }}
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                }
                                                            </div>

                                                            <!-- Dropdown Rapporteur -->
                                                            <div class="jury-dropdown-card rapporteur">
                                                                <div class="dropdown-header">
                                                                    <div class="role-icon rapporteur">
                                                                        <i class="bi bi-file-earmark-text-fill"></i>
                                                                    </div>
                                                                    <div class="role-info">
                                                                        <span class="role-title">Rapporteur</span>
                                                                        <span class="role-required">Obligatoire</span>
                                                                    </div>
                                                                </div>
                                                                <select class="jury-select"
                                                                        [(ngModel)]="jurySelection.rapporteurId"
                                                                        (ngModelChange)="onJurySelectionChange()">
                                                                    <option [ngValue]="null">-- Sélectionner un rapporteur --</option>
                                                                    @for (membre of rapporteursDisponibles(); track membre.id) {
                                                                        <option [ngValue]="membre.id">
                                                                            {{ membre.prenom }} {{ membre.nom }} - {{ membre.etablissement }}
                                                                        </option>
                                                                    }
                                                                </select>
                                                                @if (getSelectedRapporteur()) {
                                                                    <div class="selected-membre-info">
                                                                        <div class="membre-detail">
                                                                            <i class="bi bi-mortarboard"></i>
                                                                            {{ getSelectedRapporteur()?.grade }}
                                                                        </div>
                                                                        <div class="membre-detail">
                                                                            <i class="bi bi-envelope"></i>
                                                                            {{ getSelectedRapporteur()?.email }}
                                                                        </div>
                                                                        @if (getSelectedRapporteur()?.specialite) {
                                                                            <div class="membre-detail">
                                                                                <i class="bi bi-bookmark"></i>
                                                                                {{ getSelectedRapporteur()?.specialite }}
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                }
                                                            </div>

                                                            <!-- Dropdown Examinateur -->
                                                            <div class="jury-dropdown-card examinateur">
                                                                <div class="dropdown-header">
                                                                    <div class="role-icon examinateur">
                                                                        <i class="bi bi-search"></i>
                                                                    </div>
                                                                    <div class="role-info">
                                                                        <span class="role-title">Examinateur</span>
                                                                        <span class="role-required">Obligatoire</span>
                                                                    </div>
                                                                </div>
                                                                <select class="jury-select"
                                                                        [(ngModel)]="jurySelection.examinateurId"
                                                                        (ngModelChange)="onJurySelectionChange()">
                                                                    <option [ngValue]="null">-- Sélectionner un examinateur --</option>
                                                                    @for (membre of examinateursDisponibles(); track membre.id) {
                                                                        <option [ngValue]="membre.id">
                                                                            {{ membre.prenom }} {{ membre.nom }} - {{ membre.etablissement }}
                                                                        </option>
                                                                    }
                                                                </select>
                                                                @if (getSelectedExaminateur()) {
                                                                    <div class="selected-membre-info">
                                                                        <div class="membre-detail">
                                                                            <i class="bi bi-mortarboard"></i>
                                                                            {{ getSelectedExaminateur()?.grade }}
                                                                        </div>
                                                                        <div class="membre-detail">
                                                                            <i class="bi bi-envelope"></i>
                                                                            {{ getSelectedExaminateur()?.email }}
                                                                        </div>
                                                                        @if (getSelectedExaminateur()?.specialite) {
                                                                            <div class="membre-detail">
                                                                                <i class="bi bi-bookmark"></i>
                                                                                {{ getSelectedExaminateur()?.specialite }}
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                }
                                                            </div>
                                                        </div>

                                                        <!-- Validation Summary -->
                                                        <div class="jury-validation">
                                                            <div class="jury-summary">
                                                                <span class="summary-item" [class.valid]="jurySelection.presidentId">
                                                                    <i class="bi" [ngClass]="jurySelection.presidentId ? 'bi-check-circle-fill' : 'bi-circle'"></i>
                                                                    Président
                                                                </span>
                                                                <span class="summary-item" [class.valid]="jurySelection.rapporteurId">
                                                                    <i class="bi" [ngClass]="jurySelection.rapporteurId ? 'bi-check-circle-fill' : 'bi-circle'"></i>
                                                                    Rapporteur
                                                                </span>
                                                                <span class="summary-item" [class.valid]="jurySelection.examinateurId">
                                                                    <i class="bi" [ngClass]="jurySelection.examinateurId ? 'bi-check-circle-fill' : 'bi-circle'"></i>
                                                                    Examinateur
                                                                </span>
                                                            </div>

                                                            @if (!isJurySelectionValid()) {
                                                                <div class="jury-warning">
                                                                    <i class="bi bi-exclamation-triangle"></i>
                                                                    Veuillez sélectionner un membre pour chaque rôle.
                                                                </div>
                                                            }

                                                            <div class="jury-actions">
                                                                <button class="btn-action validate full-width"
                                                                        [disabled]="!isJurySelectionValid() || isSubmitting()"
                                                                        (click)="submitJurySelection(soutenance.id, $event)">
                                                                    @if (isSubmitting()) {
                                                                        <span class="spinner-sm"></span>
                                                                        Envoi en cours...
                                                                    } @else {
                                                                        <i class="bi bi-send-check"></i>
                                                                        Soumettre la proposition de jury
                                                                    }
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }

                                                <!-- ========== AFFICHAGE: JURY PROPOSÉ ========== -->
                                                @if (['JURY_PROPOSE', 'AUTORISEE', 'PLANIFIEE', 'TERMINEE'].includes(soutenance.statut) && soutenance.membresJury?.length > 0) {
                                                    <div class="detail-section jury-display">
                                                        <h5 class="detail-title">
                                                            <i class="bi bi-people-fill"></i>
                                                            Membres du jury
                                                            @if (soutenance.statut === 'JURY_PROPOSE') {
                                                                <span class="waiting-badge">En attente validation admin</span>
                                                            }
                                                            @if (soutenance.statut === 'AUTORISEE') {
                                                                <span class="approved-badge">Jury validé</span>
                                                            }
                                                        </h5>

                                                        <div class="jury-list">
                                                            @for (membre of soutenance.membresJury; track membre.id) {
                                                                <div class="jury-display-card">
                                                                    <div class="jury-avatar">
                                                                        <i class="bi bi-person-circle"></i>
                                                                    </div>
                                                                    <div class="jury-info-display">
                                                                        <span class="jury-name">{{ membre.prenom }} {{ membre.nom }}</span>
                                                                        <span class="jury-details">
                                                                            @if (membre.grade) {
                                                                                {{ membre.grade }}
                                                                            }
                                                                            @if (membre.etablissement) {
                                                                                - {{ membre.etablissement }}
                                                                            }
                                                                        </span>
                                                                        <span class="jury-email">{{ membre.email }}</span>
                                                                    </div>
                                                                    <span class="jury-role-badge" [ngClass]="getRoleBadgeClass(membre.role)">
                                                                        {{ formatRole(membre.role) }}
                                                                    </span>
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>
                                                }

                                                <!-- ========== AFFICHAGE: DATE SOUTENANCE ========== -->
                                                @if (soutenance.statut === 'PLANIFIEE' && soutenance.dateSoutenance) {
                                                    <div class="detail-section date-section">
                                                        <h5 class="detail-title">
                                                            <i class="bi bi-calendar-event"></i>
                                                            Soutenance planifiée
                                                        </h5>
                                                        <div class="date-display">
                                                            <div class="date-icon">
                                                                <i class="bi bi-calendar-check-fill"></i>
                                                            </div>
                                                            <div class="date-info">
                                                                <span class="date-value">{{ soutenance.dateSoutenance | date:'EEEE dd MMMM yyyy' }}</span>
                                                                @if (soutenance.heureSoutenance) {
                                                                    <span class="time-value">
                                                                        <i class="bi bi-clock"></i>
                                                                        {{ soutenance.heureSoutenance }}
                                                                    </span>
                                                                }
                                                                @if (soutenance.lieuSoutenance) {
                                                                    <span class="location-value">
                                                                        <i class="bi bi-geo-alt"></i>
                                                                        {{ soutenance.lieuSoutenance }}
                                                                    </span>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                }

                                                <!-- ========== STATUTS D'ATTENTE ========== -->
                                                @if (soutenance.statut === 'JURY_PROPOSE') {
                                                    <div class="detail-section waiting-section">
                                                        <div class="waiting-content">
                                                            <div class="waiting-icon">
                                                                <i class="bi bi-hourglass-split"></i>
                                                            </div>
                                                            <div class="waiting-text">
                                                                <h6>En attente de validation</h6>
                                                                <p>Vous avez proposé le jury. L'administration doit maintenant valider votre proposition.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }

                                                @if (soutenance.statut === 'AUTORISEE') {
                                                    <div class="detail-section success-section">
                                                        <div class="success-content">
                                                            <div class="success-icon">
                                                                <i class="bi bi-check-circle-fill"></i>
                                                            </div>
                                                            <div class="success-text">
                                                                <h6>Jury validé par l'administration</h6>
                                                                <p>L'administration doit maintenant planifier la date de soutenance.</p>
                                                            </div>
                                                        </div>
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

                <!-- Toast Notification -->
                @if (toastMessage()) {
                    <div class="toast" [class.success]="toastType() === 'success'" [class.error]="toastType() === 'error'">
                        <i class="bi" [ngClass]="toastType() === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'"></i>
                        {{ toastMessage() }}
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
      .btn-refresh:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
      .hero-decoration { position: absolute; right: 0; top: 0; bottom: 0; width: 200px; }
      .decoration-circle { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.1); }
      .c1 { width: 120px; height: 120px; top: -30px; right: 40px; }
      .c2 { width: 80px; height: 80px; bottom: -20px; right: 120px; }
      .spinner, .spinner-sm { border-radius: 50%; animation: spin 0.8s linear infinite; }
      .spinner { width: 18px; height: 18px; border: 2px solid rgba(109, 40, 217, 0.2); border-top-color: #6d28d9; }
      .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; display: inline-block; }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* Stats Grid */
      .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
      .stat-card { background: white; border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0; }
      .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
      .stat-icon.pending { background: #fef3c7; color: #f59e0b; }
      .stat-icon.jury-needed { background: #dbeafe; color: #3b82f6; }
      .stat-icon.approved { background: #dcfce7; color: #22c55e; }
      .stat-icon.total { background: #ede9fe; color: #8b5cf6; }
      .stat-info { display: flex; flex-direction: column; }
      .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
      .stat-label { font-size: 0.75rem; color: #64748b; }

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
      .status-indicator.jury { background: #ede9fe; color: #8b5cf6; }
      .status-indicator.jury-pending { background: #fef3c7; color: #f59e0b; }

      /* Content Area */
      .card-content { flex: 1; }
      .card-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
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
      .status-badge.jury { background: #ede9fe; color: #7c3aed; }
      .status-badge.jury-pending { background: #fef3c7; color: #b45309; }

      .thesis-title { font-size: 0.95rem; font-weight: 600; color: #334155; margin: 0.5rem 0; line-height: 1.4; }
      .card-meta { display: flex; gap: 1rem; flex-wrap: wrap; }
      .meta-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: #64748b; }
      .meta-item.prereq { color: #f59e0b; }
      .meta-item.prereq.valid { color: #22c55e; }
      .meta-item.action-needed { color: #ef4444; font-weight: 600; animation: pulse 2s infinite; }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

      .card-right { padding-left: 1rem; }
      .expand-icon { color: #94a3b8; font-size: 1.25rem; transition: transform 0.3s; }
      .expand-icon.rotated { transform: rotate(180deg); }

      /* Details Panel */
      .card-details { background: white; border-top: 1px solid #e2e8f0; padding: 1.5rem; animation: slideDown 0.3s ease-out; }
      @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      .details-grid { display: flex; flex-direction: column; gap: 1.5rem; }
      .detail-section { background: #f8fafc; border-radius: 14px; padding: 1.25rem; border: 1px solid #e2e8f0; }
      .detail-section.actions { border-left: 4px solid #8b5cf6; }
      .detail-section.jury-section { border-left: 4px solid #3b82f6; background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%); }
      .detail-section.jury-display { border-left: 4px solid #22c55e; }
      .detail-section.date-section { border-left: 4px solid #f59e0b; background: linear-gradient(135deg, #fefce8 0%, #f8fafc 100%); }
      .detail-section.waiting-section { border-left: 4px solid #94a3b8; background: #f1f5f9; }
      .detail-section.success-section { border-left: 4px solid #22c55e; background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%); }
      .detail-title { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem; display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
      .waiting-badge { font-size: 0.7rem; padding: 0.25rem 0.5rem; background: #fef3c7; color: #b45309; border-radius: 4px; text-transform: none; letter-spacing: 0; margin-left: auto; font-weight: 500; }
      .approved-badge { font-size: 0.7rem; padding: 0.25rem 0.5rem; background: #dcfce7; color: #15803d; border-radius: 4px; text-transform: none; letter-spacing: 0; margin-left: auto; font-weight: 500; }

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

      /* Action Buttons & Forms */
      .action-buttons { display: flex; gap: 1rem; }
      .btn-action { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem 1rem; border: none; border-radius: 10px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
      .btn-action.full-width { width: 100%; }
      .btn-action.validate { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; }
      .btn-action.validate:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.35); }
      .btn-action.validate:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      .btn-action.reject { background: white; color: #f59e0b; border: 2px solid #fcd34d; }
      .btn-action.reject:hover { background: #fef3c7; }

      .decision-form { padding: 1rem; border-radius: 12px; }
      .decision-form.validate-form { background: #f0fdf4; border: 1px solid #86efac; }
      .decision-form.reject-form { background: #fffbeb; border: 1px solid #fcd34d; }
      .decision-info { display: flex; align-items: flex-start; gap: 0.5rem; margin: 0 0 1rem; font-size: 0.875rem; color: #15803d; }
      .decision-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: #b45309; margin-bottom: 0.5rem; }
      .decision-textarea { width: 100%; padding: 0.75rem; border: 1px solid #fcd34d; border-radius: 8px; font-size: 0.9rem; resize: none; background: white; font-family: inherit; }
      .decision-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
      .btn-cancel { padding: 0.75rem 1.25rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; color: #64748b; font-weight: 600; cursor: pointer; }
      .btn-confirm { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
      .btn-confirm.validate { background: #22c55e; color: white; }
      .btn-confirm.reject { background: #f59e0b; color: white; }
      .btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

      /* ========== JURY DROPDOWN STYLES ========== */
      .jury-info { display: flex; align-items: flex-start; gap: 0.5rem; margin: 0 0 1.5rem; font-size: 0.875rem; color: #1d4ed8; background: white; padding: 1rem; border-radius: 8px; border: 1px solid #bfdbfe; }
      .jury-dropdowns-container { display: flex; flex-direction: column; gap: 1rem; }

      .jury-dropdown-card { background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 1rem; transition: all 0.2s; }
      .jury-dropdown-card.president { border-color: #fcd34d; }
      .jury-dropdown-card.rapporteur { border-color: #93c5fd; }
      .jury-dropdown-card.examinateur { border-color: #86efac; }

      .dropdown-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
      .role-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
      .role-icon.president { background: #fef3c7; color: #b45309; }
      .role-icon.rapporteur { background: #dbeafe; color: #1d4ed8; }
      .role-icon.examinateur { background: #dcfce7; color: #15803d; }
      .role-info { display: flex; flex-direction: column; }
      .role-title { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
      .role-required { font-size: 0.75rem; color: #ef4444; }

      .jury-select { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; background: white; cursor: pointer; transition: all 0.2s; }
      .jury-select:focus { outline: none; border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1); }

      .selected-membre-info { margin-top: 0.75rem; padding: 0.75rem; background: #f8fafc; border-radius: 8px; display: flex; flex-direction: column; gap: 0.35rem; }
      .membre-detail { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #64748b; }
      .membre-detail i { color: #8b5cf6; width: 16px; }

      /* Jury Validation */
      .jury-validation { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; }
      .jury-summary { display: flex; gap: 1.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
      .summary-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #94a3b8; }
      .summary-item.valid { color: #22c55e; }
      .jury-warning { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: #fef3c7; border-radius: 8px; color: #b45309; font-size: 0.85rem; margin-bottom: 1rem; }
      .jury-actions { display: flex; justify-content: stretch; }

      /* ========== JURY DISPLAY STYLES ========== */
      .jury-list { display: flex; flex-direction: column; gap: 0.75rem; }
      .jury-display-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border-radius: 10px; border: 1px solid #e2e8f0; }
      .jury-avatar { width: 44px; height: 44px; background: #ede9fe; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .jury-avatar i { font-size: 1.5rem; color: #8b5cf6; }
      .jury-info-display { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
      .jury-name { font-weight: 600; color: #1e293b; }
      .jury-details { font-size: 0.8rem; color: #64748b; }
      .jury-email { font-size: 0.75rem; color: #94a3b8; }
      .jury-role-badge { padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
      .jury-role-badge.president { background: #fef3c7; color: #b45309; }
      .jury-role-badge.rapporteur { background: #dbeafe; color: #1d4ed8; }
      .jury-role-badge.examinateur { background: #dcfce7; color: #15803d; }

      /* ========== DATE DISPLAY ========== */
      .date-display { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border-radius: 10px; border: 1px solid #fcd34d; }
      .date-icon { width: 48px; height: 48px; background: #fef3c7; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .date-icon i { font-size: 1.5rem; color: #f59e0b; }
      .date-info { display: flex; flex-direction: column; gap: 0.25rem; }
      .date-value { font-size: 1.1rem; font-weight: 700; color: #1e293b; text-transform: capitalize; }
      .time-value, .location-value { display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; color: #64748b; }

      /* ========== WAITING & SUCCESS STATES ========== */
      .waiting-content, .success-content { display: flex; align-items: center; gap: 1rem; }
      .waiting-icon, .success-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .waiting-icon { background: #e2e8f0; }
      .waiting-icon i { font-size: 1.5rem; color: #64748b; }
      .success-icon { background: #dcfce7; }
      .success-icon i { font-size: 1.5rem; color: #22c55e; }
      .waiting-text h6, .success-text h6 { margin: 0 0 0.25rem; font-size: 0.95rem; color: #1e293b; }
      .waiting-text p, .success-text p { margin: 0; font-size: 0.85rem; color: #64748b; }

      /* Toast */
      .toast { position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 0.75rem; font-weight: 500; z-index: 1000; animation: slideIn 0.3s ease-out; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); }
      .toast.success { background: #22c55e; color: white; }
      .toast.error { background: #ef4444; color: white; }
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

      @media (max-width: 768px) {
        .stats-grid { grid-template-columns: repeat(2, 1fr); }
        .prereq-grid { grid-template-columns: 1fr; }
        .action-buttons { flex-direction: column; }
        .jury-summary { flex-direction: column; gap: 0.5rem; }
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

    // Jury members from DB (by role)
    presidentsDisponibles = signal<MembreJury[]>([]);
    rapporteursDisponibles = signal<MembreJury[]>([]);
    examinateursDisponibles = signal<MembreJury[]>([]);

    // Jury selection
    jurySelection: JurySelection = {
        presidentId: null,
        rapporteurId: null,
        examinateurId: null
    };

    // Toast notifications
    toastMessage = signal<string>('');
    toastType = signal<'success' | 'error'>('success');

    constructor(
        private soutenanceService: SoutenanceService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.loadData();
        this.loadMembresJuryDisponibles();
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
                this.showToast('Erreur lors du chargement des données', 'error');
            }
        });
    }

    loadMembresJuryDisponibles() {
        // Charger les membres disponibles par rôle
        this.soutenanceService.getMembresJuryByRole('PRESIDENT').subscribe({
            next: (data) => {
                console.log('👑 Présidents disponibles:', data);
                this.presidentsDisponibles.set(data);
            },
            error: (err) => console.error('Erreur chargement présidents:', err)
        });

        this.soutenanceService.getMembresJuryByRole('RAPPORTEUR').subscribe({
            next: (data) => {
                console.log('📝 Rapporteurs disponibles:', data);
                this.rapporteursDisponibles.set(data);
            },
            error: (err) => console.error('Erreur chargement rapporteurs:', err)
        });

        this.soutenanceService.getMembresJuryByRole('EXAMINATEUR').subscribe({
            next: (data) => {
                console.log('🔍 Examinateurs disponibles:', data);
                this.examinateursDisponibles.set(data);
            },
            error: (err) => console.error('Erreur chargement examinateurs:', err)
        });
    }

    toggleExpand(id: number) {
        if (this.expandedId() === id) {
            this.expandedId.set(null);
            this.resetForms();
        } else {
            this.expandedId.set(id);
            this.resetForms();
        }
    }

    resetForms() {
        this.showDecisionForm.set(false);
        this.decisionType.set(null);
        this.commentaire = '';
        this.currentSoutenanceId = null;
        this.jurySelection = { presidentId: null, rapporteurId: null, examinateurId: null };
    }

    showToast(message: string, type: 'success' | 'error') {
        this.toastMessage.set(message);
        this.toastType.set(type);
        setTimeout(() => this.toastMessage.set(''), 4000);
    }

    // ========== JURY SELECTION METHODS ==========

    onJurySelectionChange() {
        console.log('Selection changed:', this.jurySelection);
    }

    getSelectedPresident(): MembreJury | undefined {
        if (!this.jurySelection.presidentId) return undefined;
        return this.presidentsDisponibles().find(m => m.id === this.jurySelection.presidentId);
    }

    getSelectedRapporteur(): MembreJury | undefined {
        if (!this.jurySelection.rapporteurId) return undefined;
        return this.rapporteursDisponibles().find(m => m.id === this.jurySelection.rapporteurId);
    }

    getSelectedExaminateur(): MembreJury | undefined {
        if (!this.jurySelection.examinateurId) return undefined;
        return this.examinateursDisponibles().find(m => m.id === this.jurySelection.examinateurId);
    }

    isJurySelectionValid(): boolean {
        return !!(this.jurySelection.presidentId && this.jurySelection.rapporteurId && this.jurySelection.examinateurId);
    }

    submitJurySelection(soutenanceId: number, event: Event) {
        event.stopPropagation();

        if (!this.isJurySelectionValid()) {
            this.showToast('Veuillez sélectionner tous les membres du jury', 'error');
            return;
        }

        this.isSubmitting.set(true);

        const president = this.getSelectedPresident()!;
        const rapporteur = this.getSelectedRapporteur()!;
        const examinateur = this.getSelectedExaminateur()!;

        // IMPORTANT: Créer de NOUVEAUX objets MembreJury SANS id
        // pour que le backend les insère comme nouvelles entrées
        const membrePresident = {
            nom: president.nom,
            prenom: president.prenom,
            email: president.email,
            etablissement: president.etablissement,
            grade: president.grade,
            specialite: president.specialite,
            role: 'PRESIDENT'
        };

        const membreRapporteur = {
            nom: rapporteur.nom,
            prenom: rapporteur.prenom,
            email: rapporteur.email,
            etablissement: rapporteur.etablissement,
            grade: rapporteur.grade,
            specialite: rapporteur.specialite,
            role: 'RAPPORTEUR'
        };

        const membreExaminateur = {
            nom: examinateur.nom,
            prenom: examinateur.prenom,
            email: examinateur.email,
            etablissement: examinateur.etablissement,
            grade: examinateur.grade,
            specialite: examinateur.specialite,
            role: 'EXAMINATEUR'
        };

        // Ajouter les 3 membres au jury (objets SANS id)
        const addRequests = [
            this.soutenanceService.ajouterMembreJury(soutenanceId, membrePresident),
            this.soutenanceService.ajouterMembreJury(soutenanceId, membreRapporteur),
            this.soutenanceService.ajouterMembreJury(soutenanceId, membreExaminateur)
        ];

        forkJoin(addRequests).subscribe({
            next: () => {
                // Proposer le jury (change le statut)
                this.soutenanceService.proposerJury(soutenanceId).subscribe({
                    next: () => {
                        this.showToast('Jury proposé avec succès !', 'success');
                        this.loadData();
                        this.resetForms();
                        this.isSubmitting.set(false);
                    },
                    error: (err: any) => {
                        console.error('Erreur proposition jury:', err);
                        this.showToast(err.error?.error || 'Erreur lors de la proposition', 'error');
                        this.isSubmitting.set(false);
                    }
                });
            },
            error: (err: any) => {
                console.error('Erreur ajout membres:', err);
                this.showToast(err.error?.error || 'Erreur lors de l\'ajout des membres', 'error');
                this.isSubmitting.set(false);
            }
        });
    }

    // ========== HELPER METHODS ==========

    getDoctorantName(soutenance: any): string {
        if (soutenance.doctorantInfo) {
            return `${soutenance.doctorantInfo.prenom} ${soutenance.doctorantInfo.nom}`;
        }
        return `Doctorant #${soutenance.doctorantId}`;
    }

    getThesisTitle(soutenance: any): string {
        return soutenance.titreThese || soutenance.sujetThese || 'Sujet non défini';
    }

    getDoctorantPublications(soutenance: any): number {
        if (soutenance.doctorantInfo?.nbPublications != null) return soutenance.doctorantInfo.nbPublications;
        if (soutenance.doctorantInfo?.nb_publications != null) return soutenance.doctorantInfo.nb_publications;
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

    needsDirectorAction(statut: string): boolean {
        return ['SOUMIS', 'PREREQUIS_VALIDES'].includes(statut);
    }

    getActionNeededText(statut: string): string {
        if (statut === 'SOUMIS') return 'Action requise: Valider prérequis';
        if (statut === 'PREREQUIS_VALIDES') return 'Action requise: Proposer jury';
        return '';
    }

    // ========== STATS ==========

    getPendingValidationCount(): number {
        return this.soutenances().filter(s => s.statut === 'SOUMIS').length;
    }

    getJuryNeededCount(): number {
        return this.soutenances().filter(s => s.statut === 'PREREQUIS_VALIDES').length;
    }

    getCompletedCount(): number {
        return this.soutenances().filter(s =>
            ['JURY_PROPOSE', 'AUTORISEE', 'PLANIFIEE', 'TERMINEE'].includes(s.statut)
        ).length;
    }

    // ========== STATUS STYLING ==========

    getStatusIndicatorClass(statut: string): string {
        switch (statut) {
            case 'SOUMIS': return 'pending';
            case 'PREREQUIS_VALIDES': return 'jury';
            case 'JURY_PROPOSE': return 'jury-pending';
            case 'AUTORISEE': return 'approved';
            case 'PLANIFIEE': return 'scheduled';
            case 'TERMINEE': return 'approved';
            case 'REJETEE':
            case 'REFUSEE': return 'rejected';
            default: return 'pending';
        }
    }

    getStatusIcon(statut: string): string {
        switch (statut) {
            case 'SOUMIS': return 'bi-hourglass-split';
            case 'PREREQUIS_VALIDES': return 'bi-person-plus';
            case 'JURY_PROPOSE': return 'bi-people';
            case 'AUTORISEE': return 'bi-check-circle';
            case 'PLANIFIEE': return 'bi-calendar-check';
            case 'TERMINEE': return 'bi-trophy';
            case 'REJETEE':
            case 'REFUSEE': return 'bi-x-lg';
            default: return 'bi-hourglass-split';
        }
    }

    getStatusBadgeClass(statut: string): string {
        switch (statut) {
            case 'SOUMIS': return 'pending';
            case 'PREREQUIS_VALIDES': return 'jury';
            case 'JURY_PROPOSE': return 'jury-pending';
            case 'AUTORISEE': return 'approved';
            case 'PLANIFIEE': return 'scheduled';
            case 'TERMINEE': return 'approved';
            case 'REJETEE':
            case 'REFUSEE': return 'rejected';
            default: return 'pending';
        }
    }

    formatStatus(statut: string): string {
        const statusMap: Record<string, string> = {
            'BROUILLON': 'Brouillon',
            'SOUMIS': 'À valider',
            'EN_ATTENTE': 'En attente',
            'PREREQUIS_VALIDES': 'Jury à proposer',
            'JURY_PROPOSE': 'Jury en validation',
            'AUTORISEE': 'Autorisée',
            'VALIDEE': 'Validée',
            'PLANIFIEE': 'Planifiée',
            'TERMINEE': 'Terminée',
            'REJETEE': 'Corrections demandées',
            'REFUSEE': 'Refusée'
        };
        return statusMap[statut] || statut;
    }

    getRoleBadgeClass(role: string): string {
        const classes: Record<string, string> = {
            'PRESIDENT': 'president',
            'RAPPORTEUR': 'rapporteur',
            'EXAMINATEUR': 'examinateur',
            'INVITE': 'examinateur'
        };
        return classes[role] || 'examinateur';
    }

    formatRole(role: string): string {
        const roles: Record<string, string> = {
            'PRESIDENT': 'Président',
            'RAPPORTEUR': 'Rapporteur',
            'EXAMINATEUR': 'Examinateur',
            'INVITE': 'Invité'
        };
        return roles[role] || role;
    }

    // ========== VALIDATION ACTIONS ==========

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
        this.isSubmitting.set(true);

        this.soutenanceService.validerPrerequisDirecteur(id, 'Prérequis validés par le directeur').subscribe({
            next: () => {
                this.showToast('Prérequis validés avec succès !', 'success');
                this.loadData();
                this.showDecisionForm.set(false);
                this.isSubmitting.set(false);
            },
            error: (err) => {
                console.error('Erreur validation:', err);
                this.showToast(err.error?.error || 'Erreur lors de la validation', 'error');
                this.isSubmitting.set(false);
            }
        });
    }

    confirmRejection(id: number, event: Event) {
        event.stopPropagation();
        if (!this.commentaire.trim()) return;

        this.isSubmitting.set(true);
        this.soutenanceService.rejeterDemandeDirecteur(id, this.commentaire.trim()).subscribe({
            next: () => {
                this.showToast('Demande de corrections envoyée', 'success');
                this.loadData();
                this.showDecisionForm.set(false);
                this.isSubmitting.set(false);
            },
            error: (err) => {
                console.error('Erreur rejet:', err);
                this.showToast(err.error?.error || 'Erreur lors du rejet', 'error');
                this.isSubmitting.set(false);
            }
        });
    }
}