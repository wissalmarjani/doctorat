import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
    users: User[] = [];
    filteredUsers: User[] = [];
    loading = true;
    searchTerm = '';
    filterRole = 'all';

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading = true;
        this.userService.getAllUsers().subscribe({
            next: (users) => {
                this.users = users;
                this.applyFilters();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    applyFilters(): void {
        let filtered = [...this.users];

        if (this.filterRole !== 'all') {
            filtered = filtered.filter(u => u.role === this.filterRole);
        }

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                u.nom.toLowerCase().includes(term) ||
                u.prenom.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term) ||
                u.matricule.toLowerCase().includes(term)
            );
        }

        this.filteredUsers = filtered;
    }

    getRoleBadge(role: string): { class: string; text: string } {
        switch (role) {
            case 'ADMIN':
                return { class: 'badge-primary', text: 'Admin' };
            case 'DIRECTEUR_THESE':
                return { class: 'badge-warning', text: 'Directeur' };
            case 'DOCTORANT':
                return { class: 'badge-success', text: 'Doctorant' };
            case 'CANDIDAT':
                return { class: 'badge-neutral', text: 'Candidat' };
            default:
                return { class: 'badge-neutral', text: role };
        }
    }

    deleteUser(id: number): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            this.userService.deleteUser(id).subscribe({
                next: () => {
                    this.loadUsers();
                }
            });
        }
    }
}
