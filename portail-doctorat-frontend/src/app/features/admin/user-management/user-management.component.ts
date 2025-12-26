import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterLink, MainLayoutComponent, FormsModule],
  template: `
    <app-main-layout>
      <div class="page-container p-4">

        <!-- Header -->
        <div class="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 class="fw-bold text-dark mb-2">Gestion des Utilisateurs</h2>
            <p class="text-muted mb-0">Gérez les candidatures, directeurs et doctorants.</p>
          </div>
          <button class="btn btn-white border shadow-sm text-primary fw-bold rounded-pill px-4 d-flex align-items-center gap-2"
                  (click)="loadData()"
                  [disabled]="isLoading()">
            <span *ngIf="isLoading()" class="spinner-border spinner-border-sm"></span>
            <i *ngIf="!isLoading()" class="bi bi-arrow-clockwise"></i>
            Actualiser
          </button>
        </div>

        <!-- Tabs Switcher -->
        <div class="switcher-container mb-5">
          <div class="switcher">
            <button class="switcher-btn"
                    [class.active]="activeTab === 'CANDIDATS'"
                    (click)="setTab('CANDIDATS')">
              <i class="bi bi-person-lines-fill me-2"></i>
              Candidatures
              <span *ngIf="candidats().length > 0"
                    class="badge ms-2 rounded-pill"
                    [ngClass]="activeTab === 'CANDIDATS' ? 'bg-primary-subtle text-primary' : 'bg-danger text-white'">
                {{ candidats().length }}
              </span>
            </button>

            <button class="switcher-btn"
                    [class.active]="activeTab === 'DIRECTEURS'"
                    (click)="setTab('DIRECTEURS')">
              <i class="bi bi-person-video3 me-2"></i>
              Directeurs
              <span class="badge ms-2 rounded-pill bg-secondary text-white">
                {{ directeurs().length }}
              </span>
            </button>

            <button class="switcher-btn"
                    [class.active]="activeTab === 'DOCTORANTS'"
                    (click)="setTab('DOCTORANTS')">
              <i class="bi bi-mortarboard-fill me-2"></i>
              Doctorants
              <span class="badge ms-2 rounded-pill"
                    [ngClass]="activeTab === 'DOCTORANTS' ? 'bg-success-subtle text-success' : 'bg-secondary text-white'">
                {{ doctorants().length }}
              </span>
            </button>
          </div>
        </div>

        <!-- ==================== TAB: CANDIDATS ==================== -->
        @if (activeTab === 'CANDIDATS') {
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in-up">
            <div class="table-responsive">
              <table class="table align-middle mb-0">
                <thead class="bg-light text-uppercase text-muted small fw-bold">
                <tr>
                  <th class="ps-4 py-3">Candidat</th>
                  <th>Contact</th>
                  <th>Date demande</th>
                  <th>État</th>
                  <th class="text-end pe-4">Action</th>
                </tr>
                </thead>
                <tbody>
                  @for (user of candidats(); track user.id) {
                    <tr class="cursor-pointer main-row" [class.expanded]="expandedUserId() === user.id" (click)="toggleExpand(user.id)">
                      <td class="ps-4">
                        <div class="d-flex align-items-center gap-3">
                          <div class="avatar-circle shadow-sm">{{ user.nom.charAt(0).toUpperCase() }}</div>
                          <div>
                            <div class="fw-bold text-dark">{{ user.nom }} {{ user.prenom }}</div>
                            <div class="small text-muted">Mat: {{ user.username }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="text-dark">{{ user.email }}</div>
                        <div class="small text-muted">{{ user.telephone || 'Non renseigné' }}</div>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark border">
                          <i class="bi bi-calendar3 me-1"></i>{{ user.createdAt | date:'dd MMM yyyy' }}
                        </span>
                      </td>
                      <td>
                        <span class="badge rounded-pill px-3 py-2" [ngClass]="getEtatBadgeClass(user.etat)">
                          {{ formatEtat(user.etat) }}
                        </span>
                      </td>
                      <td class="text-end pe-4">
                        <i class="bi bi-chevron-down transition-icon" [class.rotate]="expandedUserId() === user.id"></i>
                      </td>
                    </tr>

                    <!-- Expanded Detail Row -->
                    @if (expandedUserId() === user.id) {
                      <tr class="detail-row">
                        <td colspan="5" class="p-0 border-0">
                          <div class="detail-panel p-4">
                            <div class="row g-4">

                              <!-- Infos Personnelles -->
                              <div class="col-md-4">
                                <div class="detail-card h-100">
                                  <h6 class="section-title text-primary"><i class="bi bi-person-badge me-2"></i>Infos Personnelles</h6>
                                  <div class="mt-3">
                                    <div class="mb-3"><small class="text-muted d-block mb-1">Matricule / CNIE</small><div class="fw-bold fs-6">{{ user.username }}</div></div>
                                    <div class="mb-3"><small class="text-muted d-block mb-1">Téléphone</small><div class="fs-6">{{ user.telephone || 'Non renseigné' }}</div></div>
                                    <div><small class="text-muted d-block mb-1">Email</small><div class="text-break fs-6">{{ user.email }}</div></div>
                                  </div>
                                </div>
                              </div>

                              <!-- Documents -->
                              <div class="col-md-4">
                                <div class="detail-card h-100">
                                  <h6 class="section-title text-primary"><i class="bi bi-folder2-open me-2"></i>Documents</h6>
                                  <div class="d-flex flex-column gap-3 mt-3">

                                    <div class="doc-item" [class.disabled]="!user.cv" (click)="viewDocument(user.cv, $event)">
                                      <div class="icon-box bg-purple-subtle text-purple flex-shrink-0">
                                        <i class="bi bi-file-earmark-person-fill fs-3"></i>
                                      </div>
                                      <div class="ms-3 flex-grow-1">
                                        <div class="fw-bold fs-6">Curriculum Vitae</div>
                                        <small class="text-muted">{{ user.cv ? 'Téléchargé' : 'Non fourni' }}</small>
                                      </div>
                                    </div>

                                    <div class="doc-item" [class.disabled]="!user.diplome" (click)="viewDocument(user.diplome, $event)">
                                      <div class="icon-box bg-blue-subtle text-primary flex-shrink-0">
                                        <i class="bi bi-mortarboard-fill fs-3"></i>
                                      </div>
                                      <div class="ms-3 flex-grow-1">
                                        <div class="fw-bold fs-6">Diplôme</div>
                                        <small class="text-muted">{{ user.diplome ? 'Téléchargé' : 'Non fourni' }}</small>
                                      </div>
                                    </div>

                                    <div class="doc-item" [class.disabled]="!user.lettreMotivation" (click)="viewDocument(user.lettreMotivation, $event)">
                                      <div class="icon-box bg-orange-subtle text-orange flex-shrink-0">
                                        <i class="bi bi-envelope-paper-fill fs-3"></i>
                                      </div>
                                      <div class="ms-3 flex-grow-1">
                                        <div class="fw-bold fs-6">Lettre de Motivation</div>
                                        <small class="text-muted">{{ user.lettreMotivation ? 'Téléchargé' : 'Non fourni' }}</small>
                                      </div>
                                    </div>

                                  </div>
                                </div>
                              </div>

                              <!-- Décision -->
                              <div class="col-md-4">
                                <div class="detail-card h-100 border-start-decision">
                                  <h6 class="section-title text-dark"><i class="bi bi-gavel me-2"></i>Décision</h6>

                                  <!-- État: EN_ATTENTE_ADMIN - Boutons d'action -->
                                  <div *ngIf="user.etat === 'EN_ATTENTE_ADMIN' || !user.etat" class="h-100 d-flex flex-column justify-content-center">
                                    <div *ngIf="showRefusalInputId() !== user.id" class="d-flex flex-column gap-3">
                                      <button class="btn btn-success text-white py-2 shadow-sm" (click)="openDirectorModal(user, $event)">
                                        <i class="bi bi-check-lg me-2"></i>Valider & Assigner Directeur
                                      </button>
                                      <button class="btn btn-outline-danger py-2" (click)="initiateRefusal(user.id, $event)">
                                        <i class="bi bi-x-lg me-2"></i>Refuser le dossier
                                      </button>
                                    </div>

                                    <!-- Refusal Input -->
                                    <div *ngIf="showRefusalInputId() === user.id" class="mt-2 fade-in">
                                      <label class="small text-danger fw-bold mb-1">Motif de refus :</label>
                                      <textarea class="form-control bg-light mb-2" rows="3" [(ngModel)]="motifText" placeholder="Ex: Dossier incomplet..."></textarea>
                                      <div class="d-flex gap-2">
                                        <button class="btn btn-sm btn-light flex-grow-1" (click)="cancelRefusal($event)">Annuler</button>
                                        <button class="btn btn-sm btn-danger flex-grow-1" [disabled]="!motifText.trim()" (click)="confirmRefusal(user, $event)">Confirmer</button>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    }
                  }
                  @if (candidats().length === 0) {
                    <tr><td colspan="5" class="text-center py-5 text-muted">
                      <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                      Aucune candidature en attente.
                    </td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ==================== TAB: DIRECTEURS ==================== -->
        @if (activeTab === 'DIRECTEURS') {
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in-up">
            <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between pe-4 ps-4">
              <h5 class="mb-0 fw-bold text-primary">Liste des Directeurs de Thèse</h5>
              <a [routerLink]="['/admin/users/new-director']" class="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-2">
                <i class="bi bi-plus-lg"></i>
                Ajouter
              </a>
            </div>
            <div class="card-body p-0">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                <tr>
                  <th class="ps-4 py-3">Directeur</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Doctorants</th>
                  <th class="text-end pe-4">ID</th>
                </tr>
                </thead>
                <tbody>
                  @for (dir of directeurs(); track dir.id) {
                    <tr>
                      <td class="ps-4">
                        <div class="d-flex align-items-center gap-3">
                          <div class="avatar-circle-sm bg-primary text-white">{{ dir.nom?.charAt(0) }}{{ dir.prenom?.charAt(0) }}</div>
                          <div class="fw-bold">{{ dir.nom }} {{ dir.prenom }}</div>
                        </div>
                      </td>
                      <td>{{ dir.email }}</td>
                      <td>{{ dir.telephone || '-' }}</td>
                      <td>
                        <span class="badge bg-primary-subtle text-primary rounded-pill">
                          {{ getDoctorantsCountForDirecteur(dir.id) }}
                        </span>
                      </td>
                      <td class="text-end pe-4 text-muted">#{{ dir.id }}</td>
                    </tr>
                  }
                  @if (directeurs().length === 0) {
                    <tr><td colspan="5" class="text-center py-5 text-muted">
                      <i class="bi bi-person-video3 fs-1 d-block mb-2 opacity-25"></i>
                      Aucun directeur enregistré.
                    </td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ==================== TAB: DOCTORANTS ==================== -->
        @if (activeTab === 'DOCTORANTS') {
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in-up">
            <div class="card-header bg-white py-3 border-bottom ps-4">
              <h5 class="mb-0 fw-bold text-success">Liste des Doctorants Inscrits</h5>
            </div>
            <div class="card-body p-0">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                <tr>
                  <th class="ps-4 py-3">Doctorant</th>
                  <th>Matricule</th>
                  <th>Directeur</th>
                  <th>Année</th>
                  <th>Statut</th>
                </tr>
                </thead>
                <tbody>
                  @for (doc of doctorants(); track doc.id) {
                    <tr>
                      <td class="ps-4">
                        <div class="fw-bold">{{ doc.nom }} {{ doc.prenom }}</div>
                        <div class="small text-muted">{{ doc.email }}</div>
                      </td>
                      <td><span class="badge bg-light text-dark border">{{ doc.username }}</span></td>
                      <td>
                        <span class="text-primary fw-medium">{{ getDirecteurName(doc.directeurId) }}</span>
                      </td>
                      <td>
                        <span class="badge bg-info-subtle text-info">{{ doc.anneeThese || 1 }}ère année</span>
                      </td>
                      <td><span class="badge bg-success-subtle text-success rounded-pill">ACTIF</span></td>
                    </tr>
                  }
                  @if (doctorants().length === 0) {
                    <tr><td colspan="5" class="text-center py-5 text-muted">
                      <i class="bi bi-mortarboard fs-1 d-block mb-2 opacity-25"></i>
                      Aucun doctorant inscrit.
                    </td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

      </div>

      <!-- ==================== MODAL: Sélection Directeur ==================== -->
      @if (showDirectorModal()) {
        <div class="modal-backdrop" (click)="closeDirectorModal()"></div>
        <div class="modal-container">
          <div class="modal-content">
            <div class="modal-header-custom">
              <div class="modal-icon">
                <i class="bi bi-person-check"></i>
              </div>
              <div>
                <h4 class="modal-title">Assigner un Directeur de Thèse</h4>
                <p class="modal-subtitle">Pour le candidat <strong>{{ selectedCandidat()?.nom }} {{ selectedCandidat()?.prenom }}</strong></p>
              </div>
              <button class="modal-close" (click)="closeDirectorModal()">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <div class="modal-body">
              <!-- Search -->
              <div class="search-box">
                <i class="bi bi-search"></i>
                <input
                    type="text"
                    placeholder="Rechercher un directeur..."
                    [(ngModel)]="searchDirecteur"
                    class="search-input">
              </div>

              <!-- Liste des directeurs -->
              <div class="directors-list">
                @for (dir of filteredDirecteurs(); track dir.id) {
                  <div
                      class="director-card"
                      [class.selected]="selectedDirecteurId() === dir.id"
                      (click)="selectDirecteur(dir.id)">
                    <div class="director-avatar">
                      {{ dir.nom?.charAt(0) }}{{ dir.prenom?.charAt(0) }}
                    </div>
                    <div class="director-info">
                      <div class="director-name">{{ dir.nom }} {{ dir.prenom }}</div>
                      <div class="director-email">{{ dir.email }}</div>
                      <div class="director-stats">
                        <span class="stat-badge">
                          <i class="bi bi-people"></i>
                          {{ getDoctorantsCountForDirecteur(dir.id) }} doctorant(s)
                        </span>
                      </div>
                    </div>
                    <div class="director-check" *ngIf="selectedDirecteurId() === dir.id">
                      <i class="bi bi-check-circle-fill"></i>
                    </div>
                  </div>
                }

                @if (filteredDirecteurs().length === 0) {
                  <div class="no-results">
                    <i class="bi bi-search"></i>
                    <p>Aucun directeur trouvé</p>
                  </div>
                }
              </div>
            </div>

            <div class="modal-footer-custom">
              <button class="btn-cancel" (click)="closeDirectorModal()">
                Annuler
              </button>
              <button
                  class="btn-confirm"
                  [disabled]="!selectedDirecteurId() || isValidating()"
                  (click)="confirmValidationWithDirector()">
                @if (isValidating()) {
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Validation...
                } @else {
                  <i class="bi bi-check-lg me-2"></i>
                  Valider et Assigner
                }
              </button>
            </div>
          </div>
        </div>
      }

    </app-main-layout>
  `,
  styles: [`
    /* STRUCTURE GLOBALE */
    .switcher-container { display: flex; justify-content: center; width: 100%; }
    .switcher { background-color: #f1f5f9; padding: 5px; border-radius: 50px; display: inline-flex; gap: 5px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.03); }
    .switcher-btn { border: none; background: transparent; padding: 10px 24px; border-radius: 40px; font-weight: 600; color: #64748b; font-size: 0.95rem; display: flex; align-items: center; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); cursor: pointer; }
    .switcher-btn:hover { color: #334155; }
    .switcher-btn.active { background-color: #ffffff; color: #4f46e5; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: scale(1.02); }

    /* TABLEAU */
    .main-row { transition: background 0.2s; border-bottom: 1px solid #f1f5f9; cursor: pointer; }
    .main-row:hover { background-color: #f8fafc; }
    .main-row.expanded { background-color: #eef2ff; border-left: 4px solid #4f46e5; }
    .avatar-circle { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .avatar-circle-sm { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; }
    .transition-icon { transition: transform 0.3s; }
    .rotate { transform: rotate(180deg); }

    /* DETAIL PANEL */
    .detail-row { background-color: #f8fafc; box-shadow: inset 0 6px 10px -8px rgba(0,0,0,0.1); }
    .detail-panel { animation: slideDown 0.3s ease-out; }
    .detail-card { background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; }
    .section-title { font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.8px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 16px; }

    /* DOCUMENTS */
    .doc-item {
      display: flex; align-items: center;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
      background: #fff;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }
    .doc-item:hover { border-color: #4f46e5; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.1); transform: translateY(-2px); }
    .doc-item.disabled { opacity: 0.6; cursor: not-allowed; background: #f8fafc; border-style: dashed; }

    .icon-box {
      width: 48px; height: 48px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .bg-purple-subtle { background: #f3e8ff; } .text-purple { color: #9333ea; }
    .bg-blue-subtle { background: #dbeafe; } .text-primary { color: #2563eb; }
    .bg-orange-subtle { background: #ffedd5; } .text-orange { color: #ea580c; }

    /* DECISION & ANIMATIONS */
    .border-start-decision { border-left: 4px solid #cbd5e1; }
    .fade-in { animation: fadeIn 0.3s; }
    .fade-in-up { animation: fadeInUp 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    /* BADGES */
    .bg-info-subtle { background: #e0f2fe; color: #0369a1; }
    .bg-success-subtle { background: #dcfce7; color: #15803d; }
    .bg-danger-subtle { background: #fee2e2; color: #b91c1c; }
    .bg-warning-subtle { background: #fef3c7; color: #b45309; }
    .bg-primary-subtle { background: #e0e7ff; color: #4338ca; }

    /* ==================== MODAL STYLES ==================== */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 1000;
      animation: fadeIn 0.2s;
    }

    .modal-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1001;
      width: 100%;
      max-width: 540px;
      animation: modalSlideIn 0.3s ease-out;
    }

    @keyframes modalSlideIn {
      from { opacity: 0; transform: translate(-50%, -48%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }

    .modal-content {
      background: white;
      border-radius: 24px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }

    .modal-header-custom {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      position: relative;
    }

    .modal-icon {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .modal-subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 36px;
      height: 36px;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .modal-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    .modal-body {
      padding: 1.5rem;
      max-height: 400px;
      overflow-y: auto;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: #f1f5f9;
      border-radius: 12px;
      margin-bottom: 1rem;
    }

    .search-box i {
      color: #94a3b8;
      font-size: 1.1rem;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.95rem;
      outline: none;
    }

    .directors-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .director-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .director-card:hover {
      border-color: #818cf8;
      background: #f5f3ff;
    }

    .director-card.selected {
      border-color: #6366f1;
      background: #eef2ff;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .director-avatar {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .director-info {
      flex: 1;
    }

    .director-name {
      font-weight: 700;
      color: #1e293b;
      font-size: 1rem;
    }

    .director-email {
      font-size: 0.85rem;
      color: #64748b;
    }

    .director-stats {
      margin-top: 0.35rem;
    }

    .stat-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      color: #6366f1;
      background: #e0e7ff;
      padding: 0.25rem 0.6rem;
      border-radius: 50px;
    }

    .director-check {
      color: #22c55e;
      font-size: 1.5rem;
    }

    .no-results {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
    }

    .no-results i {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .modal-footer-custom {
      display: flex;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .btn-cancel {
      flex: 1;
      padding: 0.875rem;
      border: 2px solid #e2e8f0;
      background: white;
      color: #64748b;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      border-color: #cbd5e1;
      background: #f1f5f9;
    }

    .btn-confirm {
      flex: 2;
      padding: 0.875rem;
      border: none;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
    }

    .btn-confirm:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
    }

    .btn-confirm:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  `]
})
export class UserManagementComponent implements OnInit {

