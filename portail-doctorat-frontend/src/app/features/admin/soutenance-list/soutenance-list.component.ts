import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { SoutenanceService } from '@core/services/soutenance.service';
import { Soutenance, StatutSoutenance } from '@core/models/soutenance.model';

@Component({
  selector: 'app-soutenance-list',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent, FormsModule],
  template: `
    <app-main-layout>
      <div class="soutenances-container p-4">

        <!-- PAGE HEADER -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">
              <i class="bi bi-mortarboard me-3"></i>
              Gestion des Soutenances
            </h1>
            <p class="page-subtitle">Gérez les demandes de soutenance des doctorants</p>
          </div>
          <button class="btn-refresh" (click)="loadSoutenances()">
            <i class="bi bi-arrow-clockwise me-2"></i>Actualiser
          </button>
        </div>

        <!-- STATS CARDS -->
        <div class="stats-row">
          <div class="stat-card stat-total">
            <div class="stat-icon"><i class="bi bi-collection"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ totalCount() }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
          <div class="stat-card stat-prerequis">
            <div class="stat-icon"><i class="bi bi-clipboard-check"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ prerequisCount() }}</span>
              <span class="stat-label">Prérequis à valider</span>
            </div>
          </div>
          <div class="stat-card stat-jury">
            <div class="stat-icon"><i class="bi bi-people"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ juryCount() }}</span>
              <span class="stat-label">Jury à valider</span>
            </div>
          </div>
          <div class="stat-card stat-authorized">
            <div class="stat-icon"><i class="bi bi-calendar-plus"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ authorizedCount() }}</span>
              <span class="stat-label">À planifier</span>
            </div>
          </div>
          <div class="stat-card stat-planned">
            <div class="stat-icon"><i class="bi bi-calendar-check"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ plannedCount() }}</span>
              <span class="stat-label">Planifiées</span>
            </div>
          </div>
          <div class="stat-card stat-done">
            <div class="stat-icon"><i class="bi bi-trophy"></i></div>
            <div class="stat-info">
              <span class="stat-value">{{ doneCount() }}</span>
              <span class="stat-label">Terminées</span>
            </div>
          </div>
        </div>

        <!-- FILTER TABS -->
        <div class="filter-section">
          <div class="filter-tabs">
            <button class="filter-tab" [class.active]="activeFilter() === 'all'" (click)="setFilter('all')">
              <i class="bi bi-grid me-2"></i>Toutes
              <span class="tab-count">{{ totalCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="activeFilter() === 'prerequis'" (click)="setFilter('prerequis')">
              <i class="bi bi-clipboard-check me-2"></i>Prérequis
              <span class="tab-count">{{ prerequisCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="activeFilter() === 'jury'" (click)="setFilter('jury')">
              <i class="bi bi-people me-2"></i>Jury
              <span class="tab-count">{{ juryCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="activeFilter() === 'authorized'" (click)="setFilter('authorized')">
              <i class="bi bi-calendar-plus me-2"></i>À planifier
              <span class="tab-count">{{ authorizedCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="activeFilter() === 'planned'" (click)="setFilter('planned')">
              <i class="bi bi-calendar-check me-2"></i>Planifiées
              <span class="tab-count">{{ plannedCount() }}</span>
            </button>
          </div>

          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Rechercher..."
                   [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)">
          </div>
        </div>

        <!-- SOUTENANCES LIST -->
        <div class="soutenances-list">
          @if (isLoading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Chargement des soutenances...</p>
            </div>
          } @else if (filteredSoutenances().length === 0) {
            <div class="empty-state">
              <i class="bi bi-inbox"></i>
              <h3>Aucune soutenance trouvée</h3>
              <p>{{ getEmptyMessage() }}</p>
            </div>
          } @else {
            @for (soutenance of filteredSoutenances(); track soutenance.id) {
              <div class="soutenance-card" [class.expanded]="expandedId() === soutenance.id" [ngClass]="getCardClass(soutenance.statut)">

                <!-- CARD HEADER - Clickable -->
                <div class="card-header" (click)="toggleExpand(soutenance.id)">
                  <div class="doctorant-info">
                    <div class="avatar" [style.background]="getAvatarColor(soutenance.doctorantId)">
                      {{ getInitials(getDoctorantNom(soutenance)) }}
                    </div>
                    <div class="info">
                      <h4 class="doctorant-name">{{ getDoctorantNom(soutenance) }}</h4>
                      <div class="doctorant-contact">
                        <span class="contact-item">
                          <i class="bi bi-envelope"></i>
                          {{ soutenance.doctorantInfo?.email || 'Email non disponible' }}
                        </span>
                        @if (soutenance.doctorantInfo?.telephone) {
                          <span class="contact-item">
                            <i class="bi bi-telephone"></i>
                            {{ soutenance.doctorantInfo?.telephone }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                  <div class="header-right">
                    <div class="status-badge" [ngClass]="getStatusBadgeClass(soutenance.statut)">
                      <i class="bi" [ngClass]="getStatusIcon(soutenance.statut)"></i>
                      {{ formatStatut(soutenance.statut) }}
                    </div>
                    <i class="bi bi-chevron-down expand-icon" [class.rotated]="expandedId() === soutenance.id"></i>
                  </div>
                </div>

                <!-- EXPANDED CONTENT -->
                @if (expandedId() === soutenance.id) {
                  <div class="card-body">
                    <!-- Titre de thèse -->
                    <div class="thesis-section">
                      <h5 class="section-label"><i class="bi bi-journal-text"></i> Sujet de thèse</h5>
                      <p class="thesis-title">{{ soutenance.titreThese || 'Non défini' }}</p>
                    </div>

                    <div class="info-grid">
                      <!-- Directeur -->
                      <div class="info-card">
                        <div class="info-icon director"><i class="bi bi-person-badge"></i></div>
                        <div class="info-content">
                          <span class="info-label">Directeur de thèse</span>
                          <span class="info-value">{{ getDirecteurNom(soutenance) }}</span>
                        </div>
                      </div>

                      <!-- Date soumission -->
                      <div class="info-card">
                        <div class="info-icon date"><i class="bi bi-calendar3"></i></div>
                        <div class="info-content">
                          <span class="info-label">Date de soumission</span>
                          <span class="info-value">{{ soutenance.createdAt | date:'dd/MM/yyyy' }}</span>
                        </div>
                      </div>

                      <!-- Date soutenance si planifiée -->
                      @if (soutenance.dateSoutenance) {
                        <div class="info-card highlight">
                          <div class="info-icon planned"><i class="bi bi-calendar-event"></i></div>
                          <div class="info-content">
                            <span class="info-label">Date de soutenance</span>
                            <span class="info-value">
                              {{ soutenance.dateSoutenance | date:'dd/MM/yyyy' }}
                              @if (soutenance.heureSoutenance) { à {{ soutenance.heureSoutenance }} }
                            </span>
                          </div>
                        </div>
                      }

                      <!-- Lieu si défini -->
                      @if (soutenance.lieuSoutenance) {
                        <div class="info-card">
                          <div class="info-icon location"><i class="bi bi-geo-alt"></i></div>
                          <div class="info-content">
                            <span class="info-label">Lieu</span>
                            <span class="info-value">{{ soutenance.lieuSoutenance }}</span>
                          </div>
                        </div>
                      }
                    </div>

                    <!-- PRÉREQUIS -->
                    <div class="prereq-section">
                      <h5 class="section-label"><i class="bi bi-list-check"></i> Prérequis du doctorant</h5>
                      <div class="prereq-grid">
                        <div class="prereq-item" [class.valid]="getDoctorantPublications(soutenance) >= 2">
                          <i class="bi" [ngClass]="getDoctorantPublications(soutenance) >= 2 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                          <span>{{ getDoctorantPublications(soutenance) }}/2 Publications Q1/Q2</span>
                        </div>
                        <div class="prereq-item" [class.valid]="getDoctorantConferences(soutenance) >= 2">
                          <i class="bi" [ngClass]="getDoctorantConferences(soutenance) >= 2 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                          <span>{{ getDoctorantConferences(soutenance) }}/2 Conférences</span>
                        </div>
                        <div class="prereq-item" [class.valid]="getDoctorantHeuresFormation(soutenance) >= 200">
                          <i class="bi" [ngClass]="getDoctorantHeuresFormation(soutenance) >= 200 ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                          <span>{{ getDoctorantHeuresFormation(soutenance) }}/200h Formation</span>
                        </div>
                      </div>
                    </div>

                    <!-- DOCUMENTS -->
                    <div class="docs-section">
                      <h5 class="section-label"><i class="bi bi-file-earmark-text"></i> Documents</h5>
                      <div class="docs-row">
                        <button class="doc-btn" [class.available]="hasManuscrit(soutenance)"
                                [disabled]="!hasManuscrit(soutenance)"
                                (click)="openDocument(soutenance.cheminManuscrit!)">
                          <i class="bi bi-file-pdf"></i>
                          Manuscrit
                          @if (hasManuscrit(soutenance)) { <i class="bi bi-box-arrow-up-right"></i> }
                        </button>
                        <button class="doc-btn" [class.available]="hasRapportPlagiat(soutenance)"
                                [disabled]="!hasRapportPlagiat(soutenance)"
                                (click)="openDocument(soutenance.cheminRapportAntiPlagiat!)">
                          <i class="bi bi-shield-check"></i>
                          Rapport Anti-Plagiat
                          @if (hasRapportPlagiat(soutenance)) { <i class="bi bi-box-arrow-up-right"></i> }
                        </button>
                      </div>
                    </div>

                    <!-- JURY (si proposé) -->
                    @if (hasMembresJury(soutenance)) {
                      <div class="jury-section">
                        <h5 class="section-label"><i class="bi bi-people"></i> Membres du Jury ({{ getMembresJuryCount(soutenance) }})</h5>
                        <div class="jury-list">
                          @for (membre of soutenance.membresJury; track membre.id) {
                            <div class="jury-member">
                              <div class="member-avatar">{{ getInitials(membre.prenom + ' ' + membre.nom) }}</div>
                              <div class="member-info">
                                <span class="member-name">{{ membre.prenom }} {{ membre.nom }}</span>
                                <span class="member-role">{{ membre.role }} - {{ membre.etablissement }}</span>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    }

                    <!-- ============================================ -->
                    <!-- ACTIONS SELON LE STATUT -->
                    <!-- ============================================ -->
                    <div class="actions-section">

                      <!-- PREREQUIS_VALIDES → Admin accepte ou rejette -->
                      @if (soutenance.statut === StatutSoutenance.PREREQUIS_VALIDES) {
                        <div class="action-box accept-box">
                          <h5 class="action-title"><i class="bi bi-clipboard-check"></i> Validation des prérequis</h5>
                          <p class="action-desc">Le directeur a validé les prérequis. Acceptez-vous cette demande de soutenance ?</p>
                          <div class="action-buttons">
                            <button class="btn-action btn-success" (click)="accepterDemande(soutenance)" [disabled]="isSubmitting()">
                              <i class="bi bi-check-lg"></i> Accepter la demande
                            </button>
                            <button class="btn-action btn-danger" (click)="rejeterDemande(soutenance)" [disabled]="isSubmitting()">
                              <i class="bi bi-x-lg"></i> Rejeter
                            </button>
                          </div>
                        </div>
                      }

                      <!-- JURY_PROPOSE → Admin valide le jury et planifie -->
                      @if (soutenance.statut === StatutSoutenance.JURY_PROPOSE) {
                        <div class="action-box jury-box">
                          <h5 class="action-title"><i class="bi bi-people"></i> Validation du Jury</h5>
                          <p class="action-desc">Le directeur a proposé {{ getMembresJuryCount(soutenance) }} membre(s) pour le jury. Validez le jury puis planifiez la soutenance.</p>

                          @if (!showPlanificationForm()) {
                            <div class="action-buttons">
                              <button class="btn-action btn-success" (click)="showPlanificationForm.set(true)" [disabled]="isSubmitting()">
                                <i class="bi bi-check-lg"></i> Valider jury & Planifier
                              </button>
                              <button class="btn-action btn-danger" (click)="refuserJury(soutenance)" [disabled]="isSubmitting()">
                                <i class="bi bi-x-lg"></i> Refuser le jury
                              </button>
                            </div>
                          } @else {
                            <!-- Formulaire de planification -->
                            <div class="planification-form">
                              <div class="form-row">
                                <div class="form-group">
                                  <label><i class="bi bi-calendar"></i> Date de soutenance</label>
                                  <input type="date" [(ngModel)]="planificationData.date" class="form-input">
                                </div>
                                <div class="form-group">
                                  <label><i class="bi bi-clock"></i> Heure</label>
                                  <input type="time" [(ngModel)]="planificationData.heure" class="form-input">
                                </div>
                              </div>
                              <div class="form-group">
                                <label><i class="bi bi-geo-alt"></i> Lieu</label>
                                <input type="text" [(ngModel)]="planificationData.lieu" placeholder="Ex: Salle de conférence A" class="form-input">
                              </div>
                              <div class="form-actions">
                                <button class="btn-cancel" (click)="showPlanificationForm.set(false)">Annuler</button>
                                <button class="btn-confirm" (click)="validerJuryEtPlanifier(soutenance)"
                                        [disabled]="!planificationData.date || isSubmitting()">
                                  @if (isSubmitting()) { <span class="spinner-sm"></span> }
                                  @else { <i class="bi bi-check-lg"></i> }
                                  Confirmer la planification
                                </button>
                              </div>
                            </div>
                          }
                        </div>
                      }

                      <!-- AUTORISEE → En attente du directeur pour proposer le jury -->
                      @if (soutenance.statut === StatutSoutenance.AUTORISEE) {
                        <div class="action-box waiting-box">
                          <h5 class="action-title"><i class="bi bi-hourglass-split"></i> En attente du directeur</h5>
                          <p class="action-desc">La demande est autorisée. Le directeur doit maintenant proposer les membres du jury.</p>
                        </div>
                      }

                      <!-- PLANIFIEE → Admin peut enregistrer le résultat -->
                      @if (soutenance.statut === StatutSoutenance.PLANIFIEE) {
                        <div class="action-box result-box">
                          <h5 class="action-title"><i class="bi bi-trophy"></i> Enregistrer le résultat</h5>
                          <p class="action-desc">La soutenance est planifiée pour le {{ soutenance.dateSoutenance | date:'dd/MM/yyyy' }}. Après la soutenance, enregistrez le résultat.</p>

                          @if (!showResultForm()) {
                            <button class="btn-action btn-primary" (click)="showResultForm.set(true)">
                              <i class="bi bi-pencil"></i> Enregistrer le résultat
                            </button>
                          } @else {
                            <div class="result-form">
                              <div class="form-row">
                                <div class="form-group">
                                  <label>Mention</label>
                                  <select [(ngModel)]="resultData.mention" class="form-input">
                                    <option value="">Sélectionner...</option>
                                    <option value="Passable">Passable</option>
                                    <option value="Assez Bien">Assez Bien</option>
                                    <option value="Bien">Bien</option>
                                    <option value="Très Bien">Très Bien</option>
                                    <option value="Très Honorable">Très Honorable</option>
                                  </select>
                                </div>
                                <div class="form-group">
                                  <label>Félicitations du jury</label>
                                  <div class="checkbox-group">
                                    <input type="checkbox" id="felicitations" [(ngModel)]="resultData.felicitations">
                                    <label for="felicitations">Oui</label>
                                  </div>
                                </div>
                              </div>
                              <div class="form-actions">
                                <button class="btn-cancel" (click)="showResultForm.set(false)">Annuler</button>
                                <button class="btn-confirm" (click)="enregistrerResultat(soutenance)"
                                        [disabled]="!resultData.mention || isSubmitting()">
                                  @if (isSubmitting()) { <span class="spinner-sm"></span> }
                                  @else { <i class="bi bi-check-lg"></i> }
                                  Enregistrer
                                </button>
                              </div>
                            </div>
                          }
                        </div>
                      }

                      <!-- TERMINEE → Afficher le résultat -->
                      @if (soutenance.statut === StatutSoutenance.TERMINEE) {
                        <div class="action-box done-box">
                          <h5 class="action-title"><i class="bi bi-trophy"></i> Soutenance terminée</h5>
                          <div class="result-display">
                            <span class="result-mention">{{ soutenance.mention || 'Non spécifiée' }}</span>
                            @if (soutenance.felicitationsJury) {
                              <span class="felicitations-badge"><i class="bi bi-star-fill"></i> Félicitations du jury</span>
                            }
                          </div>
                        </div>
                      }

                      <!-- SOUMIS → En attente du directeur -->
                      @if (soutenance.statut === StatutSoutenance.SOUMIS) {
                        <div class="action-box waiting-box">
                          <h5 class="action-title"><i class="bi bi-hourglass-split"></i> En attente du directeur</h5>
                          <p class="action-desc">Cette demande est en attente de validation des prérequis par le directeur de thèse.</p>
                        </div>
                      }

                    </div>
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>
    </app-main-layout>
  `,
  styles: [`
    .soutenances-container { max-width: 1400px; margin: 0 auto; }

    /* PAGE HEADER */
    .page-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-title { font-size: 1.75rem; font-weight: 800; margin: 0; display: flex; align-items: center; }
    .page-subtitle { margin: 0.5rem 0 0 0; opacity: 0.9; }
    .btn-refresh {
      padding: 0.75rem 1.5rem;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.2s;
    }
    .btn-refresh:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.2); }

    /* STATS ROW */
    .stats-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }
    .stat-icon {
      width: 45px;
      height: 45px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .stat-total .stat-icon { background: #e0e7ff; color: #4f46e5; }
    .stat-prerequis .stat-icon { background: #fef3c7; color: #d97706; }
    .stat-jury .stat-icon { background: #dbeafe; color: #2563eb; }
    .stat-authorized .stat-icon { background: #d1fae5; color: #059669; }
    .stat-planned .stat-icon { background: #fce7f3; color: #db2777; }
    .stat-done .stat-icon { background: #ede9fe; color: #7c3aed; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: #1e293b; display: block; }
    .stat-label { font-size: 0.7rem; color: #64748b; }

    /* FILTER SECTION */
    .filter-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 0.5rem; background: white; padding: 0.5rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); flex-wrap: wrap; }
    .filter-tab {
      padding: 0.6rem 1rem;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .filter-tab:hover { background: #f1f5f9; }
    .filter-tab.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .tab-count { background: rgba(255,255,255,0.2); padding: 0.1rem 0.4rem; border-radius: 20px; font-size: 0.7rem; }
    .filter-tab:not(.active) .tab-count { background: #e2e8f0; color: #475569; }
    .search-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: white;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      min-width: 250px;
    }
    .search-box i { color: #94a3b8; }
    .search-box input { border: none; outline: none; flex: 1; font-size: 0.9rem; }

    /* SOUTENANCES LIST */
    .soutenances-list { display: flex; flex-direction: column; gap: 1rem; }

    /* LOADING & EMPTY */
    .loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; background: white; border-radius: 20px; text-align: center; }
    .spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #667eea; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state i { font-size: 4rem; color: #cbd5e1; margin-bottom: 1rem; }

    /* SOUTENANCE CARD */
    .soutenance-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      border-left: 4px solid #e2e8f0;
      transition: all 0.3s;
    }
    .soutenance-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
    .soutenance-card.expanded { border-color: #667eea; }
    .soutenance-card.status-soumis { border-left-color: #94a3b8; }
    .soutenance-card.status-prerequis { border-left-color: #f59e0b; }
    .soutenance-card.status-autorisee { border-left-color: #10b981; }
    .soutenance-card.status-jury { border-left-color: #3b82f6; }
    .soutenance-card.status-planifiee { border-left-color: #ec4899; }
    .soutenance-card.status-terminee { border-left-color: #8b5cf6; }
    .soutenance-card.status-rejetee { border-left-color: #ef4444; }

    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; cursor: pointer; }
    .doctorant-info { display: flex; align-items: center; gap: 1rem; }
    .avatar { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1rem; }
    .doctorant-name { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
    .doctorant-contact { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.25rem; }
    .contact-item { display: flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; color: #64748b; }
    .contact-item i { color: #8b5cf6; font-size: 0.75rem; }
    .header-right { display: flex; align-items: center; gap: 1rem; }
    .expand-icon { color: #94a3b8; transition: transform 0.3s; }
    .expand-icon.rotated { transform: rotate(180deg); }

    .status-badge { padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; }
    .status-badge.status-soumis { background: #f1f5f9; color: #64748b; }
    .status-badge.status-prerequis { background: #fef3c7; color: #d97706; }
    .status-badge.status-autorisee { background: #d1fae5; color: #059669; }
    .status-badge.status-jury { background: #dbeafe; color: #2563eb; }
    .status-badge.status-planifiee { background: #fce7f3; color: #db2777; }
    .status-badge.status-terminee { background: #ede9fe; color: #7c3aed; }
    .status-badge.status-rejetee { background: #fee2e2; color: #dc2626; }

    /* CARD BODY */
    .card-body { padding: 1.5rem; border-top: 1px solid #e2e8f0; background: #fafbfc; }
    .section-label { font-size: 0.8rem; font-weight: 700; color: #475569; margin: 0 0 0.75rem; display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .thesis-section { margin-bottom: 1.5rem; }
    .thesis-title { font-size: 1rem; color: #334155; margin: 0; line-height: 1.5; }

    /* INFO GRID */
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .info-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: white; border-radius: 10px; border: 1px solid #e2e8f0; }
    .info-card.highlight { background: #f0fdf4; border-color: #86efac; }
    .info-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
    .info-icon.director { background: #ede9fe; color: #7c3aed; }
    .info-icon.date { background: #dbeafe; color: #2563eb; }
    .info-icon.planned { background: #d1fae5; color: #059669; }
    .info-icon.location { background: #fef3c7; color: #d97706; }
    .info-label { font-size: 0.7rem; color: #64748b; display: block; }
    .info-value { font-size: 0.85rem; font-weight: 600; color: #1e293b; }

    /* PREREQ */
    .prereq-section { margin-bottom: 1.5rem; padding: 1rem; background: white; border-radius: 10px; border: 1px solid #e2e8f0; }
    .prereq-grid { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .prereq-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #ef4444; }
    .prereq-item.valid { color: #059669; }

    /* DOCS */
    .docs-section { margin-bottom: 1.5rem; }
    .docs-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .doc-btn {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1rem;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #94a3b8;
      cursor: not-allowed;
    }
    .doc-btn.available { background: #f0fdf4; border-color: #86efac; color: #059669; cursor: pointer; }
    .doc-btn.available:hover { background: #dcfce7; }

    /* JURY */
    .jury-section { margin-bottom: 1.5rem; padding: 1rem; background: white; border-radius: 10px; border: 1px solid #e2e8f0; }
    .jury-list { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .jury-member { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
    .member-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; }
    .member-name { font-size: 0.85rem; font-weight: 600; color: #1e293b; display: block; }
    .member-role { font-size: 0.7rem; color: #64748b; }

    /* ACTIONS */
    .actions-section { margin-top: 1rem; }
    .action-box { padding: 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0; }
    .action-box.accept-box { background: #fffbeb; border-color: #fcd34d; }
    .action-box.jury-box { background: #eff6ff; border-color: #93c5fd; }
    .action-box.waiting-box { background: #f8fafc; border-color: #e2e8f0; }
    .action-box.result-box { background: #fdf4ff; border-color: #e879f9; }
    .action-box.done-box { background: #f0fdf4; border-color: #86efac; }
    .action-title { font-size: 0.9rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
    .action-desc { font-size: 0.85rem; color: #64748b; margin: 0 0 1rem; }
    .action-buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .btn-action {
      padding: 0.7rem 1.25rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-action:hover:not(:disabled) { transform: translateY(-1px); }
    .btn-success { background: linear-gradient(135deg, #10b981, #059669); color: white; }
    .btn-primary { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
    .btn-danger { background: white; color: #dc2626; border: 1px solid #fca5a5; }
    .btn-danger:hover:not(:disabled) { background: #fef2f2; }

    /* FORMS */
    .planification-form, .result-form { margin-top: 1rem; padding: 1rem; background: white; border-radius: 10px; border: 1px solid #e2e8f0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 0.4rem; }
    .form-input { padding: 0.6rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; }
    .form-input:focus { outline: none; border-color: #667eea; }
    .checkbox-group { display: flex; align-items: center; gap: 0.5rem; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; }
    .btn-cancel { padding: 0.6rem 1rem; background: #f1f5f9; border: none; border-radius: 8px; color: #64748b; font-weight: 600; cursor: pointer; }
    .btn-confirm { padding: 0.6rem 1.25rem; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
    .btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

    /* RESULT DISPLAY */
    .result-display { display: flex; align-items: center; gap: 1rem; }
    .result-mention { font-size: 1.1rem; font-weight: 700; color: #059669; }
    .felicitations-badge { background: #fef3c7; color: #d97706; padding: 0.4rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; }

    /* RESPONSIVE */
    @media (max-width: 1200px) { .stats-row { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .filter-section { flex-direction: column; }
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class SoutenanceListComponent implements OnInit {
  StatutSoutenance = StatutSoutenance;

  soutenances = signal<Soutenance[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  activeFilter = signal<'all' | 'prerequis' | 'jury' | 'authorized' | 'planned'>('all');
  searchTerm = signal('');
  expandedId = signal<number | null>(null);

  showPlanificationForm = signal(false);
  showResultForm = signal(false);

  planificationData = { date: '', heure: '09:00', lieu: '' };
  resultData = { mention: '', felicitations: false };

  // Compteurs
  totalCount = computed(() => this.soutenances().length);
  prerequisCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.PREREQUIS_VALIDES).length);
  juryCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.JURY_PROPOSE).length);
  authorizedCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.AUTORISEE).length);
  plannedCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.PLANIFIEE).length);
  doneCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.TERMINEE).length);

  filteredSoutenances = computed(() => {
    let result = this.soutenances().filter(s => s.statut !== StatutSoutenance.BROUILLON);

    switch (this.activeFilter()) {
      case 'prerequis': result = result.filter(s => s.statut === StatutSoutenance.PREREQUIS_VALIDES); break;
      case 'jury': result = result.filter(s => s.statut === StatutSoutenance.JURY_PROPOSE); break;
      case 'authorized': result = result.filter(s => s.statut === StatutSoutenance.AUTORISEE); break;
      case 'planned': result = result.filter(s => s.statut === StatutSoutenance.PLANIFIEE); break;
    }

    const search = this.searchTerm().toLowerCase();
    if (search) {
      result = result.filter(s =>
          this.getDoctorantNom(s).toLowerCase().includes(search) ||
          (s.titreThese?.toLowerCase().includes(search))
      );
    }

    return result;
  });

  constructor(private soutenanceService: SoutenanceService, private router: Router) {}

  ngOnInit(): void { this.loadSoutenances(); }

  loadSoutenances(): void {
    this.isLoading.set(true);
    this.soutenanceService.getAllSoutenances().subscribe({
      next: (data) => { this.soutenances.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  setFilter(filter: 'all' | 'prerequis' | 'jury' | 'authorized' | 'planned'): void {
    this.activeFilter.set(filter);
  }

  toggleExpand(id: number): void {
    if (this.expandedId() === id) {
      this.expandedId.set(null);
      this.resetForms();
    } else {
      this.expandedId.set(id);
      this.resetForms();
    }
  }

  resetForms(): void {
    this.showPlanificationForm.set(false);
    this.showResultForm.set(false);
    this.planificationData = { date: '', heure: '09:00', lieu: '' };
    this.resultData = { mention: '', felicitations: false };
  }

  // ========================================
  // HELPERS
  // ========================================

  getDoctorantNom(s: Soutenance): string {
    return s.doctorantInfo ? `${s.doctorantInfo.prenom} ${s.doctorantInfo.nom}` : `Doctorant #${s.doctorantId}`;
  }

  getDirecteurNom(s: Soutenance): string {
    return s.directeurInfo ? `${s.directeurInfo.prenom} ${s.directeurInfo.nom}` : `Directeur #${s.directeurId}`;
  }

  getDoctorantPublications(s: Soutenance): number {
    const info = s.doctorantInfo as any;
    return info?.nbPublications ?? info?.nb_publications ?? s.prerequis?.nombreArticlesQ1Q2 ?? 0;
  }

  getDoctorantConferences(s: Soutenance): number {
    const info = s.doctorantInfo as any;
    return info?.nbConferences ?? info?.nb_conferences ?? s.prerequis?.nombreConferences ?? 0;
  }

  getDoctorantHeuresFormation(s: Soutenance): number {
    const info = s.doctorantInfo as any;
    return info?.heuresFormation ?? info?.heures_formation ?? s.prerequis?.heuresFormation ?? 0;
  }

  hasManuscrit(s: Soutenance): boolean { return !!s.cheminManuscrit; }
  hasRapportPlagiat(s: Soutenance): boolean { return !!s.cheminRapportAntiPlagiat; }
  hasMembresJury(s: Soutenance): boolean { return !!s.membresJury?.length; }
  getMembresJuryCount(s: Soutenance): number { return s.membresJury?.length || 0; }

  openDocument(path: string): void { this.soutenanceService.openDocument(path); }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name[0]?.toUpperCase() || '?';
  }

  getAvatarColor(id: number): string {
    const colors = ['linear-gradient(135deg, #667eea, #764ba2)', 'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)', 'linear-gradient(135deg, #43e97b, #38f9d7)'];
    return colors[id % colors.length];
  }

  getCardClass(statut: StatutSoutenance): string {
    const map: Record<string, string> = {
      SOUMIS: 'status-soumis', PREREQUIS_VALIDES: 'status-prerequis', AUTORISEE: 'status-autorisee',
      JURY_PROPOSE: 'status-jury', PLANIFIEE: 'status-planifiee', TERMINEE: 'status-terminee', REJETEE: 'status-rejetee'
    };
    return map[statut] || '';
  }

  getStatusBadgeClass(statut: StatutSoutenance): string { return this.getCardClass(statut); }

  getStatusIcon(statut: StatutSoutenance): string {
    const map: Record<string, string> = {
      SOUMIS: 'bi-clock', PREREQUIS_VALIDES: 'bi-clipboard-check', AUTORISEE: 'bi-check-circle',
      JURY_PROPOSE: 'bi-people', PLANIFIEE: 'bi-calendar-check', TERMINEE: 'bi-trophy', REJETEE: 'bi-x-circle'
    };
    return map[statut] || 'bi-file';
  }

  formatStatut(statut: StatutSoutenance): string {
    const map: Record<string, string> = {
      SOUMIS: 'En attente directeur', PREREQUIS_VALIDES: 'Prérequis validés', AUTORISEE: 'Autorisée - En attente jury',
      JURY_PROPOSE: 'Jury proposé', PLANIFIEE: 'Planifiée', TERMINEE: 'Terminée', REJETEE: 'Rejetée'
    };
    return map[statut] || statut;
  }

  getEmptyMessage(): string {
    const map: Record<string, string> = {
      prerequis: 'Aucune demande avec prérequis à valider', jury: 'Aucun jury à valider',
      authorized: 'Aucune soutenance à planifier', planned: 'Aucune soutenance planifiée'
    };
    return map[this.activeFilter()] || 'Aucune soutenance';
  }

  // ========================================
  // ACTIONS
  // ========================================

  accepterDemande(s: Soutenance): void {
    if (confirm(`Accepter la demande de ${this.getDoctorantNom(s)} ? Elle passera en statut AUTORISÉE.`)) {
      this.isSubmitting.set(true);
      // On utilise validerJury avec un statut spécial - ou on crée un nouvel endpoint
      // Pour l'instant, on change directement vers AUTORISEE
      this.soutenanceService.autoriserSoutenance(s.id).subscribe({
        next: () => { this.loadSoutenances(); this.isSubmitting.set(false); },
        error: () => { alert('Erreur'); this.isSubmitting.set(false); }
      });
    }
  }

  rejeterDemande(s: Soutenance): void {
    const motif = prompt('Motif du rejet :');
    if (motif?.trim()) {
      this.isSubmitting.set(true);
      this.soutenanceService.rejeterSoutenance(s.id, motif.trim()).subscribe({
        next: () => { this.loadSoutenances(); this.isSubmitting.set(false); },
        error: () => { alert('Erreur'); this.isSubmitting.set(false); }
      });
    }
  }

  refuserJury(s: Soutenance): void {
    const motif = prompt('Motif du refus du jury :');
    if (motif?.trim()) {
      this.isSubmitting.set(true);
      this.soutenanceService.refuserJury(s.id, motif.trim()).subscribe({
        next: () => { this.loadSoutenances(); this.isSubmitting.set(false); },
        error: () => { alert('Erreur'); this.isSubmitting.set(false); }
      });
    }
  }

  validerJuryEtPlanifier(s: Soutenance): void {
    if (!this.planificationData.date) return;

    this.isSubmitting.set(true);
    // D'abord valider le jury, puis planifier
    this.soutenanceService.validerJury(s.id, 'Jury validé').subscribe({
      next: () => {
        // Ensuite planifier
        this.soutenanceService.planifierSoutenance(s.id, {
          dateSoutenance: this.planificationData.date,
          heureSoutenance: this.planificationData.heure,
          lieuSoutenance: this.planificationData.lieu
        }).subscribe({
          next: () => {
            alert('Jury validé et soutenance planifiée !');
            this.loadSoutenances();
            this.resetForms();
            this.isSubmitting.set(false);
          },
          error: () => { alert('Erreur planification'); this.isSubmitting.set(false); }
        });
      },
      error: () => { alert('Erreur validation jury'); this.isSubmitting.set(false); }
    });
  }

  enregistrerResultat(s: Soutenance): void {
    if (!this.resultData.mention) return;

    this.isSubmitting.set(true);
    this.soutenanceService.enregistrerResultat(s.id, {
      mention: this.resultData.mention,
      felicitations: this.resultData.felicitations
    }).subscribe({
      next: () => {
        alert('Résultat enregistré !');
        this.loadSoutenances();
        this.resetForms();
        this.isSubmitting.set(false);
      },
      error: () => { alert('Erreur'); this.isSubmitting.set(false); }
    });
  }
}