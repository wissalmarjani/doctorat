import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InscriptionService } from '@core/services/inscription.service';
import { Inscription, StatutInscription } from '@core/models/inscription.model';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';

@Component({
    selector: 'app-admin-inscription-validation',
    standalone: true,
    imports: [CommonModule, RouterLink, MainLayoutComponent],
    template: `
        <app-main-layout>
            <div class="page-container p-4">

                <!-- EN-TÊTE -->
                <div class="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 class="fw-bold text-dark mb-1">Validation Administrative</h2>
                        <p class="text-muted mb-0">Contrôle final des dossiers validés par les directeurs.</p>
                    </div>

                    <button class="btn btn-light text-primary fw-bold shadow-sm rounded-pill px-4 d-flex align-items-center gap-2"
                            (click)="loadInscriptions()"
                            [disabled]="isLoading()">
                        <span *ngIf="isLoading()" class="spinner-border spinner-border-sm"></span>
                        <i *ngIf="!isLoading()" class="bi bi-arrow-clockwise"></i>
                        Actualiser
                    </button>
                </div>

                <!-- CONTENU -->
                @if (isLoading()) {
                    <!-- CHARGEMENT -->
                    <div class="text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-3 text-muted">Récupération des dossiers...</p>
                    </div>
                } @else if (inscriptions().length === 0) {

                    <!-- LISTE VIDE (Nettoyée : Plus d'icône buggée, espace réduit) -->
                    <div class="card border-0 shadow-sm rounded-4 text-center py-5 fade-in">
                        <div class="card-body">
                            <h4 class="fw-bold text-dark mb-2">Tout est à jour !</h4>
                            <p class="text-muted mb-4">Aucun dossier en attente de validation administrative.</p>
                            <button class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="loadInscriptions()">
                                Vérifier à nouveau
                            </button>
                        </div>
                    </div>

                } @else {

                    <!-- TABLEAU DES DOSSIERS -->
                    <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in">

                        <!-- Header Tableau -->
                        <div class="card-header bg-white py-3 border-bottom ps-4">
                            <div class="d-flex align-items-center">
                                <h5 class="mb-0 fw-bold text-primary">
                                    <i class="bi bi-file-earmark-text me-2"></i>Dossiers en attente
                                </h5>
                                <span class="badge bg-primary-subtle text-primary rounded-pill ms-3">
                  {{ inscriptions().length }}
                </span>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="bg-light">
                                <tr>
                                    <th class="ps-4 py-3 text-uppercase small fw-bold text-muted">Candidat</th>
                                    <th class="text-uppercase small fw-bold text-muted">Sujet de Thèse</th>
                                    <th class="text-uppercase small fw-bold text-muted">Encadrement</th>
                                    <th class="text-uppercase small fw-bold text-muted">Date Validation Dir.</th>
                                    <th class="text-end pe-4 text-uppercase small fw-bold text-muted">Action</th>
                                </tr>
                                </thead>
                                <tbody>

                                    @for (ins of inscriptions(); track ins.id) {
                                        <tr>
                                            <!-- COLONNE CANDIDAT -->
                                            <td class="ps-4">
                                                <div class="d-flex align-items-center">
                                                    <div class="avatar-circle bg-gradient-purple text-white me-3 shadow-sm">
                                                        {{ ins.doctorantNom?.charAt(0) || 'D' }}
                                                    </div>
                                                    <div>
                                                        <div class="fw-bold text-dark">{{ ins.doctorantNom || 'Nom inconnu' }}</div>
                                                        <div class="small text-muted font-monospace">ID: {{ ins.doctorantId }}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <!-- COLONNE SUJET -->
                                            <td>
                                                <div class="text-dark mb-1 text-truncate" style="max-width: 250px;" title="{{ ins.sujetThese }}">
                                                    {{ ins.sujetThese }}
                                                </div>
                                            </td>

                                            <!-- COLONNE ENCADREMENT -->
                                            <td>
                        <span class="badge bg-light text-secondary border">
                          <i class="bi bi-person-badge me-1"></i> Dir. ID {{ ins.directeurId }}
                        </span>
                                            </td>

                                            <!-- COLONNE DATE -->
                                            <td>
                                                <div class="d-flex align-items-center text-muted">
                                                    <i class="bi bi-calendar3 me-2"></i>
                                                    {{ ins.dateValidationDirecteur | date:'dd MMM yyyy' }}
                                                </div>
                                            </td>

                                            <!-- COLONNE ACTIONS -->
                                            <td class="text-end pe-4">
                                                <div class="d-flex justify-content-end gap-2">

                                                    <!-- Valider -->
                                                    <button class="btn btn-success btn-sm px-3 shadow-sm rounded-pill d-flex align-items-center gap-1"
                                                            (click)="valider(ins.id)"
                                                            title="Valider et Générer Attestation">
                                                        <i class="bi bi-check-lg"></i> Valider
                                                    </button>

                                                    <!-- Rejeter -->
                                                    <button class="btn btn-outline-danger btn-sm px-3 shadow-sm rounded-pill d-flex align-items-center gap-1"
                                                            (click)="rejeter(ins.id)"
                                                            title="Rejeter le dossier">
                                                        <i class="bi bi-x-lg"></i> Refuser
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    }

                                </tbody>
                            </table>
                        </div>
                    </div>
                }
            </div>
        </app-main-layout>
    `,
    styles: [`
      /* AVATAR */
      .avatar-circle {
        width: 40px; height: 40px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 1rem;
      }
      .bg-gradient-purple { background: linear-gradient(135deg, #a855f7 0%, #d8b4fe 100%); }

      /* TABLEAU */
      .table thead th {
        border-bottom: 2px solid #f1f5f9;
        background-color: #f8fafc;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
        padding-top: 1rem; padding-bottom: 1rem;
      }
      .table tbody td { vertical-align: middle; padding-top: 1rem; padding-bottom: 1rem; }

      /* BADGES */
      .bg-primary-subtle { background-color: #e0f2fe !important; color: #0284c7 !important; }

      /* ANIMATION */
      .fade-in { animation: fadeIn 0.4s ease-out; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `]
})
export class AdminInscriptionValidationComponent implements OnInit {
    inscriptions = signal<Inscription[]>([]);
    isLoading = signal(true);

    constructor(private inscriptionService: InscriptionService) {}

    ngOnInit() {
        this.loadInscriptions();
    }

    loadInscriptions() {
        this.isLoading.set(true);
        this.inscriptionService.getByStatut(StatutInscription.VALIDE_DIRECTEUR).subscribe({
            next: (data) => {
                this.inscriptions.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error("Erreur chargement:", err);
                this.isLoading.set(false);
            }
        });
    }

    valider(id: number) {
        if(confirm("Confirmer la validation administrative ?\n\nCela finalisera l'inscription et générera l'attestation.")) {
            this.inscriptionService.validerParAdmin(id, "Dossier conforme").subscribe({
                next: () => {
                    alert("Inscription finalisée avec succès !");
                    this.loadInscriptions();
                },
                error: () => alert("Erreur technique lors de la validation.")
            });
        }
    }

    rejeter(id: number) {
        const motif = prompt("Veuillez indiquer le motif du rejet (ex: Diplôme manquant) :");
        if (motif) {
            this.inscriptionService.rejeterParAdmin(id, motif).subscribe({
                next: () => {
                    alert("Dossier rejeté.");
                    this.loadInscriptions();
                },
                error: () => alert("Erreur lors du rejet.")
            });
        }
    }
}