  activeTab = 'CANDIDATS';
  candidats = signal<User[]>([]);
  directeurs = signal<User[]>([]);
  doctorants = signal<User[]>([]);
  isLoading = signal(false);
  expandedUserId = signal<number | null>(null);
  showRefusalInputId = signal<number | null>(null);
  motifText = '';

  // Modal state
  showDirectorModal = signal(false);
  selectedCandidat = signal<User | null>(null);
  selectedDirecteurId = signal<number | null>(null);
  searchDirecteur = '';
  isValidating = signal(false);

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadData();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.expandedUserId.set(null);
    this.showRefusalInputId.set(null);
    this.motifText = '';
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    // Charger les candidats EN ATTENTE ADMIN uniquement
    this.userService.getUsersByRole('CANDIDAT').subscribe({
      next: users => {
        // ✅ Filtrer pour n'afficher que les EN_ATTENTE_ADMIN
        const filteredCandidats = users.filter(u =>
            !u.etat || u.etat === 'EN_ATTENTE_ADMIN'
        );
        this.candidats.set(filteredCandidats);
      },
      error: console.error
    });

    // Charger les directeurs
    this.userService.getUsersByRole('DIRECTEUR_THESE').subscribe({
      next: users => this.directeurs.set(users),
      error: console.error
    });

