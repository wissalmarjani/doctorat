import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { SoutenanceService } from '@core/services/soutenance.service';
import { AuthService } from '@core/services/auth.service';
import { Soutenance } from '@core/models/soutenance.model';

@Component({
    selector: 'app-doctorant-soutenance',
    standalone: true,
    imports: [CommonModule, MainLayoutComponent, FormsModule, ReactiveFormsModule],
    template: `
        <app-main-layout>
            <div class="page-container">

                <!-- Hero Header -->
                <div class="hero-section">
                    <div class="hero-content">
                        <div class="hero-icon">
                            <i class="bi bi-mortarboard-fill"></i>
                        </div>
                        <div>
                            <h1 class="hero-title">Ma Soutenance de Thèse</h1>
                            <p class="hero-subtitle">Gérez votre demande de soutenance et suivez son avancement</p>
                        </div>
                    </div>
                    <div class="hero-decoration">
                        <div class="decoration-circle c1"></div>
                        <div class="decoration-circle c2"></div>
                    </div>
                </div>

                <!-- CAS 1 : AUCUNE DEMANDE - FORMULAIRE DE SOUMISSION -->
                @if (!currentSoutenance() && !isLoadingData()) {
                    <div class="form-section fade-in">

                        <!-- Info Card -->
                        <div class="info-banner">
                            <div class="info-icon">
                                <i class="bi bi-lightbulb"></i>
                            </div>
                            <div class="info-content">
                                <strong>Avant de commencer</strong>
                                <p>Assurez-vous d'avoir complété les prérequis : 2 publications Q1/Q2, 2 conférences internationales et 200h de formation.</p>
                            </div>
                        </div>

                        <!-- Formulaire -->
                        <div class="form-card">
                            <div class="card-header-custom">
                                <div class="header-icon">
                                    <i class="bi bi-file-earmark-text"></i>
                                </div>
                                <div>
                                    <h3 class="card-title">Nouvelle Demande de Soutenance</h3>
                                    <p class="card-subtitle">Remplissez le formulaire et joignez les documents requis</p>
                                </div>
                            </div>

                            <form [formGroup]="soutenanceForm" (ngSubmit)="onSubmit()" class="card-body-custom">

                                <!-- Titre de la thèse -->
                                <div class="form-group full-width">
                                    <label class="form-label-custom">
                                        <i class="bi bi-journal-text me-2"></i>
                                        Titre de la Thèse
                                        <span class="required">*</span>
                                    </label>
                                    <textarea
                                            class="form-input textarea"
                                            formControlName="titre"
                                            rows="3"
                                            placeholder="Entrez le titre complet de votre thèse..."
                                            [class.error]="isFieldInvalid('titre')">
                  </textarea>
                                    @if (isFieldInvalid('titre')) {
                                        <span class="error-message">
                      <i class="bi bi-exclamation-circle me-1"></i>Le titre est obligatoire
                    </span>
                                    }
                                </div>

                                <!-- Documents -->
                                <div class="documents-section">
                                    <h4 class="section-title">
                                        <i class="bi bi-folder2-open me-2"></i>
                                        Documents Obligatoires
                                    </h4>

                                    <div class="documents-grid">
                                        <!-- Manuscrit -->
                                        <div class="document-upload" [class.uploaded]="files.manuscrit">
                                            <div class="upload-icon" [class.success]="files.manuscrit">
                                                @if (files.manuscrit) {
                                                    <i class="bi bi-check-circle-fill"></i>
                                                } @else {
                                                    <i class="bi bi-file-earmark-pdf"></i>
                                                }
                                            </div>
                                            <div class="upload-info">
                                                <span class="upload-title">Manuscrit de Thèse <span class="required">*</span></span>
                                                <span class="upload-hint">
                          @if (files.manuscrit) {
                              {{ files.manuscrit.name }}
                          } @else {
                              Version finale ou quasi-finale (PDF)
                          }
                        </span>
                                            </div>
                                            <label class="upload-button">
                                                <input type="file" (change)="onFileSelect($event, 'manuscrit')" accept=".pdf" hidden>
                                                <i class="bi bi-cloud-upload me-1"></i>
                                                {{ files.manuscrit ? 'Changer' : 'Parcourir' }}
                                            </label>
                                        </div>

                                        <!-- Rapport Anti-Plagiat -->
                                        <div class="document-upload" [class.uploaded]="files.rapport">
                                            <div class="upload-icon" [class.success]="files.rapport">
                                                @if (files.rapport) {
                                                    <i class="bi bi-check-circle-fill"></i>
                                                } @else {
                                                    <i class="bi bi-shield-check"></i>
                                                }
                                            </div>
                                            <div class="upload-info">
                                                <span class="upload-title">Rapport Anti-Plagiat <span class="required">*</span></span>
                                                <span class="upload-hint">
                          @if (files.rapport) {
                              {{ files.rapport.name }}
                          } @else {
                              Turnitin/iThenticate - Doit être &lt; 10%
                          }
                        </span>
                                            </div>
                                            <label class="upload-button">
                                                <input type="file" (change)="onFileSelect($event, 'rapport')" accept=".pdf" hidden>
                                                <i class="bi bi-cloud-upload me-1"></i>
                                                {{ files.rapport ? 'Changer' : 'Parcourir' }}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <!-- Workflow Info -->
                                <div class="workflow-preview">
                                    <h4 class="section-title">
                                        <i class="bi bi-diagram-3 me-2"></i>
                                        Processus de Validation
                                    </h4>
                                    <div class="workflow-steps">
                                        <div class="workflow-step">
                                            <div class="step-number">1</div>
                                            <div class="step-content">
                                                <span class="step-title">Soumission</span>
                                                <span class="step-desc">Vous êtes ici</span>
                                            </div>
                                        </div>
                                        <div class="workflow-arrow"><i class="bi bi-chevron-right"></i></div>
                                        <div class="workflow-step">
                                            <div class="step-number">2</div>
                                            <div class="step-content">
                                                <span class="step-title">Directeur</span>
                                                <span class="step-desc">Valide prérequis</span>
                                            </div>
                                        </div>
                                        <div class="workflow-arrow"><i class="bi bi-chevron-right"></i></div>
                                        <div class="workflow-step">
                                            <div class="step-number">3</div>
                                            <div class="step-content">
                                                <span class="step-title">Administration</span>
                                                <span class="step-desc">Planifie la date</span>
                                            </div>
                                        </div>
                                        <div class="workflow-arrow"><i class="bi bi-chevron-right"></i></div>
                                        <div class="workflow-step final">
                                            <div class="step-number"><i class="bi bi-trophy"></i></div>
                                            <div class="step-content">
                                                <span class="step-title">Soutenance</span>
                                                <span class="step-desc">Jour J</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Submit Button -->
                                <button
                                        type="submit"
                                        class="btn-submit"
                                        [disabled]="isLoading() || soutenanceForm.invalid || !files.manuscrit || !files.rapport">
                                    @if (isLoading()) {
                                        <span class="spinner"></span>
                                        <span>Envoi en cours...</span>
                                    } @else {
                                        <i class="bi bi-send me-2"></i>
                                        <span>Soumettre ma Demande</span>
                                    }
                                </button>

                                @if (errorMessage()) {
                                    <div class="error-banner">
                                        <i class="bi bi-exclamation-triangle me-2"></i>
                                        {{ errorMessage() }}
                                    </div>
                                }

                            </form>
                        </div>
                    </div>
                }

                <!-- CAS 2 : DEMANDE EXISTANTE - SUIVI -->
                @if (currentSoutenance()) {
                    <div class="tracking-section fade-in">

                        <!-- Status Card -->
                        <div class="status-card" [ngClass]="getStatusCardClass()">
                            <div class="status-header">
                                <div class="status-badge" [ngClass]="getStatusBadgeClass()">
                                    <i class="bi" [ngClass]="getStatusIcon()"></i>
                                    {{ formatStatus(currentSoutenance()?.statut) }}
                                </div>
                                <span class="status-date">
                  Soumis le {{ currentSoutenance()?.createdAt | date:'dd/MM/yyyy' }}
                </span>
                            </div>

                            <h2 class="thesis-title">{{ currentSoutenance()?.titreThese }}</h2>

                            <div class="status-message">
                                <i class="bi" [ngClass]="getMessageIcon()"></i>
                                <span>{{ getStatusMessage() }}</span>
                            </div>
                        </div>

                        <!-- Timeline -->
                        <div class="timeline-card">
                            <h3 class="timeline-title">
                                <i class="bi bi-clock-history me-2"></i>
                                Progression de votre dossier
                            </h3>

                            <div class="timeline">
                                @for (step of timelineSteps; track step.id) {
                                    <div class="timeline-item" [class.completed]="step.id <= currentStep()" [class.current]="step.id === currentStep()">
                                        <div class="timeline-marker">
                                            @if (step.id < currentStep()) {
                                                <i class="bi bi-check-lg"></i>
                                            } @else if (step.id === currentStep()) {
                                                <div class="pulse-dot"></div>
                                            } @else {
                                                <span>{{ step.id }}</span>
                                            }
                                        </div>
                                        <div class="timeline-content">
                                            <span class="timeline-step-title">{{ step.title }}</span>
                                            <span class="timeline-step-desc">{{ step.description }}</span>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>

                        <!-- Details Card -->
                        @if (currentSoutenance()?.dateSoutenance) {
                            <div class="details-card">
                                <h3 class="details-title">
                                    <i class="bi bi-calendar-event me-2"></i>
                                    Détails de la Soutenance
                                </h3>
                                <div class="details-grid">
                                    <div class="detail-item">
                                        <i class="bi bi-calendar3"></i>
                                        <div>
                                            <span class="detail-label">Date</span>
                                            <span class="detail-value">{{ currentSoutenance()?.dateSoutenance | date:'EEEE dd MMMM yyyy' }}</span>
                                        </div>
                                    </div>
                                    @if (currentSoutenance()?.heureSoutenance) {
                                        <div class="detail-item">
                                            <i class="bi bi-clock"></i>
                                            <div>
                                                <span class="detail-label">Heure</span>
                                                <span class="detail-value">{{ currentSoutenance()?.heureSoutenance }}</span>
                                            </div>
                                        </div>
                                    }
                                    @if (currentSoutenance()?.lieuSoutenance) {
                                        <div class="detail-item">
                                            <i class="bi bi-geo-alt"></i>
                                            <div>
                                                <span class="detail-label">Lieu</span>
                                                <span class="detail-value">{{ currentSoutenance()?.lieuSoutenance }}</span>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        }

                        <!-- Jury Card -->
                        @if (currentSoutenance()?.membresJury && currentSoutenance()!.membresJury!.length > 0) {
                            <div class="jury-card">
                                <h3 class="jury-title">
                                    <i class="bi bi-people me-2"></i>
                                    Composition du Jury
                                </h3>
                                <div class="jury-grid">
                                    @for (membre of currentSoutenance()?.membresJury; track membre.id) {
                                        <div class="jury-member">
                                            <div class="member-avatar">
                                                {{ membre.nom?.charAt(0) }}{{ membre.prenom?.charAt(0) }}
                                            </div>
                                            <div class="member-info">
                                                <span class="member-name">{{ membre.prenom }} {{ membre.nom }}</span>
                                                <span class="member-role">{{ formatRole(membre.role) }}</span>
                                                <span class="member-institution">{{ membre.etablissement }}</span>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        }

                    </div>
                }

                <!-- Loading State -->
                @if (isLoadingData()) {
                    <div class="loading-state">
                        <div class="loading-spinner"></div>
                        <span>Chargement de vos données...</span>
                    </div>
                }

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
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border-radius: 24px;
        padding: 2rem;
        margin-bottom: 2rem;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
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
        color: rgba(255, 255, 255, 0.85);
        margin: 0.25rem 0 0;
        font-size: 0.95rem;
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

      /* Info Banner */
      .info-banner {
        display: flex;
        gap: 1rem;
        padding: 1.25rem;
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border: 1px solid #fcd34d;
        border-radius: 16px;
        margin-bottom: 1.5rem;
      }

      .info-icon {
        width: 44px;
        height: 44px;
        background: #f59e0b;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.2rem;
        flex-shrink: 0;
      }

      .info-content {
        color: #92400e;
      }

      .info-content strong {
        display: block;
        margin-bottom: 0.25rem;
      }

      .info-content p {
        margin: 0;
        font-size: 0.9rem;
      }

      /* Form Card */
      .form-card {
        background: white;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        border: 1px solid #e2e8f0;
        overflow: hidden;
      }

      .card-header-custom {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem 1.5rem;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }

      .header-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.25rem;
      }

      .card-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }

      .card-subtitle {
        font-size: 0.85rem;
        color: #64748b;
        margin: 0.15rem 0 0;
      }

      .card-body-custom {
        padding: 1.5rem;
      }

      /* Form Elements */
      .form-group {
        margin-bottom: 1.5rem;
      }

      .full-width {
        width: 100%;
      }

      .form-label-custom {
        display: block;
        font-size: 0.9rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.5rem;
      }

      .form-label-custom i {
        color: #94a3b8;
      }

      .required {
        color: #ef4444;
      }

      .form-input {
        width: 100%;
        padding: 0.875rem 1rem;
        font-size: 0.95rem;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        background: #f8fafc;
        transition: all 0.2s;
        outline: none;
      }

      .form-input:focus {
        border-color: #818cf8;
        background: white;
        box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.1);
      }

      .form-input.error {
        border-color: #ef4444;
        background: #fef2f2;
      }

      .form-input.textarea {
        resize: vertical;
        min-height: 100px;
      }

      .error-message {
        display: flex;
        align-items: center;
        font-size: 0.8rem;
        color: #ef4444;
        margin-top: 0.5rem;
      }

      /* Documents Section */
      .documents-section {
        margin: 2rem 0;
      }

      .section-title {
        font-size: 1rem;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
      }

      .section-title i {
        color: #6366f1;
      }

      .documents-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .document-upload {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.25rem;
        background: #f8fafc;
        border: 2px dashed #cbd5e1;
        border-radius: 14px;
        transition: all 0.2s;
      }

      .document-upload:hover {
        border-color: #818cf8;
        background: #f5f3ff;
      }

      .document-upload.uploaded {
        border-style: solid;
        border-color: #22c55e;
        background: #f0fdf4;
      }

      .upload-icon {
        width: 48px;
        height: 48px;
        background: #e2e8f0;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        color: #64748b;
        flex-shrink: 0;
      }

      .upload-icon.success {
        background: #dcfce7;
        color: #22c55e;
      }

      .upload-info {
        flex: 1;
      }

      .upload-title {
        display: block;
        font-weight: 600;
        color: #1e293b;
        font-size: 0.95rem;
      }

      .upload-hint {
        display: block;
        font-size: 0.8rem;
        color: #64748b;
        margin-top: 0.15rem;
      }

      .upload-button {
        padding: 0.5rem 1rem;
        background: #6366f1;
        color: white;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .upload-button:hover {
        background: #4f46e5;
        transform: translateY(-1px);
      }

      /* Workflow Preview */
      .workflow-preview {
        margin: 2rem 0;
        padding: 1.5rem;
        background: #f8fafc;
        border-radius: 16px;
      }

      .workflow-steps {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 1rem;
      }

      .workflow-step {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .step-number {
        width: 36px;
        height: 36px;
        background: #e2e8f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.9rem;
        color: #64748b;
      }

      .workflow-step.final .step-number {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
      }

      .step-content {
        display: flex;
        flex-direction: column;
      }

      .step-title {
        font-weight: 600;
        font-size: 0.85rem;
        color: #1e293b;
      }

      .step-desc {
        font-size: 0.75rem;
        color: #64748b;
      }

      .workflow-arrow {
        color: #cbd5e1;
        font-size: 1.2rem;
      }

      /* Submit Button */
      .btn-submit {
        width: 100%;
        padding: 1rem;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        border: none;
        border-radius: 14px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.2s;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
        margin-top: 1.5rem;
      }

      .btn-submit:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
      }

      .btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .error-banner {
        margin-top: 1rem;
        padding: 1rem;
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 10px;
        color: #dc2626;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
      }

      /* ==================== TRACKING SECTION ==================== */

      .tracking-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      /* Status Card */
      .status-card {
        padding: 1.5rem;
        border-radius: 20px;
        border: 1px solid;
      }

      .status-card.status-pending {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border-color: #93c5fd;
      }

      .status-card.status-success {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border-color: #86efac;
      }

      .status-card.status-warning {
        background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        border-color: #fcd34d;
      }

      .status-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 50px;
        font-weight: 600;
        font-size: 0.85rem;
      }

      .status-badge.badge-pending {
        background: #3b82f6;
        color: white;
      }

      .status-badge.badge-success {
        background: #22c55e;
        color: white;
      }

      .status-badge.badge-warning {
        background: #f59e0b;
        color: white;
      }

      .status-date {
        font-size: 0.85rem;
        color: #64748b;
      }

      .thesis-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 1rem 0;
        line-height: 1.4;
      }

      .status-message {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 12px;
        font-size: 0.9rem;
        color: #1e293b;
      }

      .status-message i {
        font-size: 1.2rem;
        margin-top: 0.1rem;
      }

      /* Timeline Card */
      .timeline-card {
        background: white;
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        border: 1px solid #e2e8f0;
      }

      .timeline-title {
        font-size: 1rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 1.5rem 0;
        display: flex;
        align-items: center;
      }

      .timeline-title i {
        color: #6366f1;
      }

      .timeline {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .timeline-item {
        display: flex;
        gap: 1rem;
        position: relative;
        padding-bottom: 1.5rem;
      }

      .timeline-item:not(:last-child)::before {
        content: '';
        position: absolute;
        left: 17px;
        top: 36px;
        bottom: 0;
        width: 2px;
        background: #e2e8f0;
      }

      .timeline-item.completed:not(:last-child)::before {
        background: #22c55e;
      }

      .timeline-marker {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.85rem;
        color: #64748b;
        flex-shrink: 0;
        z-index: 1;
      }

      .timeline-item.completed .timeline-marker {
        background: #22c55e;
        color: white;
      }

      .timeline-item.current .timeline-marker {
        background: #6366f1;
        color: white;
      }

      .pulse-dot {
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        animation: pulse 1.5s infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.3); opacity: 0.7; }
      }

      .timeline-content {
        display: flex;
        flex-direction: column;
        padding-top: 0.25rem;
      }

      .timeline-step-title {
        font-weight: 600;
        color: #1e293b;
        font-size: 0.95rem;
      }

      .timeline-step-desc {
        font-size: 0.8rem;
        color: #64748b;
      }

      /* Details Card */
      .details-card, .jury-card {
        background: white;
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        border: 1px solid #e2e8f0;
      }

      .details-title, .jury-title {
        font-size: 1rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 1rem 0;
        display: flex;
        align-items: center;
      }

      .details-title i, .jury-title i {
        color: #6366f1;
      }

      .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .detail-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 12px;
      }

      .detail-item i {
        font-size: 1.2rem;
        color: #6366f1;
        margin-top: 0.2rem;
      }

      .detail-label {
        display: block;
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-value {
        display: block;
        font-weight: 600;
        color: #1e293b;
        font-size: 0.95rem;
      }

      /* Jury Grid */
      .jury-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .jury-member {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 12px;
      }

      .member-avatar {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 0.9rem;
      }

      .member-info {
        display: flex;
        flex-direction: column;
      }

      .member-name {
        font-weight: 600;
        color: #1e293b;
      }

      .member-role {
        font-size: 0.8rem;
        color: #6366f1;
        font-weight: 500;
      }

      .member-institution {
        font-size: 0.8rem;
        color: #64748b;
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
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      /* Animations */
      .fade-in {
        animation: fadeIn 0.4s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Responsive */
      @media (max-width: 768px) {
        .hero-content {
          flex-direction: column;
          text-align: center;
        }

        .workflow-steps {
          flex-direction: column;
          gap: 1rem;
          align-items: flex-start;
        }

        .workflow-arrow {
          transform: rotate(90deg);
          align-self: center;
        }

        .status-header {
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-start;
        }
      }
    `]
})
export class DoctorantSoutenanceComponent implements OnInit {
    currentSoutenance = signal<Soutenance | null>(null);
    soutenanceForm: FormGroup;
    files: { manuscrit: File | null; rapport: File | null } = { manuscrit: null, rapport: null };
    isLoading = signal(false);
    isLoadingData = signal(true);
    errorMessage = signal<string | null>(null);

