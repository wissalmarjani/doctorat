import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscriptionService } from '@core/services/inscription.service';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service'; // Assurez-vous d'avoir ce service
import { Inscription, StatutInscription } from '@core/models/inscription.model';

@Component({
    selector: 'app-admin-inscription-validation',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="container py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Validation des Inscriptions</h2>
                    <p class="text-muted">
                        Espace de validation
                        @if (isAdmin()) { <span class="badge bg-danger">ADMINISTRATION</span> }
                        @else { <span class="badge bg-info text-dark">DIRECTION DE THÈSE</span> }
                    </p>
                </div>
                <button (click)="loadInscriptions()" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-arrow-clockwise"></i> Actualiser
                </button>
            </div>

            <!-- SPINNER -->
            @if (isLoading()) {
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="mt-2">Chargement des dossiers...</p>
                </div>
            }

            @else if (inscriptionsEnAttente().length === 0) {
                <div class="alert alert-success text-center py-4">
                    <i class="bi bi-check-circle-fill fs-1 text-success d-block mb-3"></i>
                    <h4>Aucun dossier en attente</h4>
                </div>
            }

            @else {
                <div class="list-group list-group-flush shadow-sm rounded">
                    @for (inscription of inscriptionsEnAttente(); track inscription.id) {
                        <div class="list-group-item p-4 mb-3 border rounded">
                            <div class="row">
                                <!-- COLONNE GAUCHE -->
                                <div class="col-md-8">
                                    <div class="d-flex align-items-center mb-2">
                                        <span class="badge bg-secondary me-2">#{{ inscription.id }}</span>
                                        <h5 class="mb-0 fw-bold">
                                            <!-- Affichage du nom récupéré ou de l'ID par défaut -->
                                            {{ inscription.doctorantNom ? (inscription.doctorantNom + ' ' + inscription.doctorantPrenom) : ('Candidat ID: ' + inscription.doctorantId) }}
                                        </h5>
                                    </div>

                                    <p class="text-muted mb-2">
                                        <i class="bi bi-mortarboard me-1"></i> <strong>Sujet :</strong> {{ inscription.sujetThese }}
                                    </p>

                                    <div class="mt-3">
                                        <span class="badge bg-light text-dark border me-2"><i class="bi bi-file-pdf me-1"></i>CV</span>
                                        <span class="badge bg-light text-dark border me-2"><i class="bi bi-file-pdf me-1"></i>Diplôme</span>
                                        <span class="badge bg-light text-dark border"><i class="bi bi-file-pdf me-1"></i>Lettre</span>
                                    </div>
                                </div>

                                <!-- COLONNE DROITE (Actions) -->
                                <div class="col-md-4 border-start ps-md-4 mt-3 mt-md-0">
                  <textarea class="form-control mb-2" rows="2"
                            placeholder="Commentaire (requis pour rejet)..."
                            [(ngModel)]="commentaires[inscription.id]"></textarea>

                                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                        <button class="btn btn-outline-danger" (click)="rejeter(inscription)">Rejeter</button>
                                        <button class="btn btn-success" (click)="valider(inscription)">Valider</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    `
})
export class AdminInscriptionValidationComponent implements OnInit {

    allInscriptions = signal<Inscription[]>([]);
    isLoading = signal(true);
    commentaires: { [key: number]: string } = {};

    isAdmin = this.authService.isAdmin;
    isDirecteur = this.authService.isDirecteur;

    // Filtre les inscriptions selon le rôle de la personne connectée
    inscriptionsEnAttente = computed(() => {
        const list = this.allInscriptions();
        if (this.isAdmin()) return list.filter(i => i.statut === StatutInscription.EN_ATTENTE_ADMIN);
        else if (this.isDirecteur()) return list.filter(i => i.statut === StatutInscription.EN_ATTENTE_DIRECTEUR);
        return [];
    });

    constructor(
        private inscriptionService: InscriptionService,
        private authService: AuthService,
        private userService: UserService
    ) {}

    ngOnInit() {
        this.loadInscriptions();
    }

    loadInscriptions() {
        this.isLoading.set(true);

        // 1. On récupère la liste brute (avec seulement doctorantId)
        this.inscriptionService.getAllInscriptions().subscribe({
            next: (data) => {
                const inscriptionsList = [...data];

                if (inscriptionsList.length === 0) {
                    this.allInscriptions.set([]);
                    this.isLoading.set(false);
                    return;
                }

                // 2. Pour chaque inscription, on va chercher le nom du candidat
                let loadedCount = 0;
                inscriptionsList.forEach(insc => {
                    this.userService.getUserById(insc.doctorantId).subscribe({
                        next: (user) => {
                            // C'est ici qu'on "hydrate" l'objet
                            insc.doctorantNom = user.nom;
                            insc.doctorantPrenom = user.prenom;

                            loadedCount++;
                            if (loadedCount === inscriptionsList.length) {
                                this.allInscriptions.set(inscriptionsList);
                                this.isLoading.set(false);
                            }
                        },
                        error: () => {
                            // Si on ne trouve pas le user, on continue quand même
                            loadedCount++;
                            if (loadedCount === inscriptionsList.length) {
                                this.allInscriptions.set(inscriptionsList);
                                this.isLoading.set(false);
                            }
                        }
                    });
                });
            },
            error: () => this.isLoading.set(false)
        });
    }

    valider(inscription: Inscription) {
        if (!confirm('Confirmer la validation ?')) return;
        const commentaire = this.commentaires[inscription.id] || '';

        const obs = this.isAdmin()
            ? this.inscriptionService.validerParAdmin(inscription.id, commentaire)
            : this.inscriptionService.validerParDirecteur(inscription.id, commentaire);

        obs.subscribe({
            next: () => {
                alert('Validé avec succès');
                this.loadInscriptions();
            },
            error: () => alert('Erreur lors de la validation')
        });
    }

    rejeter(inscription: Inscription) {
        const commentaire = this.commentaires[inscription.id] || '';
        if (!commentaire.trim()) { alert('Commentaire obligatoire pour le rejet.'); return; }
        if (!confirm('Rejeter ce dossier ?')) return;

        const obs = this.isAdmin()
            ? this.inscriptionService.rejeterParAdmin(inscription.id, commentaire)
            : this.inscriptionService.rejeterParDirecteur(inscription.id, commentaire);

        obs.subscribe({
            next: () => {
                alert('Rejeté avec succès');
                this.loadInscriptions();
            },
            error: () => alert('Erreur lors du rejet')
        });
    }
}