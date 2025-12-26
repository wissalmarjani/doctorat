import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from '@shared/components/main-layout/main-layout.component';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/user.model';

@Component({
    selector: 'app-my-students',
    standalone: true,
    imports: [CommonModule, MainLayoutComponent],
    template: `
    <app-main-layout>
      <div class="page-container p-4">
        
        <div class="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 class="fw-bold text-dark mb-1">Mes Doctorants</h2>
            <p class="text-muted mb-0">Suivi académique et alertes de progression.</p>
          </div>
          <div class="badge bg-white text-dark border shadow-sm p-2">
            {{ students().length }} Actifs
          </div>
        </div>

        <!-- VUE CARTES (Style PDF Page 5) -->
        <div class="row g-4">
          @for (student of students(); track student.id) {
            <div class="col-md-6 col-xl-6">
              <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                
                <!-- En-tête Carte -->
                <div class="card-header bg-white p-4 border-bottom">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="d-flex align-items-center gap-3">
                      <div class="avatar-circle">{{ student.nom.charAt(0) }}</div>
                      <div>
                        <h5 class="fw-bold mb-0 text-dark">{{ student.nom }} {{ student.prenom }}</h5>
                        <small class="text-muted">Inscrit le : {{ student.createdAt | date:'dd/MM/yyyy' }}</small>
                      </div>
                    </div>
                    <!-- ALERTES (Page 5 du PDF) -->
                    @if (getAlertLevel(student) === 'RED') {
                      <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2">
                        <i class="bi bi-exclamation-triangle-fill me-1"></i> ALERTE DUREE
                      </span>
                    } @else if (getAlertLevel(student) === 'YELLOW') {
                      <span class="badge bg-warning-subtle text-warning-dark border border-warning-subtle px-3 py-2">
                        <i class="bi bi-clock-history me-1"></i> FIN DE CYCLE
                      </span>
                    } @else {
                      <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                        <i class="bi bi-check-circle me-1"></i> NORMAL
                      </span>
                    }
                  </div>
                </div>

                <div class="card-body p-4">
                  <!-- INFO ANNÉE -->
                  <div class="d-flex justify-content-between align-items-center mb-4">
                    <span class="fw-bold text-muted text-uppercase small">Progression Thèse</span>
                    <span class="fw-bold fs-5 text-dark">Année {{ student.anneeThese || 1 }}/6</span>
                  </div>
                  
                  <!-- PROGRESS BAR ANNUELLE -->
                  <div class="progress mb-4" style="height: 8px;">
                    <div class="progress-bar" 
                         [ngClass]="getProgressBarClass(student)"
                         role="progressbar" 
                         [style.width]="((student.anneeThese || 1) / 6 * 100) + '%'">
                    </div>
                  </div>

                  <hr class="border-light my-4">

                  <!-- PROGRESSION PREREQUIS (Page 5 PDF) -->
                  <h6 class="fw-bold text-primary mb-3 small text-uppercase">
                    <i class="bi bi-list-check me-2"></i>État des Prérequis
                  </h6>

                  <div class="vstack gap-3">
                    <!-- Publications -->
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="small">Publications (Q1/Q2)</span>
                      <div class="d-flex align-items-center gap-2">
                        <span class="fw-bold">{{ student.nbPublications || 0 }}/2</span>
                        <i class="bi" [ngClass]="(student.nbPublications || 0) >= 2 ? 'bi-check-circle-fill text-success' : 'bi-exclamation-circle text-warning'"></i>
                      </div>
                    </div>

                    <!-- Conférences -->
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="small">Conférences</span>
                      <div class="d-flex align-items-center gap-2">
                        <span class="fw-bold">{{ student.nbConferences || 0 }}/2</span>
                        <i class="bi" [ngClass]="(student.nbConferences || 0) >= 2 ? 'bi-check-circle-fill text-success' : 'bi-exclamation-circle text-warning'"></i>
                      </div>
                    </div>

                    <!-- Formation -->
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="small">Heures Formation</span>
                      <div class="d-flex align-items-center gap-2">
                        <span class="fw-bold">{{ student.heuresFormation || 0 }}/200h</span>
                        <i class="bi" [ngClass]="(student.heuresFormation || 0) >= 200 ? 'bi-check-circle-fill text-success' : 'bi-hourglass-split text-info'"></i>
                      </div>
                    </div>
                  </div>

                </div>

                <div class="card-footer bg-white p-3 border-top d-flex justify-content-between">
                  <button class="btn btn-sm btn-light text-primary fw-bold w-100 me-2">
                    <i class="bi bi-eye me-2"></i>Voir Détail
                  </button>
                  <button class="btn btn-sm btn-light text-dark fw-bold w-100">
                    <i class="bi bi-envelope me-2"></i>Contacter
                  </button>
                </div>

              </div>
            </div>
          }
          @if (students().length === 0) {
            <div class="col-12 text-center py-5">
              <div class="text-muted">Aucun doctorant assigné pour le moment.</div>
            </div>
          }
        </div>

      </div>
    </app-main-layout>
  `,
    styles: [`
    .avatar-circle { width: 48px; height: 48px; border-radius: 50%; background: #e0e7ff; color: #4338ca; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; }
    .bg-danger-subtle { background-color: #fef2f2; color: #b91c1c; }
    .bg-warning-subtle { background-color: #fffbeb; }
    .text-warning-dark { color: #b45309; }
    .bg-success-subtle { background-color: #f0fdf4; color: #15803d; }
  `]
})
export class MyStudentsComponent implements OnInit {
    students = signal<User[]>([]);

    constructor(private userService: UserService) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        // Dans un cas réel, ces données (année, publications) viendraient du backend
        // Pour l'instant, on récupère les users et on simulera des données si elles sont vides
        this.userService.getUsersByRole('DOCTORANT').subscribe({
            next: (data) => {
                // Simulation de données académiques pour correspondre au PDF si le backend renvoie null
                const enrichedData = data.map(u => ({
                    ...u,
                    anneeThese: u.anneeThese || Math.floor(Math.random() * 6) + 1, // Random 1-6
                    nbPublications: u.nbPublications || Math.floor(Math.random() * 3),
                    nbConferences: u.nbConferences || Math.floor(Math.random() * 3),
                    heuresFormation: u.heuresFormation || Math.floor(Math.random() * 250)
                }));
                this.students.set(enrichedData);
            },
            error: console.error
        });
    }

    // Logique d'alerte (PDF Page 5)
    getAlertLevel(student: User): 'RED' | 'YELLOW' | 'GREEN' {
        const annee = student.anneeThese || 1;
        if (annee >= 5) return 'RED';    // Année 5 ou 6
        if (annee === 3) return 'YELLOW'; // Fin de cycle normal
        return 'GREEN';
    }

    getProgressBarClass(student: User): string {
        const level = this.getAlertLevel(student);
        if (level === 'RED') return 'bg-danger';
        if (level === 'YELLOW') return 'bg-warning';
        return 'bg-success';
    }
}