    // Timeline steps
    timelineSteps = [
        { id: 1, title: 'Demande Soumise', description: 'En attente de validation' },
        { id: 2, title: 'Prérequis Validés', description: 'Par le directeur de thèse' },
        { id: 3, title: 'Jury Proposé', description: 'Composition validée' },
        { id: 4, title: 'Soutenance Planifiée', description: 'Date et lieu fixés' },
        { id: 5, title: 'Soutenance Terminée', description: 'Félicitations !' }
    ];

    constructor(
        private fb: FormBuilder,
        private soutenanceService: SoutenanceService,
        private authService: AuthService
    ) {
        // Pré-remplir le titre avec le sujet de thèse assigné par le directeur
        const user = this.authService.currentUser();
        const sujetThese = user?.sujetThese || '';

        this.soutenanceForm = this.fb.group({
            titre: [sujetThese, [Validators.required, Validators.minLength(10)]]
        });
    }

    ngOnInit() {
        this.loadSoutenance();
    }

    loadSoutenance() {
        this.isLoadingData.set(true);
        const user = this.authService.currentUser();

        if (user?.id) {
            this.soutenanceService.getSoutenanceByDoctorantId(user.id).subscribe({
                next: (list) => {
                    if (list && list.length > 0) {
                        // Prend la soutenance la plus récente
                        this.currentSoutenance.set(list[0]);
                    }
                    this.isLoadingData.set(false);
                },
                error: (err) => {
                    console.error('Erreur chargement soutenance:', err);
                    this.isLoadingData.set(false);
                }
            });
        } else {
            this.isLoadingData.set(false);
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.soutenanceForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onFileSelect(event: any, type: 'manuscrit' | 'rapport') {
        const file = event.target.files[0];
        if (file) {
            // Vérifier que c'est un PDF
            if (file.type !== 'application/pdf') {
                this.errorMessage.set('Seuls les fichiers PDF sont acceptés.');
                return;
            }
            // Vérifier la taille (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                this.errorMessage.set('Le fichier ne doit pas dépasser 50 Mo.');
                return;
            }
            this.files[type] = file;
            this.errorMessage.set(null);
        }
    }

    onSubmit() {
        if (this.soutenanceForm.invalid) {
            this.soutenanceForm.markAllAsTouched();
            return;
        }

        if (!this.files.manuscrit || !this.files.rapport) {
            this.errorMessage.set('Veuillez joindre le manuscrit et le rapport anti-plagiat.');
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);

        const user = this.authService.currentUser();

        if (!user?.id) {
            this.errorMessage.set('Erreur: Utilisateur non connecté.');
            this.isLoading.set(false);
            return;
        }

        // Préparer les données pour le backend
        const data = {
            titre: this.soutenanceForm.value.titre,
            doctorantId: user.id,
            directeurId: user.directeurId || null  // Récupère l'ID du directeur depuis le profil utilisateur
        };

        console.log('📤 Soumission soutenance:', data);
        console.log('📎 Fichiers:', {
            manuscrit: this.files.manuscrit?.name,
            rapport: this.files.rapport?.name
        });

        // Appel du service
        this.soutenanceService.soumettreDemande(data, {
            manuscrit: this.files.manuscrit,
            rapport: this.files.rapport
        }).subscribe({
            next: (res) => {
                console.log('✅ Soutenance créée:', res);
                this.currentSoutenance.set(res);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('❌ Erreur soumission:', err);
                this.errorMessage.set(
                    err.error?.message || 'Erreur lors de la soumission. Veuillez réessayer.'
                );
                this.isLoading.set(false);
            }
        });
    }

    // ==================== HELPERS VISUELS ====================

    currentStep(): number {
        const status = this.currentSoutenance()?.statut;
        switch (status) {
            case 'BROUILLON':
            case 'SOUMIS': return 1;
            case 'PREREQUIS_VALIDES': return 2;
            case 'JURY_PROPOSE': return 3;
            case 'PLANIFIEE':
            case 'AUTORISEE': return 4;
            case 'TERMINEE': return 5;
            default: return 1;
        }
    }

    formatStatus(status: string | undefined): string {
        const statusMap: Record<string, string> = {
            'BROUILLON': 'Brouillon',
            'SOUMIS': 'En cours d\'examen',
            'PREREQUIS_VALIDES': 'Prérequis validés',
            'JURY_PROPOSE': 'Jury en validation',
            'PLANIFIEE': 'Planifiée',
            'AUTORISEE': 'Autorisée',
            'TERMINEE': 'Terminée',
            'REJETEE': 'Rejetée'
        };
        return statusMap[status || ''] || status || 'Inconnu';
    }

    formatRole(role: string | undefined): string {
        const roleMap: Record<string, string> = {
            'PRESIDENT': 'Président',
            'RAPPORTEUR': 'Rapporteur',
            'EXAMINATEUR': 'Examinateur',
            'DIRECTEUR': 'Directeur de thèse',
            'CO_DIRECTEUR': 'Co-directeur'
        };
        return roleMap[role || ''] || role || '';
    }

    getStatusCardClass(): string {
        const status = this.currentSoutenance()?.statut;
        if (status === 'TERMINEE' || status === 'AUTORISEE') return 'status-success';
        if (status === 'REJETEE') return 'status-warning';
        return 'status-pending';
    }

    getStatusBadgeClass(): string {
        const status = this.currentSoutenance()?.statut;
        if (status === 'TERMINEE' || status === 'AUTORISEE') return 'badge-success';
        if (status === 'REJETEE') return 'badge-warning';
        return 'badge-pending';
    }

    getStatusIcon(): string {
        const status = this.currentSoutenance()?.statut;
        if (status === 'TERMINEE') return 'bi-trophy-fill';
        if (status === 'AUTORISEE' || status === 'PLANIFIEE') return 'bi-calendar-check';
        if (status === 'REJETEE') return 'bi-x-circle';
        return 'bi-hourglass-split';
    }

    getMessageIcon(): string {
        const status = this.currentSoutenance()?.statut;
        if (status === 'TERMINEE') return 'bi-emoji-smile text-success';
        if (status === 'REJETEE') return 'bi-exclamation-triangle text-warning';
        return 'bi-info-circle text-primary';
    }

    getStatusMessage(): string {
        const status = this.currentSoutenance()?.statut;
        const messages: Record<string, string> = {
            'BROUILLON': 'Votre demande est en brouillon. Complétez-la et soumettez.',
            'SOUMIS': 'Votre demande est en cours d\'examen par votre directeur de thèse.',
            'PREREQUIS_VALIDES': 'Vos prérequis ont été validés. Le directeur compose maintenant le jury.',
            'JURY_PROPOSE': 'La composition du jury est en cours de validation par l\'administration.',
            'PLANIFIEE': 'Votre soutenance est planifiée ! Consultez les détails ci-dessous.',
            'AUTORISEE': 'Votre soutenance est autorisée. Préparez-vous pour le jour J !',
            'TERMINEE': 'Félicitations ! Vous avez soutenu votre thèse avec succès.',
            'REJETEE': 'Votre demande a été rejetée. Consultez les commentaires de votre directeur.'
        };
        return messages[status || ''] || 'Statut en cours de traitement.';
    }
}