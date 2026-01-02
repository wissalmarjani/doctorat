import { Component } from '@angular/core';
import { DocumentService } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-doctorant-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent {
  loading = false;

  constructor(
    private documentService: DocumentService,
    private authService: AuthService
  ) { }

  downloadAttestation(): void {
    const user = this.authService.currentUserValue;
    if (user?.id) {
      this.loading = true;
      this.documentService.generateInscriptionAttestation(user.id).subscribe({
        next: () => this.loading = false,
        error: () => this.loading = false
      });
    }
  }

  downloadReleve(): void {
    alert('Bientôt disponible');
  }
}
