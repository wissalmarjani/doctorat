import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
    currentUser: User | null = null;
    isCollapsed = false;
    activeRoute = '';
    private subscriptions = new Subscription();

    menuItems: MenuItem[] = [];

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.subscriptions.add(
            this.authService.currentUser$.subscribe(user => {
                this.currentUser = user;
                this.buildMenu();
            })
        );

        this.subscriptions.add(
            this.router.events.pipe(
                filter(event => event instanceof NavigationEnd)
            ).subscribe((event: any) => {
                this.activeRoute = event.urlAfterRedirects;
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    buildMenu(): void {
        const role = this.currentUser?.role;

        this.menuItems = [
            {
                label: 'Tableau de bord',
                icon: '📊',
                route: '/dashboard',
                roles: ['ADMIN', 'DOCTORANT', 'DIRECTEUR_THESE', 'CANDIDAT']
            }
        ];

        // Admin menu
        if (role === 'ADMIN') {
            this.menuItems.push(
                { label: 'Candidatures', icon: '📋', route: '/admin/candidatures', roles: ['ADMIN'] },
                { label: 'Inscriptions', icon: '📝', route: '/admin/inscriptions', roles: ['ADMIN'] },
                { label: 'Soutenances', icon: '🎓', route: '/admin/soutenances', roles: ['ADMIN'] },
                { label: 'Utilisateurs', icon: '👥', route: '/admin/users', roles: ['ADMIN'] },
                { label: 'Campagnes', icon: '📅', route: '/admin/campagnes', roles: ['ADMIN'] },
                { label: 'Documents', icon: '📄', route: '/admin/documents', roles: ['ADMIN'] }
            );
        }

        // Directeur menu
        if (role === 'DIRECTEUR_THESE') {
            this.menuItems.push(
                { label: 'Mes Doctorants', icon: '👨‍🎓', route: '/directeur/doctorants', roles: ['DIRECTEUR_THESE'] },
                { label: 'Candidatures', icon: '📋', route: '/directeur/candidatures', roles: ['DIRECTEUR_THESE'] },
                { label: 'Réinscriptions', icon: '📝', route: '/directeur/reinscriptions', roles: ['DIRECTEUR_THESE'] },
                { label: 'Soutenances', icon: '🎓', route: '/directeur/soutenances', roles: ['DIRECTEUR_THESE'] }
            );
        }

        // Doctorant menu
        if (role === 'DOCTORANT') {
            this.menuItems.push(
                { label: 'Mon Parcours', icon: '🎯', route: '/doctorant/parcours', roles: ['DOCTORANT'] },
                { label: 'Inscriptions', icon: '📝', route: '/doctorant/inscriptions', roles: ['DOCTORANT'] },
                { label: 'Ma Soutenance', icon: '🎓', route: '/doctorant/soutenance', roles: ['DOCTORANT'] },
                { label: 'Mes Documents', icon: '📄', route: '/doctorant/documents', roles: ['DOCTORANT'] }
            );
        }

        // Candidat menu
        if (role === 'CANDIDAT') {
            this.menuItems.push(
                { label: 'Ma Candidature', icon: '📋', route: '/candidat/candidature', roles: ['CANDIDAT'] },
                { label: 'Mon Dossier', icon: '📁', route: '/candidat/dossier', roles: ['CANDIDAT'] }
            );
        }
    }

    toggleSidebar(): void {
        this.isCollapsed = !this.isCollapsed;
    }

    isActive(route: string): boolean {
        return this.activeRoute.startsWith(route);
    }

    logout(): void {
        this.authService.logout();
    }

    getInitials(user: User | null): string {
        if (!user) return '?';
        return `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase();
    }
}

interface MenuItem {
    label: string;
    icon: string;
    route: string;
    roles: string[];
}
