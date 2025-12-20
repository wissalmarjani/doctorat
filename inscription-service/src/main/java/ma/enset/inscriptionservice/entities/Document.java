package ma.enset.inscriptionservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.enset.inscriptionservice.enums.TypeDocument;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "inscription_id", nullable = false)
    private Inscription inscription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeDocument typeDocument;

    @NotBlank(message = "Le nom du fichier est obligatoire")
    @Column(name = "nom_fichier", nullable = false)
    private String nomFichier;

    @Column(name = "chemin_fichier", nullable = false)
    private String cheminFichier;

    @Column(name = "taille_fichier")
    private Long tailleFichier; // en bytes

    @Column(name = "content_type")
    private String contentType; // application/pdf, image/jpeg, etc.

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}