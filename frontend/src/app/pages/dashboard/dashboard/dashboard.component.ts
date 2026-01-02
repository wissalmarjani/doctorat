import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { InscriptionService } from '../../../services/inscription.service';
import { SoutenanceService } from '../../../services/soutenance.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
    currentUser: User | null = null;
    loading = true;
    private subscriptions = new Subscription();

    // Stats for Admin
    stats = {
        totalUsers: 0,
        pendingCandidatures: 0,
        totalInscriptions: 0,
        upcomingSoutenances: 0
    };

    // Directeur stats
    directeurStats = {
        mesDoctorants: 0,
        candidaturesEnAttente: 0,
        reinscriptionsEnAttente: 0,
        soutenancesAValider: 0
    };

    // Doctorant data
    doctorantData = {
        anneeThese: 1,
        progression: 25,
        prochainJalon: 'Réinscription annuelle',
        publications: 0,
        heuresFormation: 0
    };

    // Recent activities
    recentActivities: Activity[] = [];

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private inscriptionService: InscriptionService,
        private soutenanceService: SoutenanceService
    ) { }

    ngOnInit(): void {
        this.subscriptions.add(
            this.authService.currentUser$.subscribe(user => {
                this.currentUser = user;
                if (user) {
                    this.loadDashboardData();
                }
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    loadDashboardData(): void {
        this.loading = true;

        switch (this.currentUser?.role) {
            case 'ADMIN':
                this.loadAdminData();
                break;
            case 'DIRECTEUR_THESE':
                this.loadDirecteurData();
                break;
            case 'DOCTORANT':
                this.loadDoctorantData();
                break;
            case 'CANDIDAT':
                this.loadCandidatData();
                break;
        }
    }

    private loadAdminData(): void {
        // Load users count
        this.userService.getAllUsers().subscribe({
            next: (users) => {
                this.stats.totalUsers = users.length;
                this.stats.pendingCandidatures = users.filter(u => u.etat === 'EN_ATTENTE_ADMIN').length;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });

        // Load inscriptions
        this.inscriptionService.getAll().subscribe({
            next: (inscriptions) => {
                this.stats.totalInscriptions = inscriptions.length;
            }
        });

        // Load soutenances
        this.soutenanceService.getAll().subscribe({
            next: (soutenances) => {
                this.stats.upcomingSoutenances = soutenances.filter(s => s.statut === 'PLANIFIE').length;
            }
        });

        // Mock recent activities
        this.recentActivities = [
            { icon: '👤', title: 'Nouvelle candidature', description: 'Un nouveau candidat s\'est inscrit', time: 'Il y a 2 heures', type: 'info' },
            { icon: '✅', title: 'Inscription validée', description: 'Inscription #45 a été validée', time: 'Il y a 4 heures', type: 'success' },
            { icon: '🎓', title: 'Soutenance planifiée', description: 'Soutenance de M. Alami le 15/01', time: 'Hier', type: 'info' }
        ];
    }

    private loadDirecteurData(): void {
        if (!this.currentUser?.id) return;

        this.userService.getDoctorantsByDirecteur(this.currentUser.id).subscribe({
            next: (doctorants) => {
                this.directeurStats.mesDoctorants = doctorants.length;
                this.directeurStats.candidaturesEnAttente = doctorants.filter(d => d.etat === 'EN_ATTENTE_DIRECTEUR').length;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });

        this.inscriptionService.getReinscriptionsEnAttenteDirecteur(this.currentUser.id).subscribe({
            next: (reinscriptions) => {
                this.directeurStats.reinscriptionsEnAttente = reinscriptions.length;
            }
        });

        this.soutenanceService.getByDirecteur(this.currentUser.id).subscribe({
            next: (soutenances) => {
                this.directeurStats.soutenancesAValider = soutenances.filter(s => s.statut === 'SOUMIS').length;
            }
        });

        this.recentActivities = [
            { icon: '📝', title: 'Demande de réinscription', description: 'M. Bennani demande une réinscription', time: 'Il y a 1 heure', type: 'warning' },
            { icon: '🎓', title: 'Demande de soutenance', description: 'Mme. Fassi souhaite soutenir', time: 'Il y a 3 heures', type: 'info' }
        ];
    }

    private loadDoctorantData(): void {
        if (!this.currentUser) return;

        this.doctorantData = {
            anneeThese: this.currentUser.anneeThese || 1,
            progression: Math.min((this.currentUser.anneeThese || 1) * 25, 100),
            prochainJalon: this.getProchainJalon(),
            publications: this.currentUser.nbPublications || 0,
            heuresFormation: this.currentUser.heuresFormation || 0
        };

        this.recentActivities = [
            { icon: '📄', title: 'Document disponible', description: 'Votre attestation d\'inscription est prête', time: 'Aujourd\'hui', type: 'success' },
            { icon: '📅', title: 'Rappel', description: 'Réinscription avant le 30/09', time: 'Prochainement', type: 'warning' }
        ];

        this.loading = false;
    }

    private loadCandidatData(): void {
        this.recentActivities = [
            { icon: '📋', title: 'Candidature soumise', description: 'Votre dossier est en cours d\'examen', time: this.getTimeAgo(), type: 'info' }
        ];
        this.loading = false;
    }

    private getProchainJalon(): string {
        const annee = this.currentUser?.anneeThese || 1;
        if (annee < 3) return 'Réinscription annuelle';
        if (annee === 3) return 'Préparation soutenance';
        return 'Soutenance de thèse';
    }

    private getTimeAgo(): string {
        const created = this.currentUser?.createdAt;
        if (!created) return 'Récemment';

        const diff = Date.now() - new Date(created).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Aujourd\'hui';
        if (days === 1) return 'Hier';
        return `Il y a ${days} jours`;
    }

    getStatusClass(): string {
        switch (this.currentUser?.etat) {
            case 'VALIDE':
            case 'VALIDE_ADMIN':
            case 'VALIDE_DIRECTEUR':
                return 'status-success';
            case 'REJETE':
            case 'REFUSE':
                return 'status-error';
            case 'EN_ATTENTE_ADMIN':
            case 'EN_ATTENTE_DIRECTEUR':
                return 'status-warning';
            default:
                return 'status-info';
        }
    }

    getStatusText(): string {
        switch (this.currentUser?.etat) {
            case 'VALIDE':
            case 'VALIDE_ADMIN':
                return 'Validé';
            case 'VALIDE_DIRECTEUR':
                return 'En attente admin';
            case 'REJETE':
            case 'REFUSE':
                return 'Refusé';
            case 'EN_ATTENTE_ADMIN':
                return 'En attente de validation admin';
            case 'EN_ATTENTE_DIRECTEUR':
                return 'En attente de validation directeur';
            default:
                return 'En cours';
        }
    }
}

interface Activity {
    icon: string;
    title: string;
    description: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'error';
}
