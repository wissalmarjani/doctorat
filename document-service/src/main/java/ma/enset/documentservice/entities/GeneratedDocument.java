package ma.enset.documentservice.entities;

import jakarta.persistence.*;
import lombok.*;
import ma.enset.documentservice.enums.DocumentType;

import java.time.LocalDateTime;

@Entity
@Table(name = "generated_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneratedDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    // Référence vers l'entité concernée
    private Long referenceId;

    private String referenceType; // "INSCRIPTION", "SOUTENANCE", "USER"

    // Informations du bénéficiaire
    private Long userId;

    private String userName;

    private String userEmail;

    // Métadonnées
    @Column(columnDefinition = "TEXT")
    private String metadata;

    private Long fileSize;

    @Column(nullable = false)
    private LocalDateTime generatedAt;

    private LocalDateTime downloadedAt;

    private int downloadCount;

    // Validité du document
    private LocalDateTime validUntil;

    private boolean isValid;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
        isValid = true;
        downloadCount = 0;
    }
}
