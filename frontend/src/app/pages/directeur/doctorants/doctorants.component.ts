import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-doctorants',
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Mes Doctorants</h1>
        <p>Liste des doctorants sous votre direction</p>
      </div>

      <div class="loading-container" *ngIf="loading">
        <div class="loading-spinner"></div>
      </div>

      <div class="doctorants-grid" *ngIf="!loading && doctorants.length > 0">
        <div class="doctorant-card" *ngFor="let doc of doctorants">
          <div class="card-header">
            <div class="avatar">{{ doc.prenom?.charAt(0) }}{{ doc.nom?.charAt(0) }}</div>
            <div class="info">
              <h4>{{ doc.prenom }} {{ doc.nom }}</h4>
              <span>{{ doc.email }}</span>
            </div>
          </div>
          <div class="card-body">
            <p *ngIf="doc.titreThese"><strong>Thèse:</strong> {{ doc.titreThese }}</p>
            <p><strong>Année:</strong> {{ doc.anneeThese || 1 }}/4</p>
            <p><strong>Publications:</strong> {{ doc.nbPublications || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && doctorants.length === 0">
        <span class="icon">👨‍🎓</span>
        <h3>Aucun doctorant</h3>
        <p>Vous n'avez pas encore de doctorants assignés</p>
      </div>
    </div>
  `,
    styles: [`
    .page-container { padding: var(--spacing-xl); }
    .page-header h1 { font-size: var(--font-size-3xl); margin-bottom: var(--spacing-xs); }
    .page-header p { color: var(--neutral-500); margin-bottom: var(--spacing-xl); }
    .loading-container, .empty-state { text-align: center; padding: var(--spacing-3xl); }
    .empty-state .icon { font-size: 4rem; display: block; margin-bottom: var(--spacing-lg); }
    .doctorants-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--spacing-lg); }
    .doctorant-card { background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-card); overflow: hidden; }
    .card-header { display: flex; gap: var(--spacing-md); padding: var(--spacing-lg); background: var(--neutral-50); }
    .avatar { width: 48px; height: 48px; border-radius: var(--radius-full); background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; }
    .info h4 { margin: 0; }
    .info span { font-size: var(--font-size-sm); color: var(--neutral-500); }
    .card-body { padding: var(--spacing-lg); }
    .card-body p { margin-bottom: var(--spacing-sm); }
  `]
})
export class DoctorantsComponent implements OnInit {
    doctorants: User[] = [];
    loading = true;

    constructor(
        private authService: AuthService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        const currentUser = this.authService.currentUserValue;
        if (currentUser?.id) {
            this.userService.getDoctorantsByDirecteur(currentUser.id).subscribe({
                next: (data) => {
                    this.doctorants = data;
                    this.loading = false;
                },
                error: () => this.loading = false
            });
        }
    }
}
