import { Component, OnInit } from '@angular/core';
import { SoutenanceService } from '../../../services/soutenance.service';
import { AuthService } from '../../../services/auth.service';
import { Soutenance } from '../../../models/soutenance.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-soutenance',
  templateUrl: './soutenance.component.html',
  styleUrls: ['./soutenance.component.css']
})
export class SoutenanceComponent implements OnInit {
  soutenances: Soutenance[] = [];
  loading = true;
  showRequestModal = false;
  requestForm!: FormGroup;
  files: { [key: string]: File } = {};

  constructor(
    private soutenanceService: SoutenanceService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.requestForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.loadSoutenances();
  }

  loadSoutenances(): void {
    const user = this.authService.currentUserValue;
    if (user?.id) {
      this.loading = true;
      this.soutenanceService.getByDoctorant(user.id).subscribe({
        next: (data) => {
          this.soutenances = data;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  onFileChange(event: any, type: string): void {
    if (event.target.files.length > 0) {
      this.files[type] = event.target.files[0];
    }
  }

  openRequestModal(): void {
    this.showRequestModal = true;
    this.requestForm.reset();
    this.files = {};
  }

  closeModal(): void {
    this.showRequestModal = false;
  }

  submitRequest(): void {
    if (this.requestForm.invalid || !this.files['manuscrit'] || !this.files['rapportAntiPlagiat']) {
      return;
    }

    const user = this.authService.currentUserValue;
    if (user?.id) {
      this.loading = true;
      this.soutenanceService.soumettreDemande(
        this.requestForm.value.titre,
        user.id,
        user.directeurId || 0, // Fallback to 0 if not assigned, backend should handle or error
        this.files['manuscrit'],
        this.files['rapportAntiPlagiat'],
        this.files['autorisation']
      ).subscribe({
        next: () => {
          this.loadSoutenances();
          this.closeModal();
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          alert('Erreur lors de la soumission de la demande.');
        }
      });
    }
  }

  getStatusBadge(statut: string): { class: string; text: string } {
    const statusMap: { [key: string]: { class: string; text: string } } = {
      'SOUMIS': { class: 'badge-primary', text: 'Soumis' },
      'EN_ATTENTE_DIRECTEUR': { class: 'badge-warning', text: 'Attente Directeur' },
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
