import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
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
      <div class="page-container">
        <!-- Hero Header -->
        <div class="hero-header">
          <div class="hero-content">
            <div class="hero-icon"><i class="bi bi-mortarboard-fill"></i></div>
            <div class="hero-text">
              <h1>Gestion des Soutenances</h1>
              <p>Supervision et validation des dossiers de soutenance</p>
            </div>
          </div>
          <button class="btn-refresh" (click)="loadSoutenances()" [disabled]="isLoading()">
            @if (isLoading()) { <span class="spinner"></span> } @else { <i class="bi bi-arrow-clockwise"></i> }
            Actualiser
          </button>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card" (click)="setFilter('all')" [class.active]="activeFilter() === 'all'">
            <div class="stat-icon total"><i class="bi bi-collection-fill"></i></div>
            <div class="stat-info"><span class="stat-value">{{ totalCount() }}</span><span class="stat-label">Total</span></div>
          </div>
          <div class="stat-card" (click)="setFilter('prerequis')" [class.active]="activeFilter() === 'prerequis'">
            <div class="stat-icon warning"><i class="bi bi-shield-exclamation"></i></div>
            <div class="stat-info"><span class="stat-value">{{ prerequisCount() }}</span><span class="stat-label">À Autoriser</span></div>
            @if (prerequisCount() > 0) { <span class="stat-badge pulse">Action</span> }
          </div>
          <div class="stat-card" (click)="setFilter('jury')" [class.active]="activeFilter() === 'jury'">
            <div class="stat-icon info"><i class="bi bi-people-fill"></i></div>
            <div class="stat-info"><span class="stat-value">{{ juryCount() }}</span><span class="stat-label">Jury à Valider</span></div>
          </div>
          <div class="stat-card" (click)="setFilter('planned')" [class.active]="activeFilter() === 'planned'">
            <div class="stat-icon primary"><i class="bi bi-calendar-event-fill"></i></div>
            <div class="stat-info"><span class="stat-value">{{ plannedCount() }}</span><span class="stat-label">Planifiées</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success"><i class="bi bi-trophy-fill"></i></div>
            <div class="stat-info"><span class="stat-value">{{ doneCount() }}</span><span class="stat-label">Terminées</span></div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filter-bar">
          <div class="filter-tabs">
            <button class="filter-tab" [class.active]="activeFilter() === 'all'" (click)="setFilter('all')"><i class="bi bi-grid-3x3-gap"></i> Tous</button>
            <button class="filter-tab" [class.active]="activeFilter() === 'prerequis'" (click)="setFilter('prerequis')"><i class="bi bi-shield-check"></i> À Autoriser @if (prerequisCount() > 0) { <span class="tab-badge">{{ prerequisCount() }}</span> }</button>
            <button class="filter-tab" [class.active]="activeFilter() === 'jury'" (click)="setFilter('jury')"><i class="bi bi-people"></i> Validation Jury @if (juryCount() > 0) { <span class="tab-badge">{{ juryCount() }}</span> }</button>
            <button class="filter-tab" [class.active]="activeFilter() === 'planned'" (click)="setFilter('planned')"><i class="bi bi-calendar-check"></i> Planifiées</button>
          </div>
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Rechercher..." [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)">
          </div>
        </div>

        <!-- List -->
        @if (isLoading()) {
          <div class="loading-state"><div class="spinner-lg"></div><p>Chargement...</p></div>
        } @else if (filteredSoutenances().length === 0) {
          <div class="empty-state"><div class="empty-icon"><i class="bi bi-inbox"></i></div><h3>Aucun dossier</h3></div>
        } @else {
          <div class="soutenances-list">
            @for (soutenance of filteredSoutenances(); track soutenance.id) {
              <div class="soutenance-card" [class.expanded]="expandedId() === soutenance.id" [attr.data-status]="soutenance.statut">
                <div class="card-header" (click)="toggleExpand(soutenance.id)">
                  <div class="header-left">
                    <div class="avatar" [style.background]="getAvatarColor(soutenance.doctorantId)">{{ getInitials(getDoctorantNom(soutenance)) }}</div>
                    <div class="header-info">
                      <h4>{{ getDoctorantNom(soutenance) }}</h4>
                      <div class="header-meta"><span class="matricule"><i class="bi bi-hash"></i>{{ getMatricule(soutenance) }}</span><span>•</span><span><i class="bi bi-calendar3"></i>{{ soutenance.createdAt | date:'dd/MM/yyyy' }}</span></div>
                    </div>
                  </div>
                  <div class="header-right">
                    <span class="status-badge" [ngClass]="'status-' + soutenance.statut.toLowerCase()"><i class="bi" [ngClass]="getStatusIcon(soutenance.statut)"></i> {{ formatStatut(soutenance.statut) }}</span>
                    <button class="expand-btn" [class.rotated]="expandedId() === soutenance.id"><i class="bi bi-chevron-down"></i></button>
                  </div>
                </div>

                @if (expandedId() === soutenance.id) {
                  <div class="card-body">
                    <div class="thesis-card"><div class="thesis-icon"><i class="bi bi-journal-richtext"></i></div><div class="thesis-content"><span class="label">Sujet de Thèse</span><h5>{{ soutenance.titreThese || 'Non défini' }}</h5></div></div>

                    <div class="info-grid">
                      <div class="info-card"><div class="info-icon blue"><i class="bi bi-person-workspace"></i></div><div><span class="label">Directeur</span><span class="value">{{ getDirecteurNom(soutenance) }}</span></div></div>
                      @if (soutenance.dateSoutenance) {
                        <div class="info-card highlight"><div class="info-icon purple"><i class="bi bi-calendar-event"></i></div><div><span class="label">Date Soutenance</span><span class="value">{{ soutenance.dateSoutenance | date:'dd/MM/yyyy' }} à {{ soutenance.heureSoutenance }}</span></div></div>
                      }
                    </div>

                    <div class="docs-section">
                      <h5 class="section-title"><i class="bi bi-folder2-open"></i> Documents</h5>
                      <div class="docs-grid">
                        <button class="doc-btn" [class.available]="soutenance.cheminManuscrit" [disabled]="!soutenance.cheminManuscrit" (click)="openDocument(soutenance.cheminManuscrit!)"><div class="doc-icon manuscrit"><i class="bi bi-file-earmark-pdf"></i></div><div><span class="doc-name">Manuscrit</span><span class="doc-status">@if (soutenance.cheminManuscrit) { <i class="bi bi-check-circle-fill"></i> } @else { <i class="bi bi-x-circle"></i> }</span></div></button>
                        <button class="doc-btn" [class.available]="soutenance.cheminRapportAntiPlagiat" [disabled]="!soutenance.cheminRapportAntiPlagiat" (click)="openDocument(soutenance.cheminRapportAntiPlagiat!)"><div class="doc-icon rapport"><i class="bi bi-shield-check"></i></div><div><span class="doc-name">Rapport Anti-Plagiat</span><span class="doc-status">@if (soutenance.cheminRapportAntiPlagiat) { <i class="bi bi-check-circle-fill"></i> } @else { <i class="bi bi-x-circle"></i> }</span></div></button>
                      </div>
                    </div>

                    <!-- ✅ JURY DISPLAY - CORRIGÉ AVEC DÉDUPLICATION -->
                    @if (soutenance.membresJury && soutenance.membresJury.length > 0) {
                      <div class="jury-section">
                        <h5 class="section-title"><i class="bi bi-people-fill"></i> Composition du Jury</h5>
                        <div class="jury-grid">
                          @for (membre of getUniqueJuryMembers(soutenance.membresJury); track $index) {
                            <div class="jury-card" [ngClass]="'role-' + membre.role.toLowerCase()">
                              <div class="jury-avatar">{{ membre.prenom?.charAt(0) }}{{ membre.nom?.charAt(0) }}</div>
                              <div class="jury-info"><span class="jury-name">{{ membre.prenom }} {{ membre.nom }}</span><span class="jury-etablissement">{{ membre.etablissement }}</span></div>
                              <span class="jury-role-badge">{{ formatRole(membre.role) }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    }

                    <!-- Actions -->
                    <div class="actions-container">
                      @if (soutenance.statut === StatutSoutenance.SOUMIS) {
                        <div class="action-panel waiting"><div class="action-icon"><i class="bi bi-hourglass-split"></i></div><div><h5>En attente du Directeur</h5><p>Le directeur doit d'abord valider les prérequis.</p></div></div>
                      }
                      @if (soutenance.statut === StatutSoutenance.PREREQUIS_VALIDES) {
                        <div class="action-panel authorize"><div class="action-icon pulse"><i class="bi bi-shield-check"></i></div><div><h5>Action requise : Autorisation</h5><p>Le directeur a validé les prérequis. Autorisez la soutenance.</p></div>
                          <div class="action-buttons"><button class="btn-action success" (click)="approuverDemande(soutenance)" [disabled]="isSubmitting()"><i class="bi bi-check-circle"></i> Autoriser</button><button class="btn-action danger-outline" (click)="rejeterDemande(soutenance)" [disabled]="isSubmitting()"><i class="bi bi-x-circle"></i> Rejeter</button></div>
                        </div>
                      }
                      @if (soutenance.statut === StatutSoutenance.AUTORISEE) {
                        <div class="action-panel waiting"><div class="action-icon"><i class="bi bi-person-plus"></i></div><div><h5>En attente de proposition du Jury</h5><p>Le directeur compose le jury.</p></div></div>
                      }
                      @if (soutenance.statut === StatutSoutenance.JURY_PROPOSE) {
                        <div class="action-panel jury"><div class="action-icon pulse"><i class="bi bi-calendar-plus"></i></div><div><h5>Validation du Jury & Planification</h5><p>Vérifiez le jury et planifiez la date.</p></div>
                          @if (!showPlanificationForm()) {
                            <div class="action-buttons"><button class="btn-action primary" (click)="showPlanificationForm.set(true)"><i class="bi bi-calendar-check"></i> Valider & Planifier</button><button class="btn-action danger-outline" (click)="refuserJury(soutenance)"><i class="bi bi-x-circle"></i> Refuser</button></div>
                          } @else {
                            <div class="planification-form">
                              <h6><i class="bi bi-calendar3"></i> Planification</h6>
                              <div class="form-grid"><div class="form-group"><label>Date</label><input type="date" [(ngModel)]="planificationData.date"></div><div class="form-group"><label>Heure</label><input type="time" [(ngModel)]="planificationData.heure"></div><div class="form-group full"><label>Lieu</label><input type="text" [(ngModel)]="planificationData.lieu" placeholder="Amphithéâtre A"></div></div>
                              <div class="form-actions"><button class="btn-cancel" (click)="showPlanificationForm.set(false)">Annuler</button><button class="btn-confirm" (click)="validerJuryEtPlanifier(soutenance)" [disabled]="!planificationData.date || isSubmitting()"><i class="bi bi-check-lg"></i> Confirmer</button></div>
                            </div>
                          }
                        </div>
                      }
                      @if (soutenance.statut === StatutSoutenance.PLANIFIEE) {
                        <div class="action-panel results"><div class="action-icon"><i class="bi bi-trophy"></i></div><div><h5>Soutenance Planifiée</h5><p>Après la soutenance, saisissez le résultat.</p></div>
                          @if (!showResultForm()) {
                            <button class="btn-action primary full" (click)="showResultForm.set(true)"><i class="bi bi-pencil-square"></i> Finaliser la soutenance</button>
                          } @else {
                            <div class="result-form">
                              <h6><i class="bi bi-award"></i> Résultat</h6>
                              <div class="form-grid"><div class="form-group"><label>Mention</label><select [(ngModel)]="resultData.mention"><option value="">--</option><option value="Passable">Passable</option><option value="Assez Bien">Assez Bien</option><option value="Bien">Bien</option><option value="Très Bien">Très Bien</option><option value="Très Honorable">Très Honorable</option></select></div><div class="form-group"><label>Note</label><input type="number" [(ngModel)]="resultData.note" min="0" max="20" step="0.5"></div></div>
                              <label class="checkbox"><input type="checkbox" [(ngModel)]="resultData.felicitations"><span>Félicitations du jury</span></label>
                              <div class="form-actions"><button class="btn-cancel" (click)="showResultForm.set(false)">Annuler</button><button class="btn-confirm success" (click)="enregistrerResultat(soutenance)" [disabled]="!resultData.mention"><i class="bi bi-check-circle"></i> Clôturer</button></div>
                            </div>
                          }
                        </div>
                      }
                      @if (soutenance.statut === StatutSoutenance.TERMINEE) {
                        <div class="action-panel done"><div class="done-icon"><i class="bi bi-patch-check-fill"></i></div><h5>Soutenance Clôturée</h5><div class="result-display"><span class="mention">{{ soutenance.mention }}</span>@if (soutenance.felicitationsJury) { <span class="felicitations"><i class="bi bi-star-fill"></i> Félicitations</span> }</div></div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </app-main-layout>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem 3rem; }
    .hero-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 24px; padding: 2rem 2.5rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden; color: white; }
    .hero-content { display: flex; align-items: center; gap: 1.5rem; z-index: 2; }
    .hero-icon { width: 72px; height: 72px; background: rgba(255,255,255,0.2); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
    .hero-text h1 { font-size: 1.85rem; font-weight: 800; margin: 0; }
    .hero-text p { margin: 0.35rem 0 0; opacity: 0.85; }
    .btn-refresh { padding: 0.875rem 1.5rem; background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.25); border-radius: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; z-index: 2; }

    .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: white; border-radius: 16px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; border: 2px solid transparent; cursor: pointer; position: relative; transition: all 0.2s; }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
    .stat-card.active { border-color: #6366f1; background: linear-gradient(135deg, #f5f3ff, #ede9fe); }
    .stat-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; }
    .stat-icon.total { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); color: #64748b; }
    .stat-icon.warning { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #d97706; }
    .stat-icon.info { background: linear-gradient(135deg, #e0e7ff, #c7d2fe); color: #4f46e5; }
    .stat-icon.primary { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #2563eb; }
    .stat-icon.success { background: linear-gradient(135deg, #dcfce7, #bbf7d0); color: #16a34a; }
    .stat-value { font-size: 1.75rem; font-weight: 800; color: #1e293b; display: block; }
    .stat-label { font-size: 0.8rem; color: #64748b; font-weight: 600; }
    .stat-badge { position: absolute; top: 0.75rem; right: 0.75rem; font-size: 0.65rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 50px; background: #fef3c7; color: #d97706; }
    .stat-badge.pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

    .filter-bar { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .filter-tabs { display: flex; gap: 0.5rem; background: white; padding: 0.5rem; border-radius: 14px; border: 1px solid #e2e8f0; }
    .filter-tab { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border: none; background: transparent; border-radius: 10px; font-weight: 600; font-size: 0.875rem; color: #64748b; cursor: pointer; }
    .filter-tab:hover { background: #f8fafc; }
    .filter-tab.active { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; }
    .tab-badge { background: rgba(255,255,255,0.25); padding: 0.15rem 0.5rem; border-radius: 50px; font-size: 0.75rem; }
    .filter-tab:not(.active) .tab-badge { background: #fee2e2; color: #dc2626; }
    .search-box { display: flex; align-items: center; gap: 0.75rem; background: white; padding: 0.875rem 1.25rem; border-radius: 12px; border: 1px solid #e2e8f0; min-width: 320px; }
    .search-box i { color: #94a3b8; }
    .search-box input { border: none; outline: none; flex: 1; font-size: 0.9rem; }

    .loading-state, .empty-state { background: white; border-radius: 20px; padding: 4rem 2rem; text-align: center; border: 1px solid #e2e8f0; }
    .spinner-lg { width: 48px; height: 48px; border: 4px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem; }
    .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.5rem; color: #94a3b8; }

    .soutenances-list { display: flex; flex-direction: column; gap: 1rem; }
    .soutenance-card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; transition: all 0.3s; }
    .soutenance-card:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
    .soutenance-card.expanded { border-color: #c7d2fe; box-shadow: 0 12px 35px rgba(99,102,241,0.15); }
    .soutenance-card[data-status="SOUMIS"] { border-left: 4px solid #94a3b8; }
    .soutenance-card[data-status="PREREQUIS_VALIDES"] { border-left: 4px solid #f59e0b; }
    .soutenance-card[data-status="AUTORISEE"] { border-left: 4px solid #10b981; }
    .soutenance-card[data-status="JURY_PROPOSE"] { border-left: 4px solid #3b82f6; }
    .soutenance-card[data-status="PLANIFIEE"] { border-left: 4px solid #8b5cf6; }
    .soutenance-card[data-status="TERMINEE"] { border-left: 4px solid #22c55e; }

    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; cursor: pointer; }
    .card-header:hover { background: #f8fafc; }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .avatar { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.1rem; }
    .header-info h4 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b; }
    .header-meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; font-size: 0.8rem; color: #64748b; }
    .matricule { background: #f1f5f9; padding: 0.15rem 0.5rem; border-radius: 4px; font-family: monospace; }
    .header-right { display: flex; align-items: center; gap: 1rem; }
    .status-badge { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .status-soumis { background: #f1f5f9; color: #64748b; }
    .status-prerequis_valides { background: #fef3c7; color: #b45309; }
    .status-autorisee { background: #dcfce7; color: #15803d; }
    .status-jury_propose { background: #dbeafe; color: #1d4ed8; }
    .status-planifiee { background: #f3e8ff; color: #7c3aed; }
    .status-terminee { background: #dcfce7; color: #15803d; }
    .expand-btn { width: 36px; height: 36px; border-radius: 10px; border: none; background: #f1f5f9; color: #64748b; cursor: pointer; transition: all 0.3s; }
    .expand-btn.rotated { background: #6366f1; color: white; transform: rotate(180deg); }

    .card-body { padding: 1.5rem; background: linear-gradient(180deg, #f8fafc 0%, #fff 100%); border-top: 1px solid #e2e8f0; animation: slideDown 0.3s ease; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    .thesis-card { display: flex; align-items: flex-start; gap: 1rem; background: white; padding: 1.25rem; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
    .thesis-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #e0e7ff, #c7d2fe); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #4f46e5; font-size: 1.25rem; }
    .thesis-content .label { font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; }
    .thesis-content h5 { margin: 0.35rem 0 0; font-size: 1.05rem; font-weight: 600; color: #1e293b; }

    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .info-card { display: flex; align-items: center; gap: 1rem; background: white; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; }
    .info-card.highlight { background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-color: #c7d2fe; }
    .info-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
    .info-icon.blue { background: #dbeafe; color: #2563eb; }
    .info-icon.purple { background: #f3e8ff; color: #7c3aed; }
    .info-card .label { font-size: 0.75rem; color: #94a3b8; display: block; }
    .info-card .value { font-size: 0.9rem; font-weight: 600; color: #1e293b; }

    .docs-section, .jury-section { margin-bottom: 1.5rem; }
    .section-title { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: #475569; text-transform: uppercase; margin: 0 0 1rem; }
    .section-title i { color: #6366f1; }
    .docs-grid { display: flex; gap: 1rem; flex-wrap: wrap; }
    .doc-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.25rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
    .doc-btn:hover:not(:disabled) { border-color: #6366f1; transform: translateY(-2px); }
    .doc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .doc-btn.available { border-color: #a7f3d0; background: #f0fdf4; }
    .doc-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
    .doc-icon.manuscrit { background: #fee2e2; color: #dc2626; }
    .doc-icon.rapport { background: #dbeafe; color: #2563eb; }
    .doc-name { font-weight: 600; color: #1e293b; font-size: 0.9rem; display: block; }
    .doc-status { font-size: 0.75rem; color: #64748b; }
    .doc-status .bi-check-circle-fill { color: #22c55e; }

    /* ========== JURY GRID - CORRIGÉ ========== */
    .jury-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .jury-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.75rem; transition: transform 0.2s; }
    .jury-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .jury-card.role-president { border-left: 4px solid #f59e0b; background: linear-gradient(135deg, #fffbeb, #fef3c7); }
    .jury-card.role-rapporteur { border-left: 4px solid #3b82f6; background: linear-gradient(135deg, #eff6ff, #dbeafe); }
    .jury-card.role-examinateur { border-left: 4px solid #8b5cf6; background: linear-gradient(135deg, #faf5ff, #f3e8ff); }
    .jury-avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; color: white; }
    .role-president .jury-avatar { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .role-rapporteur .jury-avatar { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .role-examinateur .jury-avatar { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
    .jury-info { flex: 1; }
    .jury-name { display: block; font-weight: 700; color: #1e293b; font-size: 0.95rem; }
    .jury-etablissement { display: block; font-size: 0.8rem; color: #64748b; margin-top: 0.25rem; }
    .jury-role-badge { padding: 0.3rem 0.75rem; border-radius: 50px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
    .role-president .jury-role-badge { background: #fef3c7; color: #b45309; }
    .role-rapporteur .jury-role-badge { background: #dbeafe; color: #1d4ed8; }
    .role-examinateur .jury-role-badge { background: #f3e8ff; color: #7c3aed; }

    .actions-container { margin-top: 1.5rem; }
    .action-panel { border-radius: 16px; padding: 1.5rem; border: 1px solid; display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start; }
    .action-panel.waiting { background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-color: #e2e8f0; }
    .action-panel.authorize { background: linear-gradient(135deg, #fffbeb, #fef3c7); border-color: #fcd34d; }
    .action-panel.jury { background: linear-gradient(135deg, #eff6ff, #dbeafe); border-color: #93c5fd; }
    .action-panel.results { background: linear-gradient(135deg, #faf5ff, #f3e8ff); border-color: #c4b5fd; }
    .action-panel.done { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-color: #86efac; flex-direction: column; align-items: center; text-align: center; }
    .action-icon { width: 48px; height: 48px; background: white; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); flex-shrink: 0; }
    .action-panel.authorize .action-icon { color: #d97706; }
    .action-panel.jury .action-icon { color: #2563eb; }
    .action-panel.results .action-icon { color: #7c3aed; }
    .action-panel.waiting .action-icon { color: #64748b; }
    .action-icon.pulse { animation: iconPulse 2s ease-in-out infinite; }
    @keyframes iconPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .action-panel h5 { margin: 0 0 0.35rem; font-size: 1rem; font-weight: 700; color: #1e293b; }
    .action-panel p { margin: 0; font-size: 0.9rem; color: #64748b; }
    .action-buttons { display: flex; gap: 1rem; width: 100%; margin-top: 1rem; }
    .btn-action { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.875rem 1.5rem; border: none; border-radius: 12px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
    .btn-action:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-action.success { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; box-shadow: 0 4px 12px rgba(34,197,94,0.3); }
    .btn-action.primary { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .btn-action.danger-outline { background: white; color: #dc2626; border: 2px solid #fecaca; }
    .btn-action.full { width: 100%; }

    .planification-form, .result-form { background: white; padding: 1.5rem; border-radius: 14px; width: 100%; margin-top: 1rem; }
    .planification-form h6, .result-form h6 { margin: 0 0 1rem; font-size: 0.95rem; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 0.5rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group.full { grid-column: span 2; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
    .form-group input, .form-group select { padding: 0.875rem 1rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.9rem; }
    .form-group input:focus, .form-group select:focus { outline: none; border-color: #6366f1; }
    .checkbox { display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0; cursor: pointer; font-weight: 600; color: #475569; }
    .checkbox input { width: 20px; height: 20px; accent-color: #6366f1; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
    .btn-cancel { padding: 0.75rem 1.25rem; background: #f1f5f9; border: none; border-radius: 10px; font-weight: 600; color: #64748b; cursor: pointer; }
    .btn-confirm { padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #6366f1, #4f46e5); border: none; border-radius: 10px; font-weight: 600; color: white; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
    .btn-confirm.success { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .btn-confirm:disabled { opacity: 0.6; }

    .done-icon { width: 64px; height: 64px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; font-size: 2rem; color: #22c55e; box-shadow: 0 4px 12px rgba(34,197,94,0.2); }
    .result-display { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    .mention { font-size: 1.25rem; font-weight: 800; color: #15803d; background: white; padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #86efac; }
    .felicitations { display: flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 0.5rem 1rem; border-radius: 50px; font-weight: 700; font-size: 0.85rem; color: #b45309; }

    @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } .jury-grid { grid-template-columns: 1fr; } }
    @media (max-width: 992px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .filter-bar { flex-direction: column; align-items: stretch; } .search-box { min-width: 100%; } }
    @media (max-width: 768px) { .hero-header { flex-direction: column; gap: 1.5rem; text-align: center; padding: 1.5rem; } .hero-content { flex-direction: column; } .stats-grid { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } .form-group.full { grid-column: span 1; } .action-buttons { flex-direction: column; } .btn-action { width: 100%; } .docs-grid { flex-direction: column; } }
  `]
})
export class SoutenanceListComponent implements OnInit {
  StatutSoutenance = StatutSoutenance;
  soutenances = signal<Soutenance[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  activeFilter = signal<'all' | 'prerequis' | 'jury' | 'planned'>('all');
  searchTerm = signal('');
  expandedId = signal<number | null>(null);
  showPlanificationForm = signal(false);
  showResultForm = signal(false);
  planificationData = { date: '', heure: '09:00', lieu: '' };
  resultData = { mention: '', felicitations: false, note: 0 };

  totalCount = computed(() => this.soutenances().filter(s => s.statut !== StatutSoutenance.BROUILLON).length);
  prerequisCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.PREREQUIS_VALIDES).length);
  juryCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.JURY_PROPOSE).length);
  plannedCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.PLANIFIEE).length);
  doneCount = computed(() => this.soutenances().filter(s => s.statut === StatutSoutenance.TERMINEE).length);

  filteredSoutenances = computed(() => {
    let result = this.soutenances().filter(s => s.statut !== StatutSoutenance.BROUILLON);
    switch (this.activeFilter()) {
      case 'prerequis': result = result.filter(s => s.statut === StatutSoutenance.PREREQUIS_VALIDES); break;
      case 'jury': result = result.filter(s => s.statut === StatutSoutenance.JURY_PROPOSE); break;
      case 'planned': result = result.filter(s => s.statut === StatutSoutenance.PLANIFIEE); break;
    }
    const search = this.searchTerm().toLowerCase();
    if (search) { result = result.filter(s => this.getDoctorantNom(s).toLowerCase().includes(search) || (s.titreThese?.toLowerCase().includes(search))); }
    return result;
  });

  constructor(private soutenanceService: SoutenanceService) {}
  ngOnInit(): void { this.loadSoutenances(); }

  loadSoutenances(): void {
    this.isLoading.set(true);
    this.soutenanceService.getAllSoutenances().subscribe({
      next: (data) => { this.soutenances.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  setFilter(filter: 'all' | 'prerequis' | 'jury' | 'planned'): void { this.activeFilter.set(filter); this.expandedId.set(null); }
  toggleExpand(id: number): void { this.expandedId.set(this.expandedId() === id ? null : id); this.resetForms(); }
  resetForms(): void { this.showPlanificationForm.set(false); this.showResultForm.set(false); this.planificationData = { date: '', heure: '09:00', lieu: '' }; this.resultData = { mention: '', felicitations: false, note: 0 }; }

  // ✅ FONCTION DE DÉDUPLICATION DU JURY
  getUniqueJuryMembers(membres: any[]): any[] {
    if (!membres || membres.length === 0) return [];
    const seen = new Map<string, boolean>();
    return membres.filter(m => {
      const key = `${m.nom}-${m.prenom}-${m.role}`;
      if (seen.has(key)) return false;
      seen.set(key, true);
      return true;
    });
  }

  getDoctorantNom(s: Soutenance): string { return s.doctorantInfo ? `${s.doctorantInfo.prenom} ${s.doctorantInfo.nom}` : `Doctorant #${s.doctorantId}`; }
  getDirecteurNom(s: Soutenance): string { return s.directeurInfo ? `${s.directeurInfo.prenom} ${s.directeurInfo.nom}` : `Directeur #${s.directeurId}`; }
  getMatricule(s: Soutenance): string { return (s.doctorantInfo as any)?.username || 'N/A'; }
  openDocument(path: string): void { this.soutenanceService.openDocument(path); }
  getInitials(name: string): string { const p = name.trim().split(' '); return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name[0]?.toUpperCase() || '?'; }
  getAvatarColor(id: number): string { const c = ['linear-gradient(135deg, #6366f1, #4f46e5)', 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 'linear-gradient(135deg, #ec4899, #db2777)', 'linear-gradient(135deg, #10b981, #059669)', 'linear-gradient(135deg, #3b82f6, #2563eb)']; return c[id % c.length]; }
  getStatusIcon(statut: StatutSoutenance): string { const icons: Record<string, string> = { SOUMIS: 'bi-hourglass', PREREQUIS_VALIDES: 'bi-shield-exclamation', AUTORISEE: 'bi-check-circle', JURY_PROPOSE: 'bi-people', PLANIFIEE: 'bi-calendar-event', TERMINEE: 'bi-trophy', REJETEE: 'bi-x-octagon' }; return icons[statut] || 'bi-circle'; }
  formatStatut(statut: StatutSoutenance): string { const m: Record<string, string> = { SOUMIS: 'Attente Directeur', PREREQUIS_VALIDES: 'À Autoriser', AUTORISEE: 'Attente Jury', JURY_PROPOSE: 'Jury à Valider', PLANIFIEE: 'Planifiée', TERMINEE: 'Terminée', REJETEE: 'Rejetée' }; return m[statut] || statut; }
  formatRole(role: string): string { const map: Record<string, string> = { 'PRESIDENT': 'Président', 'RAPPORTEUR': 'Rapporteur', 'EXAMINATEUR': 'Examinateur' }; return map[role] || role; }

  approuverDemande(s: Soutenance): void { if (confirm(`Autoriser la soutenance pour ${this.getDoctorantNom(s)} ?`)) { this.isSubmitting.set(true); this.soutenanceService.autoriserSoutenance(s.id).subscribe({ next: () => { alert('✅ Autorisée !'); this.loadSoutenances(); this.isSubmitting.set(false); }, error: (e) => { alert('Erreur: ' + (e.error?.error || 'Une erreur')); this.isSubmitting.set(false); } }); } }
  rejeterDemande(s: Soutenance): void { const motif = prompt('Motif du rejet :'); if (motif?.trim()) { this.isSubmitting.set(true); this.soutenanceService.rejeterSoutenance(s.id, motif.trim()).subscribe({ next: () => { this.loadSoutenances(); this.isSubmitting.set(false); }, error: () => { alert('Erreur'); this.isSubmitting.set(false); } }); } }
  refuserJury(s: Soutenance): void { const motif = prompt('Motif du refus du jury :'); if (motif?.trim()) { this.isSubmitting.set(true); this.soutenanceService.refuserJury(s.id, motif.trim()).subscribe({ next: () => { alert('Jury refusé.'); this.loadSoutenances(); this.isSubmitting.set(false); }, error: () => { alert('Erreur'); this.isSubmitting.set(false); } }); } }
  validerJuryEtPlanifier(s: Soutenance): void { if (!this.planificationData.date) return; if (confirm(`Planifier pour le ${this.planificationData.date} ?`)) { this.isSubmitting.set(true); this.soutenanceService.validerJury(s.id, 'Jury validé').subscribe({ next: () => { this.soutenanceService.planifierSoutenance(s.id, { dateSoutenance: this.planificationData.date, heureSoutenance: this.planificationData.heure, lieuSoutenance: this.planificationData.lieu }).subscribe({ next: () => { alert('✅ Planifiée !'); this.loadSoutenances(); this.resetForms(); this.isSubmitting.set(false); }, error: () => { alert('Erreur planification'); this.isSubmitting.set(false); } }); }, error: () => { alert('Erreur jury'); this.isSubmitting.set(false); } }); } }
  enregistrerResultat(s: Soutenance): void { if (!this.resultData.mention) return; this.isSubmitting.set(true); const payload: any = { mention: this.resultData.mention, felicitations: this.resultData.felicitations, note: this.resultData.note }; this.soutenanceService.enregistrerResultat(s.id, payload).subscribe({ next: () => { alert('✅ Clôturée !'); this.loadSoutenances(); this.resetForms(); this.isSubmitting.set(false); }, error: () => { alert('Erreur'); this.isSubmitting.set(false); } }); }
}