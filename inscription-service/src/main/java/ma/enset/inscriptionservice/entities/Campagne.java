package ma.enset.inscriptionservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "campagnes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Campagne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    @Column(nullable = false)
    private String titre;

    @NotBlank(message = "L'année universitaire est obligatoire")
    @Column(name = "annee_universitaire", nullable = false)
    private String anneeUniversitaire; // Ex: "2024-2025"

    @NotNull(message = "La date d'ouverture est obligatoire")
    @Column(name = "date_ouverture", nullable = false)
    private LocalDate dateOuverture;

    @NotNull(message = "La date de fermeture est obligatoire")
    @Column(name = "date_fermeture", nullable = false)
    private LocalDate dateFermeture;

    @Column(nullable = false)
    private Boolean active = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Méthode pour vérifier si la campagne est ouverte
    public boolean isOuverte() {
        LocalDate today = LocalDate.now();
        return active &&
                !today.isBefore(dateOuverture) &&
                !today.isAfter(dateFermeture);
    }
}