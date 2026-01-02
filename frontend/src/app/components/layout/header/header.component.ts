import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
    currentUser: User | null = null;
    showNotifications = false;
    showUserMenu = false;
    notifications: any[] = [];
    private subscription = new Subscription();

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.subscription.add(
            this.authService.currentUser$.subscribe(user => {
                this.currentUser = user;
            })
        );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    toggleNotifications(): void {
        this.showNotifications = !this.showNotifications;
        this.showUserMenu = false;
    }

    toggleUserMenu(): void {
        this.showUserMenu = !this.showUserMenu;
        this.showNotifications = false;
    }

    logout(): void {
        this.authService.logout();
    }

    getInitials(user: User | null): string {
        if (!user) return '?';
        return `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase();
    }

    getRoleBadgeClass(): string {
        switch (this.currentUser?.role) {
            case 'ADMIN': return 'badge-primary';
            case 'DIRECTEUR_THESE': return 'badge-warning';
            case 'DOCTORANT': return 'badge-success';
            case 'CANDIDAT': return 'badge-neutral';
            default: return 'badge-neutral';
        }
    }
}
