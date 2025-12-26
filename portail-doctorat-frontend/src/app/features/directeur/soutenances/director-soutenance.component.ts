import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';

@Component({
    selector: 'app-director-soutenance',
    standalone: true,
    imports: [CommonModule, MainLayoutComponent, FormsModule],
    template: `
        <app-main-layout>
            <div class="page-container p-4">

                <!-- HEADER -->
                <div class="d-flex justify-content-between align-items-end mb-5">
                    <div>
                        <h2 class="fw-bold text-dark mb-2">Gestion des Soutenances</h2>
                        <p class="text-muted mb-0">Suivez et validez les demandes de soutenance de vos doctorants.</p>
                    </div>
                    <button class="btn btn-white border shadow-sm text-primary fw-bold rounded-pill px-4 d-flex align-items-center gap-2 hover-scale"
                            (click)="loadData()"
                            [disabled]="isLoading()">
                        @if (isLoading()) {
                            <span class="spinner-border spinner-border-sm"></span>
                        } @else {
                            <i class="bi bi-arrow-clockwise"></i>
                        }
                        Actualiser
                    </button>
                </div>

                <!-- TABLEAU DES SOUTENANCES -->
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in-up">
                    <div class="table-responsive">
                        <table class="table align-middle mb-0">
                            <thead class="bg-light text-uppercase text-muted small fw-bold">
                            <tr>
                                <th class="ps-4 py-3">Doctorant</th>
                                <th>Titre de Thèse</th>
                                <th>Date Soutenance</th>
                                <th>Statut</th>
                                <th class="text-end pe-4">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                                @for (soutenance of soutenances(); track soutenance.id) {
                                    <tr class="main-row">
                                        <td class="ps-4">
                                            <div class="d-flex align-items-center gap-3">
                                                <div class="avatar-circle shadow-sm">
                                                    {{ soutenance.doctorant?.nom?.charAt(0).toUpperCase() || '?' }}
                                                </div>
                                                <div>
                                                    <div class="fw-bold text-dark">
                                                        {{ soutenance.doctorant?.nom }} {{ soutenance.doctorant?.prenom }}
                                                    </div>
                                                    <div class="small text-muted">{{ soutenance.doctorant?.email }}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="fw-semibold text-dark">{{ soutenance.titreThese || 'Non renseigné' }}</div>
                                        </td>
                                        <td>
                                            <div class="text-dark">{{ soutenance.dateSoutenance | date:'dd/MM/yyyy' }}</div>
                                            <div class="small text-muted">{{ soutenance.heureSoutenance || '--:--' }}</div>
                                        </td>
                                        <td>
                                            <span class="badge rounded-pill px-3 py-2" [ngClass]="{
                                                'bg-warning text-dark': soutenance.statut === 'EN_ATTENTE',
                                                'bg-success': soutenance.statut === 'ACCEPTEE',
                                                'bg-danger': soutenance.statut === 'REFUSEE',
                                                'bg-info': soutenance.statut === 'PLANIFIEE'
                                            }">
                                                {{ getStatutLabel(soutenance.statut) }}
                                            </span>
                                        </td>
                                        <td class="text-end pe-4">
                                            @if (soutenance.statut === 'EN_ATTENTE') {
                                                <button class="btn btn-sm btn-success me-2"
                                                        (click)="valider(soutenance.id)"
                                                        title="Valider">
                                                    <i class="bi bi-check-lg"></i>
                                                </button>
                                                <button class="btn btn-sm btn-danger"
                                                        (click)="refuser(soutenance.id)"
                                                        title="Refuser">
                                                    <i class="bi bi-x-lg"></i>
                                                </button>
                                            } @else {
                                                <button class="btn btn-sm btn-outline-secondary"
                                                        (click)="voirDetails(soutenance.id)"
                                                        title="Voir détails">
                                                    <i class="bi bi-eye"></i>
                                                </button>
                                            }
                                        </td>
                                    </tr>
                                } @empty {
                                    @if (!isLoading()) {
                                        <tr>
                                            <td colspan="5" class="text-center py-5">
                                                <div class="text-muted opacity-50">
                                                    <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                                                    <h6 class="fw-bold">Aucune demande de soutenance</h6>
                                                    <span class="small">Aucune soutenance n'a été demandée pour le moment.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    }
                                }

                                @if (isLoading()) {
                                    <tr>
                                        <td colspan="5" class="text-center py-5">
                                            <div class="spinner-border text-primary" role="status">
                                                <span class="visually-hidden">Chargement...</span>
                                            </div>
                                            <div class="mt-3 text-muted">Chargement des soutenances...</div>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </app-main-layout>
    `,
    styles: [`
      /* TABLEAU */
      .main-row {
        transition: background 0.2s;
        border-bottom: 1px solid #f1f5f9;
      }
      .main-row:hover {
        background-color: #f8fafc;
      }

      .avatar-circle {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }

      .fade-in-up {
        animation: fadeInUp 0.4s ease-out;
      }

      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .hover-scale:hover {
        transform: scale(1.02);
      }
    `]
})
export class DirectorSoutenanceComponent implements OnInit {
    soutenances = signal<any[]>([]);
    isLoading = signal(false);

