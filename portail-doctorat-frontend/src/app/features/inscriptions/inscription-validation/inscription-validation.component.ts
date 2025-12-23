import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Pour le champ commentaire
import { InscriptionService } from '@core/services/inscription.service';
import { AuthService } from '@core/services/auth.service';
import { Inscription, StatutInscription } from '@core/models/inscription.model';
import { Role } from '@core/models/user.model';

@Component({
  selector: 'app-inscription-validation',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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

      <!-- FILTRES / STATISTIQUES -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="card border-primary bg-primary-subtle h-100">
            <div class="card-body text-center">
              <h1 class="display-4 fw-bold text-primary mb-0">{{ inscriptionsEnAttente().length }}</h1>
              <p class="text-primary-emphasis fw-semibold mb-0">Dossiers en attente de votre validation</p>
            </div>
          </div>
        </div>
      </div>

      <!-- LISTE DES DOSSIERS -->
      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Chargement des dossiers...</p>
        </div>
      } @else if (inscriptionsEnAttente().length === 0) {
        <div class="alert alert-success text-center py-4">
          <i class="bi bi-check-circle-fill fs-1 text-success d-block mb-3"></i>
          <h4>Aucun dossier en attente</h4>
          <p>Tous les dossiers ont été traités pour le moment.</p>
        </div>
      } @else {
        <div class="card shadow-sm border-0">
          <div class="list-group list-group-flush">
            @for (inscription of inscriptionsEnAttente(); track inscription.id) {
              <div class="list-group-item p-4">
                <div class="row">
                  <!-- COLONNE 1 : INFO CANDIDAT -->
                  <div class="col-md-8">
                    <div class="d-flex align-items-center mb-2">
                      <span class="badge bg-secondary me-2">#{{ inscription.id }}</span>
                      <h5 class="mb-0 fw-bold">
                         Candidat ID: {{ inscription.doctorantId }} 
                         <!-- Si vous avez le nom, affichez-le ici via un UserDTO -->
                      </h5>
                    </div>
                    
                    <p class="text-muted mb-2">
                      <i class="bi bi-mortarboard me-1"></i> <strong>Sujet :</strong> {{ inscription.sujetThese }}
                    </p>
                    <p class="text-muted small mb-3">
                      <i class="bi bi-building me-1"></i> Labo : {{ inscription.laboratoireAccueil }} 
                      | <i class="bi bi-calendar me-1"></i> Campagne : {{ inscription.campagne?.titre }}
                    </p>

                    <!-- LIEN VERS LES DOCUMENTS (Optionnel si vous avez une page détail) -->
                    <div class="d-flex gap-2">
                      <!-- Ici on pourrait mettre des boutons pour télécharger les PDF -->
                      <button class="btn btn-sm btn-light border">
                        <i class="bi bi-file-earmark-pdf text-danger"></i> Voir les pièces jointes
                      </button>
                    </div>
                  </div>

                  <!-- COLONNE 2 : ACTIONS -->
                  <div class="col-md-4 border-start ps-md-4 mt-3 mt-md-0 d-flex flex-col justify-content-center">
                    
                    <!-- Zone de commentaire -->
                    <textarea class="form-control mb-2" rows="2" 
                              placeholder="Commentaire (facultatif pour validation, requis pour rejet)..."
                              [(ngModel)]="commentaires[inscription.id]"></textarea>

                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button class="btn btn-outline-danger" (click)="rejeter(inscription)">
                        Rejeter
                      </button>
                      <button class="btn btn-success" (click)="valider(inscription)">
                        <i class="bi bi-check-lg"></i> Valider
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class InscriptionValidationComponent implements OnInit {

  // Liste complète
  allInscriptions = signal<Inscription[]>([]);
  isLoading = signal(true);

  // Gestion des commentaires par ID d'inscription
  commentaires: { [key: number]: string } = {};

  // Rôles
  isAdmin = this.authService.isAdmin;
  isDirecteur = this.authService.isDirecteur;

  // Filtrage intelligent selon le Rôle
  inscriptionsEnAttente = computed(() => {
    const list = this.allInscriptions();

    if (this.isAdmin()) {
      // L'Admin voit ce qui est EN_ATTENTE_ADMIN (étape 1)
      return list.filter(i => i.statut === StatutInscription.EN_ATTENTE_ADMIN);
    }
    else if (this.isDirecteur()) {
      // Le Directeur voit ce qui est EN_ATTENTE_DIRECTEUR (étape 2)
      return list.filter(i => i.statut === StatutInscription.EN_ATTENTE_DIRECTEUR);
    }

    return [];
  });

  constructor(
      private inscriptionService: InscriptionService,
      private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadInscriptions();
  }

  loadInscriptions() {
    this.isLoading.set(true);

    // L'Admin voit TOUTES les inscriptions, le Directeur voit celles affectées (ou toutes selon votre règle métier)
    // Ici, on charge tout et on filtre localement avec le computed() pour simplifier,
    // mais idéalement il faudrait des endpoints backend séparés (/api/inscriptions/to-validate)

    if (this.isAdmin()) {
      this.inscriptionService.getAllInscriptions().subscribe({
        next: (data) => {
          this.allInscriptions.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else if (this.isDirecteur()) {
      // Si le backend a un endpoint spécifique pour le directeur, utilisez-le
      // Sinon on charge tout (attention sécurité en prod)
      this.inscriptionService.getAllInscriptions().subscribe({
        next: (data) => {
          this.allInscriptions.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  valider(inscription: Inscription) {
    if (!confirm('Confirmer la validation de ce dossier ?')) return;

    const commentaire = this.commentaires[inscription.id] || '';

    if (this.isAdmin()) {
      this.inscriptionService.validerParAdmin(inscription.id, commentaire).subscribe(this.handleSuccess);
    } else {
      this.inscriptionService.validerParDirecteur(inscription.id, commentaire).subscribe(this.handleSuccess);
    }
  }

  rejeter(inscription: Inscription) {
    const commentaire = this.commentaires[inscription.id] || '';

    if (!commentaire.trim()) {
      alert('Un commentaire est obligatoire pour justifier le rejet.');
      return;
    }

    if (!confirm('Voulez-vous vraiment rejeter ce dossier ?')) return;

    if (this.isAdmin()) {
      this.inscriptionService.rejeterParAdmin(inscription.id, commentaire).subscribe(this.handleSuccess);
    } else {
      this.inscriptionService.rejeterParDirecteur(inscription.id, commentaire).subscribe(this.handleSuccess);
    }
  }

  private handleSuccess = {
    next: () => {
      this.loadInscriptions(); // Recharger la liste
      alert('Opération effectuée avec succès.');
    },
    error: (err: any) => alert("Erreur lors de l'opération")
  };
}