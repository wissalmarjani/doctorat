import { Component, OnInit } from '@angular/core';
import { InscriptionService } from '../../../services/inscription.service';
import { AuthService } from '../../../services/auth.service';
import { Inscription } from '../../../models/inscription.model';

@Component({
  selector: 'app-reinscriptions',
  templateUrl: './reinscriptions.component.html',
  styleUrls: ['./reinscriptions.component.css']
})
export class ReinscriptionsComponent implements OnInit {
  reinscriptions: Inscription[] = [];
  loading = true;

  constructor(
    private inscriptionService: InscriptionService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadReinscriptions();
  }

  loadReinscriptions(): void {
    const user = this.authService.currentUserValue;
    if (user?.id) {
      this.loading = true;
      this.inscriptionService.getReinscriptionsEnAttenteDirecteur(user.id).subscribe({
        next: (data) => {
          this.reinscriptions = data;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  valider(id: number): void {
    const commentaire = prompt('Commentaire (optionnel):') || undefined;
    this.inscriptionService.validerParDirecteur(id, commentaire).subscribe({
      next: () => this.loadReinscriptions()
    });
  }

  rejeter(id: number): void {
    const motif = prompt('Motif du rejet (obligatoire):');
    if (motif) {
      this.inscriptionService.rejeterParDirecteur(id, motif).subscribe({
        next: () => this.loadReinscriptions()
      });
    }
  }
}
