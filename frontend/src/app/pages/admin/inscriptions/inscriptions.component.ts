import { Component, OnInit } from '@angular/core';
import { InscriptionService } from '../../../services/inscription.service';
import { Inscription } from '../../../models/inscription.model';

@Component({
    selector: 'app-inscriptions',
    templateUrl: './inscriptions.component.html',
    styleUrls: ['./inscriptions.component.css']
})
export class InscriptionsComponent implements OnInit {
    inscriptions: Inscription[] = [];
    loading = true;
    filterType = 'all';

    constructor(private inscriptionService: InscriptionService) { }

    ngOnInit(): void {
        this.loadInscriptions();
    }

    loadInscriptions(): void {
        this.loading = true;
        this.inscriptionService.getAll().subscribe({
            next: (data) => {
                this.inscriptions = data;
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    valider(id: number): void {
        const commentaire = prompt('Commentaire (optionnel):') || undefined;
        this.inscriptionService.validerParAdmin(id, commentaire).subscribe({
            next: () => this.loadInscriptions()
        });
    }

    rejeter(id: number): void {
        const motif = prompt('Motif du rejet (obligatoire):');
        if (motif) {
            this.inscriptionService.rejeterParAdmin(id, motif).subscribe({
                next: () => this.loadInscriptions()
            });
        }
    }

    getStatusBadge(statut: string): { class: string; text: string } {
        const statusMap: { [key: string]: { class: string; text: string } } = {
            'BROUILLON': { class: 'badge-neutral', text: 'Brouillon' },
            'SOUMIS': { class: 'badge-primary', text: 'Soumis' },
            'EN_ATTENTE_DIRECTEUR': { class: 'badge-warning', text: 'Attente Directeur' },
            'VALIDE_DIRECTEUR': { class: 'badge-primary', text: 'Validé Directeur' },
            'EN_ATTENTE_ADMIN': { class: 'badge-warning', text: 'Attente Admin' },
            'VALIDE': { class: 'badge-success', text: 'Validé' },
            'REJETE': { class: 'badge-error', text: 'Rejeté' }
        };
        return statusMap[statut] || { class: 'badge-neutral', text: statut };
    }
}
