import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';

@Component({
    selector: 'app-director-validation',
    standalone: true,
    imports: [CommonModule, MainLayoutComponent, FormsModule],
    template: `
        <app-main-layout>
            <div class="page-container p-4">

                <!-- HEADER -->
                <div class="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <h2 class="fw-bold text-dark mb-2">Validation des Inscriptions</h2>
                        <p class="text-muted mb-0">Liste des candidats validés par l'administration, en attente de votre accord.</p>
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

                <!-- TABLEAU -->
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in-up">
                    <div class="table-responsive">
                        <table class="table align-middle mb-0">
                            <thead class="bg-light text-uppercase text-muted small fw-bold">
                            <tr>
                                <th class="ps-4 py-3">Candidat</th>
                                <th>Contact</th>
                                <th>Statut Actuel</th>
                                <th class="text-end pe-4">Détails</th>
                            </tr>
                            </thead>
                            <tbody>
                                @for (user of pendingUsers(); track user.id) {
                                    <!-- Ligne Principale -->
                                    <tr class="cursor-pointer main-row"
                                        [class.expanded]="expandedUserId() === user.id"
                                        (click)="toggleExpand(user.id)">
                                        <td class="ps-4">
                                            <div class="d-flex align-items-center gap-3">
                                                <div class="avatar-circle shadow-sm">
                                                    {{ user.nom?.charAt(0)?.toUpperCase() || '?' }}
                                                </div>
                                                <div>
                                                    <div class="fw-bold text-dark">{{ user.nom }} {{ user.prenom }}</div>
                                                    <div class="small text-muted font-monospace">Mat: {{ user.username }}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div class="text-dark">{{ user.email }}</div>
                                            <div class="small text-muted">{{ user.telephone || 'Non renseigné' }}</div>
                                        </td>
                                        <td>
                                            <span class="badge rounded-pill px-3 py-2" [ngClass]="getEtatBadgeClass(user.etat)">
                                                {{ formatEtat(user.etat) }}
                                            </span>
                                        </td>
                                        <td class="text-end pe-4">
                                            <i class="bi bi-chevron-down transition-icon"
                                               [class.rotate]="expandedUserId() === user.id"></i>
                                        </td>
                                    </tr>

                                    <!-- Ligne Détails (Visible au clic) -->
                                    @if (expandedUserId() === user.id) {
                                        <tr class="detail-row">
                                            <td colspan="4" class="p-0 border-0">
                                                <div class="detail-panel p-4">
                                                    <div class="row g-4">

                                                        <!-- COLONNE 1 : DOCUMENTS -->
                                                        <div class="col-md-6">
                                                            <div class="detail-card h-100">
                                                                <h6 class="section-title text-primary">
                                                                    <i class="bi bi-folder2-open me-2"></i>Dossier Numérique
                                                                </h6>
                                                                <div class="docs-grid mt-3">
                                                                    <!-- CV -->
                                                                    <div class="doc-item" [class.disabled]="!user.cv" (click)="viewDocument(user.cv, $event)">
                                                                        <div class="icon-box bg-purple-subtle">
                                                                            <i class="bi bi-file-earmark-person-fill text-purple"></i>
                                                                        </div>
                                                                        <span class="doc-label">Curriculum Vitae</span>
                                                                    </div>

                                                                    <!-- Diplôme -->
                                                                    <div class="doc-item" [class.disabled]="!user.diplome" (click)="viewDocument(user.diplome, $event)">
                                                                        <div class="icon-box bg-blue-subtle">
                                                                            <i class="bi bi-mortarboard-fill text-blue"></i>
                                                                        </div>
                                                                        <span class="doc-label">Diplôme</span>
                                                                    </div>

                                                                    <!-- Lettre -->
                                                                    <div class="doc-item" [class.disabled]="!user.lettreMotivation" (click)="viewDocument(user.lettreMotivation, $event)">
                                                                        <div class="icon-box bg-orange-subtle">
                                                                            <i class="bi bi-envelope-paper-fill text-orange"></i>
                                                                        </div>
                                                                        <span class="doc-label">Lettre de Motivation</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <!-- COLONNE 2 : DECISION DIRECTEUR -->
                                                        <div class="col-md-6">
                                                            <div class="detail-card h-100 border-start-decision">
                                                                <h6 class="section-title text-dark"><i class="bi bi-pen-fill me-2"></i>Avis du Directeur</h6>

                                                                <!-- Boutons Accepter / Refuser -->
                                                                @if (showRefusalInputId() !== user.id) {
                                                                    <div class="decision-buttons mt-3">
                                                                        <button class="btn btn-success btn-decision"
                                                                                (click)="accepter(user, $event)">
                                                                            <i class="bi bi-check-lg me-2"></i>Accepter et Inscrire
                                                                        </button>
                                                                        <button class="btn btn-danger btn-decision"
                                                                                (click)="initiateRefusal(user.id, $event)">
                                                                            <i class="bi bi-x-lg me-2"></i>Refuser le dossier
                                                                        </button>
                                                                    </div>
                                                                } @else {
                                                                    <!-- Zone Refus (Saisie du motif) -->
                                                                    <div class="refusal-box mt-3 fade-in">
                                                                        <label class="refusal-label">
                                                                            <i class="bi bi-chat-left-text me-2"></i>Motif du refus :
                                                                        </label>
                                                                        <textarea
                                                                                class="form-control refusal-textarea"
                                                                                rows="3"
                                                                                [(ngModel)]="motifText"
                                                                                placeholder="Ex: Sujet non pertinent, dossier incomplet...">
                                                                        </textarea>
                                                                        <div class="refusal-actions">
                                                                            <button class="btn btn-light flex-grow-1" (click)="cancelRefusal($event)">
                                                                                <i class="bi bi-arrow-left me-1"></i>Annuler
                                                                            </button>
                                                                            <button class="btn btn-danger flex-grow-1"
                                                                                    [disabled]="!motifText.trim()"
                                                                                    (click)="confirmerRefus(user, $event)">
                                                                                <i class="bi bi-x-circle me-1"></i>Confirmer le refus
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                }

                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    }
                                }
                                @if (pendingUsers().length === 0 && !isLoading()) {
                                    <tr>
                                        <td colspan="4" class="text-center py-5 text-muted">
                                            <i class="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
                                            Aucune candidature en attente.
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
      .main-row { transition: background 0.2s; border-bottom: 1px solid #f1f5f9; cursor: pointer; }
      .main-row:hover { background-color: #f8fafc; }
      .main-row.expanded { background-color: #eef2ff; border-left: 4px solid #4f46e5; }

      .avatar-circle { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem; }
      .transition-icon { transition: transform 0.3s; }
      .rotate { transform: rotate(180deg); }

      /* DETAIL PANEL */
      .detail-row { background-color: #f8fafc; box-shadow: inset 0 6px 10px -8px rgba(0,0,0,0.1); }
      .detail-panel { animation: slideDown 0.3s ease-out; }
      .detail-card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; }
      .section-title { font-weight: 800; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.8px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 0; }

      /* DOCUMENTS - Style horizontal compact */
      .docs-grid {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .doc-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        background: #fff;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        flex: 1;
        min-width: 140px;
      }
      .doc-item:hover { border-color: #4f46e5; box-shadow: 0 4px 12px rgba(79,70,229,0.1); transform: translateY(-2px); }
      .doc-item.disabled { opacity: 0.5; cursor: not-allowed; background: #f8fafc; border-style: dashed; }

      .icon-box {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        flex-shrink: 0;
      }

      .doc-label {
        font-weight: 600;
        font-size: 0.8rem;
        color: #334155;
        white-space: nowrap;
      }

      /* Couleurs des icônes */
      .bg-purple-subtle { background: #f3e8ff; }
      .text-purple { color: #9333ea; }
      .bg-blue-subtle { background: #dbeafe; }
      .text-blue { color: #2563eb; }
      .bg-orange-subtle { background: #ffedd5; }
      .text-orange { color: #ea580c; }

      /* BOUTONS DECISION */
      .border-start-decision { border-left: 4px solid #cbd5e1; }

      .decision-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .btn-decision {
        padding: 14px 20px;
        font-weight: 600;
        font-size: 0.95rem;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .btn-decision:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }

      /* ZONE REFUS - Bien formatée */
      .refusal-box {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 12px;
        padding: 16px;
      }

      .refusal-label {
        display: block;
        font-size: 0.85rem;
        font-weight: 700;
        color: #dc2626;
        margin-bottom: 12px;
        white-space: nowrap;
      }

      .refusal-textarea {
        background: #fff;
        border: 1px solid #fecaca;
        border-radius: 8px;
        font-size: 0.9rem;
        resize: none;
        width: 100%;
      }
      .refusal-textarea:focus {
        border-color: #f87171;
        box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.15);
        outline: none;
      }

      .refusal-actions {
        display: flex;
        gap: 10px;
        margin-top: 12px;
      }
      .refusal-actions .btn {
        padding: 10px 16px;
        font-weight: 600;
        font-size: 0.85rem;
        border-radius: 8px;
      }

      /* ANIMATIONS */
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
    `]
})
export class DirectorValidationComponent implements OnInit {
    pendingUsers = signal<User[]>([]);
    expandedUserId = signal<number | null>(null);
    showRefusalInputId = signal<number | null>(null);
    isLoading = signal(false);
    motifText = '';