    constructor(private userService: UserService) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.isLoading.set(true);

        // TODO: Remplacer par votre vraie méthode de service
        // Ex: this.soutenanceService.getSoutenancesByDirecteur().subscribe(...)

        // Simulation temporaire
        setTimeout(() => {
            this.soutenances.set([
                // Exemples de données (à remplacer par vos vraies données)
                // {
                //     id: 1,
                //     titreThese: 'Intelligence Artificielle et Apprentissage Profond',
                //     dateSoutenance: '2024-06-15',
                //     heureSoutenance: '14:00',
                //     statut: 'EN_ATTENTE',
                //     doctorant: {
                //         nom: 'ALAMI',
                //         prenom: 'Karim',
                //         email: 'k.alami@example.com'
                //     }
                // }
            ]);
            this.isLoading.set(false);
        }, 500);
    }

    getStatutLabel(statut: string): string {
        const labels: { [key: string]: string } = {
            'EN_ATTENTE': 'En Attente',
            'ACCEPTEE': 'Acceptée',
            'REFUSEE': 'Refusée',
            'PLANIFIEE': 'Planifiée'
        };
        return labels[statut] || statut;
    }

    valider(id: number) {
        if (confirm('Valider cette demande de soutenance ?')) {
            // TODO: Implémenter la vraie logique
            // this.soutenanceService.validerSoutenance(id).subscribe({
            //     next: () => {
            //         alert('Soutenance validée avec succès');
            //         this.loadData();
            //     },
            //     error: (err) => {
            //         console.error('Erreur validation:', err);
            //         alert('Erreur lors de la validation');
            //     }
            // });

            alert('Fonction de validation à implémenter');
            console.log('Validation soutenance ID:', id);
        }
    }

    refuser(id: number) {
        const motif = prompt('Motif du refus (optionnel) :');
        if (motif !== null) { // L'utilisateur n'a pas annulé
            // TODO: Implémenter la vraie logique
            // this.soutenanceService.refuserSoutenance(id, motif).subscribe({
            //     next: () => {
            //         alert('Soutenance refusée');
            //         this.loadData();
            //     },
            //     error: (err) => {
            //         console.error('Erreur refus:', err);
            //         alert('Erreur lors du refus');
            //     }
            // });

            alert('Fonction de refus à implémenter');
            console.log('Refus soutenance ID:', id, 'Motif:', motif);
        }
    }

    voirDetails(id: number) {
        // TODO: Navigation vers page de détails ou ouverture d'un modal
        alert('Fonction de visualisation à implémenter');
        console.log('Voir détails soutenance ID:', id);
    }
}