    // Charger les doctorants
    this.userService.getUsersByRole('DOCTORANT').subscribe({
      next: users => {
        this.doctorants.set(users);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleExpand(id: number) {
    if (this.expandedUserId() === id) {
      this.expandedUserId.set(null);
      this.showRefusalInputId.set(null);
      this.motifText = '';
    } else {
      this.expandedUserId.set(id);
      this.showRefusalInputId.set(null);
      this.motifText = '';
    }
  }

  viewDocument(filename: string | undefined, event: Event) {
    event.stopPropagation();
    if (filename) {
      window.open(this.userService.getDocumentUrl(filename), '_blank');
    }
  }

  // ==================== MODAL DIRECTEUR ====================

  openDirectorModal(user: User, event: Event) {
    event.stopPropagation();
    this.selectedCandidat.set(user);
    this.selectedDirecteurId.set(null);
    this.searchDirecteur = '';
    this.showDirectorModal.set(true);
  }

  closeDirectorModal() {
    this.showDirectorModal.set(false);
    this.selectedCandidat.set(null);
    this.selectedDirecteurId.set(null);
    this.searchDirecteur = '';
  }

  selectDirecteur(id: number) {
    this.selectedDirecteurId.set(id);
  }

  filteredDirecteurs(): User[] {
    const search = this.searchDirecteur.toLowerCase().trim();
    if (!search) return this.directeurs();

    return this.directeurs().filter(d =>
        d.nom?.toLowerCase().includes(search) ||
        d.prenom?.toLowerCase().includes(search) ||
        d.email?.toLowerCase().includes(search)
    );
  }

  confirmValidationWithDirector() {
    const candidat = this.selectedCandidat();
    const directeurId = this.selectedDirecteurId();

    if (!candidat || !directeurId) return;

    this.isValidating.set(true);

    // Appel API pour valider avec directeur
    this.userService.validerCandidatureAdminAvecDirecteur(candidat.id, directeurId).subscribe({
      next: () => {
        this.isValidating.set(false);
        this.closeDirectorModal();
        this.loadData();
        this.expandedUserId.set(null);
      },
      error: (err) => {
        console.error('Erreur validation:', err);
        this.isValidating.set(false);
        alert('Erreur lors de la validation. Veuillez réessayer.');
      }
    });
  }

  // ==================== REFUS ====================

  initiateRefusal(id: number, event: Event) {
    event.stopPropagation();
    this.showRefusalInputId.set(id);
    this.motifText = '';
  }

  cancelRefusal(event: Event) {
    event.stopPropagation();
    this.showRefusalInputId.set(null);
    this.motifText = '';
  }

  confirmRefusal(user: User, event: Event) {
    event.stopPropagation();
    if (!this.motifText.trim()) return;

    if (confirm(`Refuser définitivement le dossier de ${user.nom} ${user.prenom} ?`)) {
      this.userService.refuserCandidatureAdmin(user.id, this.motifText.trim()).subscribe({
        next: () => {
          this.loadData();
          this.showRefusalInputId.set(null);
          this.expandedUserId.set(null);
        },
        error: err => console.error(err)
      });
    }
  }

  // ==================== HELPERS ====================

  getDirecteurName(directeurId: number | undefined): string {
    if (!directeurId) return 'Non assigné';
    const directeur = this.directeurs().find(d => d.id === directeurId);
    return directeur ? `${directeur.nom} ${directeur.prenom}` : 'Inconnu';
  }

  getDoctorantsCountForDirecteur(directeurId: number): number {
    return this.doctorants().filter(d => d.directeurId === directeurId).length;
  }

  formatEtat(etat: string | undefined): string {
    if (!etat || etat === 'EN_ATTENTE_ADMIN') return 'Nouveau';
    if (etat === 'EN_ATTENTE_DIRECTEUR') return 'Attente Directeur';
    if (etat === 'VALIDE') return 'Validé';
    if (etat === 'REFUSE') return 'Refusé';
    return etat.replace(/_/g, ' ');
  }

  getEtatBadgeClass(etat: string | undefined): string {
    if (etat === 'VALIDE') return 'bg-success-subtle';
    if (etat === 'REFUSE') return 'bg-danger-subtle';
    if (etat === 'EN_ATTENTE_DIRECTEUR') return 'bg-info-subtle';
    return 'bg-warning-subtle';
  }
}