    constructor(private userService: UserService) {}

    ngOnInit() { this.loadData(); }

    loadData() {
        this.isLoading.set(true);
        this.userService.getUsersByEtat('EN_ATTENTE_DIRECTEUR').subscribe({
            next: users => {
                this.pendingUsers.set(users);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erreur chargement:', err);
                this.isLoading.set(false);
            }
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
        if (filename) window.open(this.userService.getDocumentUrl(filename), '_blank');
    }

    accepter(user: User, event: Event) {
        event.stopPropagation();
        if(confirm(`Confirmer l'inscription de ${user.nom} ${user.prenom} ?`)) {
            this.userService.validerCandidatureDirecteur(user.id).subscribe({
                next: () => {
                    alert('Candidature validée avec succès ! Le candidat est maintenant DOCTORANT.');
                    this.loadData();
                },
                error: (err) => {
                    console.error('Erreur validation:', err);
                    alert('Erreur lors de la validation. Vérifiez la console.');
                }
            });
        }
    }

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

    confirmerRefus(user: User, event: Event) {
        event.stopPropagation();

        if (!this.motifText.trim()) {
            alert('Veuillez saisir un motif de refus.');
            return;
        }

        if(confirm(`Refuser définitivement le dossier de ${user.nom} ${user.prenom} ?`)) {
            console.log('Envoi refus pour user:', user.id, 'motif:', this.motifText.trim());

            // ✅ UTILISE LA NOUVELLE MÉTHODE SPÉCIFIQUE AU DIRECTEUR
            this.userService.refuserCandidatureDirecteur(user.id, this.motifText.trim()).subscribe({
                next: (response) => {
                    console.log('Réponse refus:', response);
                    alert('Candidature refusée.');
                    this.loadData();
                    this.showRefusalInputId.set(null);
                    this.motifText = '';
                },
                error: (err) => {
                    console.error('Erreur refus:', err);
                    alert('Erreur lors du refus: ' + (err.status === 403 ? 'Permission refusée' : err.error?.message || 'Erreur inconnue'));
                }
            });
        }
    }

    formatEtat(etat: string | undefined) {
        if (!etat) return 'Nouveau';
        if (etat === 'EN_ATTENTE_DIRECTEUR') return 'Attente Directeur';
        return etat.replace(/_/g, ' ');
    }

    getEtatBadgeClass(etat: string | undefined) {
        if (etat === 'VALIDE') return 'bg-success-subtle';
        if (etat === 'REFUSE') return 'bg-danger-subtle';
        if (etat === 'EN_ATTENTE_DIRECTEUR') return 'bg-info-subtle';
        return 'bg-warning-subtle';
    }
}