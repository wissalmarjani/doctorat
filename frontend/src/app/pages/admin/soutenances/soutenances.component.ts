import { Component, OnInit } from '@angular/core';
import { SoutenanceService } from '../../../services/soutenance.service';
import { Soutenance, MembreJury, JuryDisponible } from '../../../models/soutenance.model';

@Component({
    selector: 'app-admin-soutenances',
    templateUrl: './soutenances.component.html',
    styleUrls: ['./soutenances.component.css']
})
export class SoutenancesComponent implements OnInit {
    soutenances: Soutenance[] = [];
    loading = true;
    selectedSoutenance: Soutenance | null = null;
    showJuryModal = false;
    jurysDisponibles: JuryDisponible[] = [];

    constructor(private soutenanceService: SoutenanceService) { }

    ngOnInit(): void {
        this.loadSoutenances();
    }

    loadSoutenances(): void {
        this.loading = true;
        this.soutenanceService.getAll().subscribe({
            next: (data) => {
                this.soutenances = data;
                this.loading = false;
            },
            error: () => this.loading = false
        });
    }

    autoriser(id: number): void {
        const commentaire = prompt('Commentaire (optionnel):') || undefined;
        this.soutenanceService.autoriserSoutenance(id, commentaire).subscribe({
            next: () => this.loadSoutenances()
        });
    }

    openJuryModal(sout: Soutenance): void {
        this.selectedSoutenance = sout;
        this.showJuryModal = true;
        this.loadJurysDisponibles();
    }

    loadJurysDisponibles(): void {
        this.soutenanceService.getJurysDisponibles().subscribe({
            next: (data) => this.jurysDisponibles = data
        });
    }

    ajouterMembre(prof: JuryDisponible): void {
        if (this.selectedSoutenance?.id) {
            const role = prompt('Rôle dans le jury (PRESIDENT, RAPPORTEUR, EXAMINATEUR):', 'EXAMINATEUR') as any;
            if (role) {
                const membre: MembreJury = {
                    nom: prof.nom,
                    prenom: prof.prenom,
                    email: prof.email,
                    role: role,
                    etablissement: prof.etablissement || 'Inconnu'
                };
                this.soutenanceService.ajouterMembreJury(this.selectedSoutenance.id, membre).subscribe({
                    next: () => {
                        // Refresh jury list in parent modal if needed, or just reload everything
                        this.loadSoutenances();
                    }
                });
            }
        }
    }

    getStatusBadge(statut: string): { class: string; text: string } {
        const statusMap: { [key: string]: { class: string; text: string } } = {
            'SOUMIS': { class: 'badge-primary', text: 'Soumis' },
            'PREREQUIS_VALIDES': { class: 'badge-success', text: 'Prérequis OK' },
            'AUTORISE': { class: 'badge-success', text: 'Autorisé' },
            'PLANIFIE': { class: 'badge-warning', text: 'Planifié' },
            'SOUTENUE': { class: 'badge-success', text: 'Soutenue' },
            'AJOURNE': { class: 'badge-error', text: 'Ajourné' },
            'REJETE': { class: 'badge-error', text: 'Rejeté' }
        };
        return statusMap[statut] || { class: 'badge-neutral', text: statut };
    }
}
