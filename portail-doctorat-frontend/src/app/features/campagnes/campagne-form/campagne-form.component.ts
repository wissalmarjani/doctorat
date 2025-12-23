import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { InscriptionService } from '@core/services/inscription.service';

@Component({
    selector: 'app-campagne-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, MainLayoutComponent],
    template: `
        <app-main-layout>
            <div class="page-container p-4">

                <!-- Header -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <a routerLink="/campagnes" class="text-decoration-none text-secondary mb-2 d-inline-block">
                            <i class="bi bi-arrow-left"></i> Retour
                        </a>
                        <h2 class="fw-bold mb-0 text-dark">
                            {{ isEditMode() ? 'Modifier la campagne' : 'Nouvelle campagne' }}
                        </h2>
                    </div>
                </div>

                <div class="card shadow-sm border-0 rounded-4" style="max-width: 800px; margin: 0 auto;">
                    <div class="card-body p-4">

                        <form [formGroup]="campagneForm" (ngSubmit)="onSubmit()">

                            <!-- Informations Générales -->
                            <h5 class="text-primary mb-3">Informations Générales</h5>
                            <div class="row g-3 mb-4">
                                <div class="col-md-8">
                                    <label class="form-label fw-bold">Titre de la campagne</label>
                                    <input type="text" class="form-control" formControlName="titre" placeholder="Ex: Doctorat 2025-2026">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-bold">Année Universitaire</label>
                                    <input type="text" class="form-control" formControlName="anneeUniversitaire" placeholder="Ex: 2025-2026">
                                </div>
                            </div>

                            <!-- Dates -->
                            <div class="row g-3 mb-4">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Date d'ouverture</label>
                                    <input type="date" class="form-control" formControlName="dateDebut">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">Date de fermeture</label>
                                    <input type="date" class="form-control" formControlName="dateFin">
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="d-flex justify-content-end gap-2 pt-3 border-top">
                                <button type="button" class="btn btn-light border" routerLink="/campagnes">Annuler</button>
                                <button type="submit" class="btn btn-primary px-4" [disabled]="campagneForm.invalid || isLoading()">
                                    @if (isLoading()) { <span class="spinner-border spinner-border-sm me-2"></span> }
                                    {{ isEditMode() ? 'Enregistrer les modifications' : 'Créer la campagne' }}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            </div>
        </app-main-layout>
    `
})
export class CampagneFormComponent implements OnInit {
    campagneForm: FormGroup;
    isEditMode = signal(false);
    isLoading = signal(false);
    currentId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private inscriptionService: InscriptionService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.campagneForm = this.fb.group({
            titre: ['', Validators.required],
            anneeUniversitaire: ['', Validators.required],
            dateDebut: ['', Validators.required],
            dateFin: ['', Validators.required],
            active: [true]
        });
    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.currentId = +id;
            this.loadCampagne(this.currentId);
        }
    }

    loadCampagne(id: number) {
        this.inscriptionService.getCampagneById(id).subscribe({
            next: (data: any) => { // 'any' pour accepter les différents noms de champs
                console.log("Données reçues (Load):", data);

                const formData = {
                    titre: data.titre,
                    anneeUniversitaire: data.anneeUniversitaire,
                    active: data.active,
                    // ✅ CORRECTION : On cherche dateOuverture OU dateDebut
                    dateDebut: this.formatDate(data.dateOuverture || data.dateDebut),
                    // ✅ CORRECTION : On cherche dateFermeture OU dateFin
                    dateFin: this.formatDate(data.dateFermeture || data.dateFin)
                };
                this.campagneForm.patchValue(formData);
            },
            error: (err) => console.error("Impossible de charger la campagne", err)
        });
    }

    private formatDate(dateValue: any): string {
        if (!dateValue) return '';
        const d = new Date(dateValue);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    }

    onSubmit() {
        if (this.campagneForm.invalid) return;
        this.isLoading.set(true);

        const formValues = this.campagneForm.value;

        // ✅ CORRECTION MAJEURE ICI : Mapping des noms pour le Backend
        const campagneToSend = {
            id: this.currentId,
            titre: formValues.titre,
            anneeUniversitaire: formValues.anneeUniversitaire,

            // 👉 Angular utilise 'dateDebut', mais Java veut 'dateOuverture'
            dateOuverture: formValues.dateDebut,

            // 👉 Angular utilise 'dateFin', mais Java veut 'dateFermeture'
            dateFermeture: formValues.dateFin,

            active: formValues.active
        };

        console.log("Envoi au serveur (Corrigé) :", campagneToSend);

        const operation = (this.isEditMode() && this.currentId)
            ? this.inscriptionService.updateCampagne(this.currentId, campagneToSend as any)
            : this.inscriptionService.createCampagne(campagneToSend as any);

        operation.subscribe({
            next: () => {
                alert("Campagne enregistrée avec succès !");
                this.router.navigate(['/campagnes']);
            },
            error: (err) => {
                console.error("Erreur Backend :", err);
                const message = err.error?.message || "Erreur lors de l'enregistrement (Vérifiez les dates)";
                alert(message);
                this.isLoading.set(false);
            }
        });
    }
}