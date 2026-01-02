import { Component, OnInit } from '@angular/core';
import { InscriptionService } from '../../../services/inscription.service';
import { Campagne } from '../../../models/inscription.model';

@Component({
  selector: 'app-campagnes',
  templateUrl: './campagnes.component.html',
  styleUrls: ['./campagnes.component.css']
})
export class CampagnesComponent implements OnInit {
  campagnes: Campagne[] = [];
  loading = true;
  showModal = false;
  newCampagne: Partial<Campagne> = {
    titre: '',
    anneeUniversitaire: this.getCurrentAcademicYear(),
    dateOuverture: new Date(),
    dateFermeture: new Date(),
    active: false
  };

  constructor(private inscriptionService: InscriptionService) { }

  ngOnInit(): void {
    this.loadCampagnes();
  }

  getCurrentAcademicYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    return now.getMonth() >= 8 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
  }

  loadCampagnes(): void {
    this.loading = true;
    this.inscriptionService.getAllCampagnes().subscribe({
      next: (data) => {
        this.campagnes = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  toggleActive(campagne: Campagne): void {
    this.inscriptionService.updateCampagne(campagne.id!, { active: !campagne.active }).subscribe({
      next: () => this.loadCampagnes()
    });
  }

  saveCampagne(): void {
    if (this.newCampagne.titre && this.newCampagne.dateOuverture && this.newCampagne.dateFermeture) {
      this.inscriptionService.createCampagne(this.newCampagne as Campagne).subscribe({
        next: () => {
          this.loadCampagnes();
          this.closeModal();
          this.newCampagne = {
            titre: '',
            anneeUniversitaire: this.getCurrentAcademicYear(),
            dateOuverture: new Date(),
            dateFermeture: new Date(),
            active: false
          };
        }
      });
    }
  }
}
