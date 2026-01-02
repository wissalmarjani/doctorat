import { Component, OnInit } from '@angular/core';
import { InscriptionService } from '../../../services/inscription.service';
import { AuthService } from '../../../services/auth.service';
import { Inscription } from '../../../models/inscription.model';

@Component({
  selector: 'app-doctorant-inscriptions',
  templateUrl: './inscriptions.component.html',
  styleUrls: ['./inscriptions.component.css']
})
export class InscriptionsComponent implements OnInit {
  inscriptions: Inscription[] = [];
  loading = true;
  showNewRequestModal = false;

  newInscription: Partial<Inscription> = {
    typeInscription: 'REINSCRIPTION',
    anneeUniversitaire: this.getCurrentAcademicYear(),
    statut: 'BROUILLON'
  };

  constructor(
    private inscriptionService: InscriptionService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(): void {
    const user = this.authService.currentUserValue;
    if (user?.id) {
      this.loading = true;
      this.inscriptionService.getByDoctorant(user.id).subscribe({
        next: (data) => {
          this.inscriptions = data;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  getCurrentAcademicYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const currentYearStr = year.toString();
    const nextYearStr = (year + 1).toString();
    const prevYearStr = (year - 1).toString();

    return now.getMonth() >= 8 ? `${currentYearStr}/${nextYearStr}` : `${prevYearStr}/${currentYearStr}`;
  }

  openNewRequest(): void {
    this.showNewRequestModal = true;
  }

  closeModal(): void {
    this.showNewRequestModal = false;
  }

  submitNewInscription(): void {
    const user = this.authService.currentUserValue;
    if (user?.id) {
      const inscription: Inscription = {
        ...this.newInscription as Inscription,
        doctorantId: user.id,
        anneeThese: (user.anneeThese || 1) + 1,
        dateSoumission: new Date()
      };

      this.inscriptionService.create(inscription).subscribe({
        next: (created) => {
          if (created.id) {
            this.inscriptionService.soumettre(created.id).subscribe({
              next: () => {
                this.loadInscriptions();
                this.closeModal();
              }
            });
          }
        }
      });
    }
  }

  getStatusBadge(statut: string): { class: string; text: string } {
    const statusMap: { [key: string]: { class: string; text: string } } = {
      'BROUILLON': { class: 'badge-neutral', text: 'Brouillon' },
      'SOUMIS': { class: 'badge-primary', text: 'Soumis' },
      'EN_ATTENTE_DIRECTEUR': { class: 'badge-warning', text: 'Attente Directeur' },
      'VALIDE_DIRECTEUR': { class: 'badge-primary', text: 'Validé Directeur' },
      'EN_ATTENTE_ADMIN': { class: 'badge-warning', text: 'Attente Admin' },
      'VALIDE': { class: 'badge-success', text: 'Validé' },
      'REJETE': { class: 'badge-error', text: 'Rejeté' }
    };
    return statusMap[statut] || { class: 'badge-neutral', text: statut };
  }
}
