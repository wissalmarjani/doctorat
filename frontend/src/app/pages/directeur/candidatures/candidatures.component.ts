import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-directeur-candidatures',
  templateUrl: './candidatures.component.html',
  styleUrls: ['./candidatures.component.css']
})
export class CandidaturesComponent implements OnInit {
  candidatures: User[] = [];
  loading = true;
  selectedCandidat: User | null = null;
  sujetThese = '';
  motifRefus = '';
  showValidateModal = false;
  showRejectModal = false;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadCandidatures();
  }

  loadCandidatures(): void {
    const user = this.authService.currentUserValue;
    if (user?.id) {
      this.loading = true;
      this.userService.getDoctorantsByDirecteur(user.id).subscribe({
        next: (data) => {
          // Filter only candidates in wait for director
          this.candidatures = data.filter(c => c.etat === 'EN_ATTENTE_DIRECTEUR');
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  openValidateModal(candidat: User): void {
    this.selectedCandidat = candidat;
    this.sujetThese = '';
    this.showValidateModal = true;
  }

  openRejectModal(candidat: User): void {
    this.selectedCandidat = candidat;
    this.motifRefus = '';
    this.showRejectModal = true;
  }

  closeModals(): void {
    this.showValidateModal = false;
    this.showRejectModal = false;
    this.selectedCandidat = null;
  }

  valider(): void {
    if (this.selectedCandidat?.id) {
      this.userService.validateByDirecteur(this.selectedCandidat.id, this.sujetThese).subscribe({
        next: () => {
          this.loadCandidatures();
          this.closeModals();
        }
      });
    }
  }

  rejeter(): void {
    if (this.selectedCandidat?.id && this.motifRefus) {
      this.userService.refuseByDirecteur(this.selectedCandidat.id, this.motifRefus).subscribe({
        next: () => {
          this.loadCandidatures();
          this.closeModals();
        }
      });
    }
  }
}
