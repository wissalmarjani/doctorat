import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../../services/document.service';
import { DocumentMetadata } from '../../../models/document.model';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  documents: DocumentMetadata[] = [];
  loading = true;

  constructor(private documentService: DocumentService) { }

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.documentService.getAll().subscribe({
      next: (data) => {
        this.documents = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  download(doc: DocumentMetadata): void {
    if (doc.id) {
      this.documentService.download(doc.id).subscribe();
    }
  }

  delete(id: number): void {
    if (confirm('Supprimer ce document ?')) {
      this.documentService.delete(id).subscribe({
        next: () => this.loadDocuments()
      });
    }
  }
}
