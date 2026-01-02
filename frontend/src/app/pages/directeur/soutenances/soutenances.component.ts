import { Component, OnInit } from '@angular/core';
import { SoutenanceService } from '../../../services/soutenance.service';
import { AuthService } from '../../../services/auth.service';
import { Soutenance } from '../../../models/soutenance.model';

@Component({
  selector: 'app-directeur-soutenances',
  templateUrl: './soutenances.component.html',
  styleUrls: ['./soutenances.component.css']
})
export class SoutenancesComponent implements OnInit {
  soutenances: Soutenance[] = [];
  loading = true;

  constructor(
    private soutenanceService: SoutenanceService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadSoutenances();
  }

  loadSoutenances(): void {
    const user = this.authService.currentUserValue;
    if (user?.id) {
      this.loading = true;
      this.soutenanceService.getByDirecteur(user.id).subscribe({
        next: (data) => {
          this.soutenances = data;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  validerPrerequis(id: number): void {
    const commentaire = prompt('Commentaire (optionnel):') || undefined;
    this.soutenanceService.validerPrerequis(id, commentaire).subscribe({
      next: () => this.loadSoutenances()
    });
  }

  rejeter(id: number): void {
    const motif = prompt('Motif du rejet (obligatoire):');
    if (motif) {
      this.soutenanceService.rejeterParDirecteur(id, motif).subscribe({
        next: () => this.loadSoutenances()
      });
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
