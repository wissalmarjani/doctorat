import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-pending-approval',
    standalone: true,
    imports: [CommonModule],
    template: `
        <!-- ... TON TEMPLATE HTML NE CHANGE PAS ... -->
        <!-- Garde exactement le même HTML que tu m'as montré -->
        <div class="auth-container">
            <div class="main-card fade-in">
                <!-- EN-TÊTE -->
                <div class="header-section text-center mb-5">
                    <h2 class="fw-bold text-dark mb-2">Suivi de Candidature</h2>
                    <p class="text-muted">Suivez l'état d'avancement de votre dossier doctoral</p>
                </div>

                <div class="row">
                    <!-- INFOS CANDIDAT -->
                    <div class="col-md-5 border-end pe-md-4 mb-4 mb-md-0">
                        <h5 class="section-title text-primary mb-4">
                            <i class="bi bi-person-vcard me-2"></i>Informations Personnelles
                        </h5>
                        <form>
                            <div class="mb-3">
                                <label class="form-label small text-muted">Nom & Prénom</label>
                                <input type="text" class="form-control bg-light"
                                       [value]="(user()?.nom || '') + ' ' + (user()?.prenom || '')" disabled readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small text-muted">Matricule</label>
                                <input type="text" class="form-control bg-light"
                                       [value]="user()?.username" disabled readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small text-muted">Email</label>
                                <input type="text" class="form-control bg-light"
                                       [value]="user()?.email" disabled readonly>
                            </div>
                            <div class="alert alert-light border small text-muted fst-italic mt-4">
                                <i class="bi bi-info-circle me-1"></i>
                                Vos documents ont été transmis à l'administration et sont en cours d'examen.
                            </div>
                        </form>
                    </div>

                    <!-- ÉTAT D'AVANCEMENT -->
                    <div class="col-md-7 ps-md-5">
                        <div class="mb-5">
                            <h5 class="section-title text-primary mb-4">
                                <i class="bi bi-activity me-2"></i>État d'avancement
                            </h5>
                            <!-- TIMELINE -->
                            <div class="timeline-container py-3">
                                <div class="step">
                                    <div class="step-circle"
                                         [class.active]="isAdminPending()"
                                         [class.completed]="isDirectorPending() || isValide()"
                                         [class.rejected]="isRefuse()">1</div>
                                    <div class="step-label">Admin</div>
                                </div>
                                <div class="step-line">
                                    <div class="step-line-fill" [style.width]="(isDirectorPending() || isValide()) ? '100%' : '0%'"></div>
                                </div>
                                <div class="step">
                                    <div class="step-circle"
                                         [class.active]="isDirectorPending()"
                                         [class.completed]="isValide()"
                                         [class.rejected]="isRefuse() && false">2</div>
                                    <div class="step-label">Directeur</div>
                                </div>
                            </div>
                        </div>

                        <!-- MESSAGE D'ÉTAT -->
                        <div class="status-wrapper mb-5">
                            @if (isAdminPending()) {
                                <div class="status-card warning">
                                    <div class="icon"><i class="bi bi-hourglass-split"></i></div>
                                    <div class="content">
                                        <h5>En attente de validation Administrative</h5>
                                        <p>L'administration vérifie actuellement votre dossier (Diplômes, éligibilité...).</p>
                                    </div>
                                </div>
                            }
                            @if (isRefuse()) {
                                <div class="status-card danger">
                                    <div class="icon"><i class="bi bi-x-circle"></i></div>
                                    <div class="content">
                                        <h5>Dossier Refusé</h5>
                                        <p>Votre candidature n'a pas été retenue.</p>
                                        <div class="reason mt-2" *ngIf="user()?.motifRefus">
                                            <strong>Motif :</strong> {{ user()?.motifRefus }}
                                        </div>
                                    </div>
                                </div>
                            }
                            @if (isDirectorPending()) {
                                <div class="status-card info">
                                    <div class="icon"><i class="bi bi-person-workspace"></i></div>
                                    <div class="content">
                                        <h5>En attente du Directeur de Thèse</h5>
                                        <p>Votre dossier a été validé par l'administration. Il est maintenant transmis au directeur de thèse pour validation scientifique.</p>
                                    </div>
                                </div>
                            }
                            @if (isValide()) {
                                <div class="status-card success">
                                    <div class="icon"><i class="bi bi-check-lg"></i></div>
                                    <div class="content">
                                        <h5>Félicitations !</h5>
                                        <p>Vous êtes officiellement inscrit au cycle doctoral.</p>
                                        <button class="btn btn-sm btn-outline-success mt-2 fw-bold" (click)="goToDashboard()">Accéder à mon espace</button>
                                    </div>
                                </div>
                            }
                        </div>

                        <div class="text-center mt-5 pt-4 border-top">
                            <button class="btn btn-logout px-4 py-2 shadow-sm" (click)="logout()">
                                <i class="bi bi-box-arrow-left me-2"></i> Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
      /* Tes styles existants ... */
      .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; }
      .main-card { width: 100%; max-width: 1000px; background: white; border-radius: 16px; padding: 3rem; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
      .fade-in { animation: fadeIn 0.5s ease-out; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .section-title { font-weight: 700; font-size: 1.1rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; color: #1e293b; }
      .form-control:disabled, .form-control[readonly] { background-color: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; font-weight: 500; }
      .timeline-container { display: flex; justify-content: space-between; align-items: center; padding: 0 1rem; }
      .step { text-align: center; position: relative; z-index: 2; flex: 1; }
      .step-circle { width: 40px; height: 40px; border-radius: 50%; background: #e0e7ff; color: #6366f1; font-weight: bold; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; transition: all 0.3s; }
      .step-label { font-size: 0.75rem; font-weight: 700; color: #6366f1; }
      .step-line { flex: 2; height: 4px; background: #e0e7ff; margin: 0 10px; margin-bottom: 25px; border-radius: 2px; position: relative; overflow: hidden; }
      .step-line-fill { height: 100%; background: #5b21b6; transition: width 0.5s ease-in-out; }
      .step-circle.active { border: 2px solid #5b21b6; background: white; color: #5b21b6; transform: scale(1.1); }
      .step-circle.completed { background: #5b21b6; color: white; }
      .step-circle.rejected { background: #dc2626; color: white; }
      .status-card { display: flex; gap: 15px; padding: 1.5rem; border-radius: 12px; border: 1px solid transparent; align-items: flex-start; }
      .status-card .icon { font-size: 1.5rem; line-height: 1; margin-top: 2px; }
      .status-card h5 { margin-bottom: 0.5rem; font-weight: 700; font-size: 0.95rem; }
      .status-card p { margin-bottom: 0; font-size: 0.9rem; }
      .reason { background: rgba(255,255,255,0.8); padding: 10px; border-radius: 6px; font-size: 0.85rem; border-left: 3px solid #ef4444; }
      .status-card.warning { background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; } .status-card.warning .icon { color: #d97706; }
      .status-card.danger { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; } .status-card.danger .icon { color: #dc2626; }
      .status-card.info { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; } .status-card.info .icon { color: #3b82f6; }
      .status-card.success { background: #f0fdf4; border: 1px solid #86efac; color: #166534; } .status-card.success .icon { color: #16a34a; }
      .btn-logout { background: #667eea; color: white; border: none; border-radius: 6px; font-weight: 600; font-size: 0.9rem; transition: all 0.3s; }
      .btn-logout:hover { background: #5a67d8; box-shadow: 0 4px 12px rgba(90, 103, 216, 0.3); }
    `]
})
export class PendingApprovalComponent implements OnInit {

    // On utilise le signal du service
    user = this.authService.currentUser;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit() {
        // ✅ ICI LA CORRECTION MAJEURE :
        // On récupère le profil à jour depuis le backend
        this.authService.getProfile().subscribe({
            next: (updatedUser) => {
                // Et on met à jour le signal de l'AuthService pour que l'affichage change immédiatement
                this.authService.updateUserStorage(updatedUser);
            },
            error: (err) => console.error("Impossible de récupérer le profil", err)
        });
    }

    logout() {
        this.authService.logout();
    }

    goToDashboard() {
        this.router.navigate(['/dashboard']);
    }

    // --- LOGIQUE D'ÉTAT ---

    isAdminPending(): boolean {
        const etat = this.user()?.etat;
        return !etat || etat === 'EN_ATTENTE_ADMIN';
    }

    isDirectorPending(): boolean {
        return this.user()?.etat === 'EN_ATTENTE_DIRECTEUR';
    }

    isRefuse(): boolean {
        return this.user()?.etat === 'REFUSE';
    }

    isValide(): boolean {
        return this.user()?.etat === 'VALIDE' || this.user()?.role === 'DOCTORANT';
    }
}