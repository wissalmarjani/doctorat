import { Component } from '@angular/core';

@Component({
    selector: 'app-unauthorized',
    template: `
    <div class="error-container">
      <div class="error-content">
        <span class="error-icon">🚫</span>
        <h1>Accès refusé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <a routerLink="/dashboard" class="btn btn-primary">Retour au tableau de bord</a>
      </div>
    </div>
  `,
    styles: [`
    .error-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--gradient-hero);
      padding: var(--spacing-xl);
    }
    .error-content {
      text-align: center;
      background: white;
      padding: var(--spacing-3xl);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-2xl);
      max-width: 400px;
    }
    .error-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: var(--spacing-lg);
    }
    h1 {
      margin-bottom: var(--spacing-md);
      color: var(--error-600);
    }
    p {
      color: var(--neutral-600);
      margin-bottom: var(--spacing-xl);
    }
  `]
})
export class UnauthorizedComponent { }
