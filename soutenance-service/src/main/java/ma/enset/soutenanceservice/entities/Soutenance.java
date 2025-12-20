package ma.enset.soutenanceservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.enset.soutenanceservice.enums.StatutSoutenance;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "soutenances")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Soutenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Référence au doctorant (User Service)
    @NotNull(message = "L'ID du doctorant est obligatoire")
    @Column(name = "doctorant_id", nullable = false)
    private Long doctorantId;

    // Référence au directeur de thèse (User Service)
    @NotNull(message = "L'ID du directeur est obligatoire")
    @Column(name = "directeur_id", nullable = false)
    private Long directeurId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutSoutenance statut = StatutSoutenance.BROUILLON;

    // Informations sur la thèse
    @NotBlank(message = "Le titre de la thèse est obligatoire")
    @Column(name = "titre_these", nullable = false, length = 500)
    private String titreThese;

    @Column(length = 2000)
    private String resume;

    @Column(name = "mots_cles", length = 500)
    private String motsCles;

    // Prérequis
    @Embedded
    private Prerequis prerequis = new Prerequis();

    // Documents
    @Column(name = "chemin_manuscrit")
    private String cheminManuscrit;

    @Column(name = "chemin_rapport_anti_plagiat")
    private String cheminRapportAntiPlagiat;

    @Column(name = "chemin_rapport_publications")
    private String cheminRapportPublications;

    @Column(name = "chemin_autorisation")
    private String cheminAutorisation;

    // Jury
    @OneToMany(mappedBy = "soutenance", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MembreJury> membresJury = new ArrayList<>();

    // Planification
    @Column(name = "date_soutenance")
    private LocalDate dateSoutenance;

    @Column(name = "heure_soutenance")
    private LocalTime heureSoutenance;

    @Column(name = "lieu_soutenance")
    private String lieuSoutenance;

    // Résultat
    @Column(name = "note_finale")
    private Double noteFinale;

    @Column(name = "mention")
    private String mention; // Très Honorable, Honorable, etc.

    @Column(name = "felicitations_jury")
    private Boolean felicitationsJury = false;

    // Commentaires et validations
    @Column(name = "commentaire_directeur", length = 2000)
    private String commentaireDirecteur;

    @Column(name = "commentaire_admin", length = 2000)
    private String commentaireAdmin;

    @Column(name = "date_autorisation")
    private LocalDateTime dateAutorisation;

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

    // Méthodes utilitaires
    public boolean prerequisSontValides() {
        return prerequis != null && prerequis.verifierPrerequisMinimaux();
    }

    public boolean juryEstComplet() {
        if (membresJury == null || membresJury.isEmpty()) {
            return false;
        }

        // Vérifier qu'on a au moins 1 président, 2 rapporteurs
        long nbPresidents = membresJury.stream()
                .filter(m -> m.getRole() == ma.enset.soutenanceservice.enums.RoleJury.PRESIDENT)
                .count();

        long nbRapporteurs = membresJury.stream()
                .filter(m -> m.getRole() == ma.enset.soutenanceservice.enums.RoleJury.RAPPORTEUR)
                .count();

        return nbPresidents >= 1 && nbRapporteurs >= 2;
    }

    public boolean tousLesRapportsRecus() {
        if (membresJury == null || membresJury.isEmpty()) {
            return false;
        }

        return membresJury.stream()
                .filter(m -> m.getRole() == ma.enset.soutenanceservice.enums.RoleJury.RAPPORTEUR)
                .allMatch(m -> Boolean.TRUE.equals(m.getRapportSoumis()));
    }

    public boolean tousLesRapportsFavorables() {
        if (membresJury == null || membresJury.isEmpty()) {
            return false;
        }

        return membresJury.stream()
                .filter(m -> m.getRole() == ma.enset.soutenanceservice.enums.RoleJury.RAPPORTEUR)
                .allMatch(m -> Boolean.TRUE.equals(m.getAvisFavorable()));
    }
}