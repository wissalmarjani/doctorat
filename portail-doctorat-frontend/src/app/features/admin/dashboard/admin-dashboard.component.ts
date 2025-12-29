import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { UserService } from '@core/services/user.service';
import { InscriptionService } from '@core/services/inscription.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, MainLayoutComponent],
    template: `
        <app-main-layout>
            <div class="page-container p-4">

                <!-- EN-TÊTE SIMPLE -->
                <div class="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 class="fw-bold text-dark mb-1">Vue d'ensemble</h2>
                        <p class="text-muted mb-0">État actuel du système.</p>
                    </div>
                    <span class="badge bg-light text-secondary border px-3 py-2 rounded-pill">
                        <i class="bi bi-calendar3 me-2"></i> {{ today | date:'fullDate' }}
                    </span>
                </div>

                <!-- GRILLE DE STATISTIQUES -->
                <div class="row g-4">

                    <!-- 1. COMPTES CANDIDATS (Orange) -->
                    <div class="col-xl-3 col-md-6 col-12">
                        <div class="info-card">
                            <div class="icon-box bg-orange-subtle text-orange">
                                <i class="bi bi-person-lines-fill"></i>
                            </div>
                            <div class="info-content">
                                <span class="label">Comptes Candidats</span>
                                <div class="value">{{ stats().candidats }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. DOCTORANTS INSCRITS (Cyan) -->
                    <div class="col-xl-3 col-md-6 col-12">
                        <div class="info-card">
                            <div class="icon-box bg-cyan-subtle text-cyan">
                                <i class="bi bi-mortarboard-fill"></i>
                            </div>
                            <div class="info-content">
                                <span class="label">Doctorants Inscrits</span>
                                <div class="value">{{ stats().doctorants }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. DIRECTEURS (Bleu) -->
                    <div class="col-xl-3 col-md-6 col-12">
                        <div class="info-card">
                            <div class="icon-box bg-blue-subtle text-blue">
                                <i class="bi bi-person-video3"></i>
                            </div>
                            <div class="info-content">
                                <span class="label">Directeurs de Thèse</span>
                                <div class="value">{{ stats().directeurs }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 4. DOSSIERS A VALIDER (Violet) -->
                    <div class="col-xl-3 col-md-6 col-12">
                        <div class="info-card">
                            <div class="icon-box bg-purple-subtle text-purple">
                                <i class="bi bi-files"></i>
                            </div>
                            <div class="info-content">
                                <span class="label">Dossiers à traiter</span>
                                <div class="value">{{ stats().inscriptions }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 5. CAMPAGNE (Vert) -->
                    <div class="col-xl-3 col-md-6 col-12">
                        <div class="info-card">
                            <div class="icon-box bg-green-subtle text-green">
                                <i class="bi bi-calendar-check"></i>
                            </div>
                            <div class="info-content">
                                <span class="label">Année Universitaire</span>
                                <div class="value fs-5">2025-2026</div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </app-main-layout>
    `,
    styles: [`
      .info-card {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        border: 1px solid #f1f5f9;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
        height: 100%;
        transition: transform 0.2s;
      }
      .info-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
      .label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 0.25rem; display: block; }
      .value { font-size: 1.75rem; font-weight: 800; color: #1e293b; line-height: 1.2; }
      .icon-box { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; flex-shrink: 0; }
      .bg-orange-subtle { background-color: #fff7ed; } .text-orange { color: #ea580c; }
      .bg-purple-subtle { background-color: #f3e8ff; } .text-purple { color: #9333ea; }
      .bg-blue-subtle { background-color: #eff6ff; } .text-blue { color: #2563eb; }
      .bg-green-subtle { background-color: #f0fdf4; } .text-green { color: #16a34a; }
      .bg-cyan-subtle { background-color: #ecfeff; } .text-cyan { color: #0891b2; }
      @media (max-width: 768px) { .info-card { padding: 1rem; } .icon-box { width: 50px; height: 50px; font-size: 1.5rem; } .value { font-size: 1.5rem; } }
    `]
})
export class AdminDashboardComponent implements OnInit {
    today = new Date();
    stats = signal({ candidats: 0, inscriptions: 0, directeurs: 0, doctorants: 0 });

    constructor(
        private userService: UserService,
        private inscriptionService: InscriptionService
    ) {}

    ngOnInit() {
        this.loadStats();
    }

    loadStats() {
        // 1. Candidats (Utilisateurs avec rôle CANDIDAT)
        this.userService.getUsersByRole('CANDIDAT').subscribe(u =>
            this.stats.update(s => ({ ...s, candidats: u.length }))
        );

        // 2. Directeurs
        this.userService.getUsersByRole('DIRECTEUR_THESE').subscribe(u =>
            this.stats.update(s => ({ ...s, directeurs: u.length }))
        );

        // 3. Doctorants (Ceux qui sont ADMIS)
        this.userService.getUsersByRole('DOCTORANT').subscribe(u =>
            this.stats.update(s => ({ ...s, doctorants: u.length }))
        );

        // 4. Dossiers à valider par l'admin - utiliser la string directement
        this.inscriptionService.getByStatut('EN_ATTENTE_ADMIN').subscribe(i =>
            this.stats.update(s => ({ ...s, inscriptions: i.length }))
        );
    }
}