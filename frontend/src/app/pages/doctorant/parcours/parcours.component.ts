import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-parcours',
    template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Mon Parcours Doctoral</h1>
        <p>Suivez votre progression dans le programme doctoral</p>
      </div>

      <div class="progress-section" *ngIf="currentUser">
        <div class="progress-card">
          <div class="progress-header">
            <h3>Progression</h3>
            <span class="badge badge-primary">Année {{ currentUser.anneeThese || 1 }}/4</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress">
              <div class="progress-bar" [style.width.%]="progressPercent"></div>
            </div>
            <span>{{ progressPercent }}% complété</span>
          </div>
        </div>
      </div>

      <div class="info-grid" *ngIf="currentUser">
        <div class="info-card">
          <span class="icon">📖</span>
          <h4>Ma Thèse</h4>
          <p>{{ currentUser.titreThese || 'Sujet non encore défini' }}</p>
        </div>
        <div class="info-card">
          <span class="icon">📚</span>
          <h4>Publications</h4>
          <p class="big-number">{{ currentUser.nbPublications || 0 }}</p>
        </div>
        <div class="info-card">
          <span class="icon">🎤</span>
          <h4>Conférences</h4>
          <p class="big-number">{{ currentUser.nbConferences || 0 }}</p>
        </div>
        <div class="info-card">
          <span class="icon">⏱️</span>
          <h4>Heures de formation</h4>
          <p class="big-number">{{ currentUser.heuresFormation || 0 }}h</p>
        </div>
      </div>

      <div class="timeline-section">
        <h3>Étapes du parcours</h3>
        <div class="timeline">
          <div class="timeline-item completed">
            <div class="marker">✓</div>
            <div class="content">
              <h5>Première inscription</h5>
              <p>Inscription validée</p>
            </div>
          </div>
          <div class="timeline-item" [class.active]="(currentUser?.anneeThese || 1) >= 2">
            <div class="marker">{{ (currentUser?.anneeThese || 1) >= 2 ? '✓' : '2' }}</div>
            <div class="content">
              <h5>Réinscription année 2</h5>
              <p>{{ (currentUser?.anneeThese || 1) >= 2 ? 'Complétée' : 'À venir' }}</p>
            </div>
          </div>
          <div class="timeline-item" [class.active]="(currentUser?.anneeThese || 1) >= 3">
            <div class="marker">{{ (currentUser?.anneeThese || 1) >= 3 ? '✓' : '3' }}</div>
            <div class="content">
              <h5>Réinscription année 3</h5>
              <p>{{ (currentUser?.anneeThese || 1) >= 3 ? 'Complétée' : 'À venir' }}</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="marker">🎓</div>
            <div class="content">
              <h5>Soutenance de thèse</h5>
              <p>Objectif final</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-container { padding: var(--spacing-xl); max-width: 1200px; margin: 0 auto; }
    .page-header h1 { font-size: var(--font-size-3xl); margin-bottom: var(--spacing-xs); }
    .page-header p { color: var(--neutral-500); margin-bottom: var(--spacing-xl); }
    
    .progress-section { margin-bottom: var(--spacing-2xl); }
    .progress-card { background: var(--gradient-primary); padding: var(--spacing-xl); border-radius: var(--radius-xl); color: white; }
    .progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg); }
    .progress-header h3 { margin: 0; color: white; }
    .progress-header .badge { background: rgba(255,255,255,0.2); color: white; }
    .progress-bar-container { }
    .progress { height: 12px; background: rgba(255,255,255,0.3); border-radius: var(--radius-full); margin-bottom: var(--spacing-sm); }
    .progress-bar { height: 100%; background: white; border-radius: var(--radius-full); transition: width 0.5s; }
    
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-2xl); }
    .info-card { background: white; padding: var(--spacing-xl); border-radius: var(--radius-xl); box-shadow: var(--shadow-card); text-align: center; }
    .info-card .icon { font-size: 2rem; display: block; margin-bottom: var(--spacing-sm); }
    .info-card h4 { margin-bottom: var(--spacing-sm); color: var(--neutral-600); }
    .info-card .big-number { font-size: var(--font-size-3xl); font-weight: 700; color: var(--primary-600); margin: 0; }
    
    .timeline-section { background: white; padding: var(--spacing-xl); border-radius: var(--radius-xl); box-shadow: var(--shadow-card); }
    .timeline-section h3 { margin-bottom: var(--spacing-xl); }
    .timeline { position: relative; padding-left: 40px; }
    .timeline::before { content: ''; position: absolute; left: 15px; top: 0; bottom: 0; width: 2px; background: var(--neutral-200); }
    .timeline-item { position: relative; padding-bottom: var(--spacing-xl); }
    .timeline-item:last-child { padding-bottom: 0; }
    .timeline-item .marker { position: absolute; left: -40px; width: 32px; height: 32px; background: var(--neutral-200); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--neutral-500); }
    .timeline-item.completed .marker { background: var(--success-500); color: white; }
    .timeline-item.active .marker { background: var(--primary-500); color: white; }
    .timeline-item .content h5 { margin: 0 0 var(--spacing-xs); }
    .timeline-item .content p { margin: 0; color: var(--neutral-500); font-size: var(--font-size-sm); }
  `]
})
export class ParcoursComponent implements OnInit {
    currentUser: User | null = null;

    constructor(private authService: AuthService) { }

    ngOnInit() {
        this.currentUser = this.authService.currentUserValue;
    }

    get progressPercent(): number {
        const annee = this.currentUser?.anneeThese || 1;
        return Math.min(annee * 25, 100);
    }
}
