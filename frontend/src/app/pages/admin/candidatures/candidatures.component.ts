import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-candidatures',
    templateUrl: './candidatures.component.html',
    styleUrls: ['./candidatures.component.css']
})
export class CandidaturesComponent implements OnInit {
    candidatures: User[] = [];
    filteredCandidatures: User[] = [];
    loading = true;
    selectedCandidat: User | null = null;
    directeurs: User[] = [];

    // Modal states
    showValidateModal = false;
    showRejectModal = false;
    showDetailsModal = false;

    // Form inputs
    selectedDirecteurId: number | null = null;
    sujetThese = '';
    motifRefus = '';

    // Filters
    filterStatus = 'all';
    searchTerm = '';

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.loadCandidatures();
        this.loadDirecteurs();
    }

    loadCandidatures(): void {
        this.loading = true;
        this.userService.getUsersByRole('CANDIDAT').subscribe({
            next: (users) => {
                this.candidatures = users;
                this.applyFilters();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    loadDirecteurs(): void {
        this.userService.getDirecteurs().subscribe({
            next: (directeurs) => {
                this.directeurs = directeurs;
            }
        });
    }

    applyFilters(): void {
        let filtered = [...this.candidatures];

        // Status filter
        if (this.filterStatus !== 'all') {
            filtered = filtered.filter(c => c.etat === this.filterStatus);
        }

        // Search filter
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(c =>
                c.nom.toLowerCase().includes(term) ||
                c.prenom.toLowerCase().includes(term) ||
                c.email.toLowerCase().includes(term) ||
                c.matricule.toLowerCase().includes(term)
            );
        }

        this.filteredCandidatures = filtered;
    }

    openValidateModal(candidat: User): void {
        this.selectedCandidat = candidat;
        this.selectedDirecteurId = null;
        this.sujetThese = '';
        this.showValidateModal = true;
    }

    openRejectModal(candidat: User): void {
        this.selectedCandidat = candidat;
        this.motifRefus = '';
        this.showRejectModal = true;
    }

    openDetailsModal(candidat: User): void {
        this.selectedCandidat = candidat;
        this.showDetailsModal = true;
    }

    closeModals(): void {
        this.showValidateModal = false;
        this.showRejectModal = false;
        this.showDetailsModal = false;
        this.selectedCandidat = null;
    }

    validateCandidat(): void {
        if (!this.selectedCandidat?.id) return;

        this.userService.validateByAdmin(
            this.selectedCandidat.id,
            this.selectedDirecteurId ?? undefined
        ).subscribe({
            next: () => {
                this.loadCandidatures();
                this.closeModals();
            },
            error: (err) => {
                console.error('Erreur validation:', err);
            }
        });
    }

    rejectCandidat(): void {
        if (!this.selectedCandidat?.id || !this.motifRefus) return;

        this.userService.refuseByAdmin(this.selectedCandidat.id, this.motifRefus).subscribe({
            next: () => {
                this.loadCandidatures();
                this.closeModals();
            },
            error: (err) => {
                console.error('Erreur rejet:', err);
            }
        });
    }

    getStatusBadge(etat: string): { class: string; text: string } {
        switch (etat) {
            case 'EN_ATTENTE_ADMIN':
                return { class: 'badge-warning', text: 'En attente Admin' };
            case 'EN_ATTENTE_DIRECTEUR':
                return { class: 'badge-primary', text: 'En attente Directeur' };
            case 'VALIDE':
                return { class: 'badge-success', text: 'Validé' };
            case 'REFUSE':
            case 'REJETE':
                return { class: 'badge-error', text: 'Refusé' };
            default:
                return { class: 'badge-neutral', text: etat };
        }
    }

    getInitials(user: User): string {
        return `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase();
    }

    getPendingCount(): number {
        return this.candidatures.filter(c => c.etat === 'EN_ATTENTE_ADMIN').length;
    }
}
