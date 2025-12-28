package ma.enset.soutenanceservice.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // ✅ IMPORTANT
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
// On retire NotNull pour directeurId car il peut être vide au début
// import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.enset.soutenanceservice.dto.UserDTO;
import ma.enset.soutenanceservice.enums.StatutSoutenance;
import ma.enset.soutenanceservice.enums.RoleJury;

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

    @Column(name = "doctorant_id", nullable = false)
    private Long doctorantId;

    // ✅ CORRECTION : On autorise le NULL ici pour la soumission initiale
    @Column(name = "directeur_id")
    private Long directeurId;

    // =======================================================
    // Champs NON persistés
    // =======================================================
    @Transient
    private UserDTO doctorantInfo;

    @Transient
    private UserDTO directeurInfo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutSoutenance statut = StatutSoutenance.BROUILLON;

    @NotBlank(message = "Le titre de la thèse est obligatoire")
    @Column(name = "titre_these", nullable = false, length = 500)
    private String titreThese;

    @Column(length = 2000)
    private String resume;

    @Column(name = "mots_cles", length = 500)
    private String motsCles;

    @Embedded
    private Prerequis prerequis = new Prerequis();

    @Column(name = "chemin_manuscrit")
    private String cheminManuscrit;

    @Column(name = "chemin_rapport_anti_plagiat")
    private String cheminRapportAntiPlagiat;

    @Column(name = "chemin_rapport_publications")
    private String cheminRapportPublications;

    @Column(name = "chemin_autorisation")
    private String cheminAutorisation;

    // ✅ CORRECTION : Protection supplémentaire contre la boucle JSON
    @OneToMany(mappedBy = "soutenance", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("soutenance")
    private List<MembreJury> membresJury = new ArrayList<>();

    @Column(name = "date_soutenance")
    private LocalDate dateSoutenance;

    @Column(name = "heure_soutenance")
    private LocalTime heureSoutenance;

    @Column(name = "lieu_soutenance")
    private String lieuSoutenance;

    @Column(name = "note_finale")
    private Double noteFinale;

    @Column(name = "mention")
    private String mention;

    @Column(name = "felicitations_jury")
    private Boolean felicitationsJury = false;

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
        if (membresJury == null || membresJury.isEmpty()) return false;
        long nbPresidents = membresJury.stream().filter(m -> m.getRole() == RoleJury.PRESIDENT).count();
        long nbRapporteurs = membresJury.stream().filter(m -> m.getRole() == RoleJury.RAPPORTEUR).count();
        return nbPresidents >= 1 && nbRapporteurs >= 2;
    }

    public boolean tousLesRapportsRecus() {
        if (membresJury == null || membresJury.isEmpty()) return false;
        return membresJury.stream().filter(m -> m.getRole() == RoleJury.RAPPORTEUR).allMatch(m -> Boolean.TRUE.equals(m.getRapportSoumis()));
    }

    public boolean tousLesRapportsFavorables() {
        if (membresJury == null || membresJury.isEmpty()) return false;
        return membresJury.stream().filter(m -> m.getRole() == RoleJury.RAPPORTEUR).allMatch(m -> Boolean.TRUE.equals(m.getAvisFavorable()));
    }
}