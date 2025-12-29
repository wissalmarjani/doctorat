package ma.enset.inscriptionservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.enset.inscriptionservice.enums.StatutDerogation;
import ma.enset.inscriptionservice.enums.TypeDerogation;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "derogations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Derogation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "L'ID du doctorant est obligatoire")
    @Column(name = "doctorant_id", nullable = false)
    private Long doctorantId;

    // ID du directeur de thèse (pour le workflow)
    @Column(name = "directeur_id")
    private Long directeurId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inscription_id")
    private Inscription inscription;

    @NotNull(message = "Le type de dérogation est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(name = "type_derogation", nullable = false)
    private TypeDerogation typeDerogation;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutDerogation statut = StatutDerogation.EN_ATTENTE_DIRECTEUR;

    @NotBlank(message = "Le motif est obligatoire")
    @Column(nullable = false, length = 2000)
    private String motif;

    @Column(name = "annee_demandee")
    private Integer anneeDemandee;

    // ========== DATES ==========

    @Column(name = "date_demande", nullable = false)
    private LocalDateTime dateDemande;

    // Validation par le directeur
    @Column(name = "date_validation_directeur")
    private LocalDateTime dateValidationDirecteur;

    @Column(name = "commentaire_directeur", length = 1000)
    private String commentaireDirecteur;

    @Column(name = "valide_par_directeur")
    private Boolean valideParDirecteur;

    // Décision finale par admin
    @Column(name = "date_decision")
    private LocalDateTime dateDecision;

    @Column(name = "decide_par")
    private Long decideParId;

    @Column(name = "commentaire_decision", length = 1000)
    private String commentaireDecision;

    @Column(name = "date_expiration")
    private LocalDate dateExpiration;

    // ========== TIMESTAMPS ==========

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ========== TRANSIENT (non persisté, pour enrichissement) ==========

    @Transient
    private String doctorantNom;

    @Transient
    private String doctorantPrenom;

    @Transient
    private String doctorantEmail;

    @Transient
    private String directeurNom;

    @Transient
    private String directeurPrenom;

    // ========== LIFECYCLE ==========

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (dateDemande == null) {
            dateDemande = LocalDateTime.now();
        }
        if (statut == null) {
            statut = StatutDerogation.EN_ATTENTE_DIRECTEUR;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ========== MÉTHODES UTILITAIRES ==========

    public boolean estValide() {
        if (statut != StatutDerogation.APPROUVEE) {
            return false;
        }
        if (dateExpiration == null) {
            return true;
        }
        return LocalDate.now().isBefore(dateExpiration) || LocalDate.now().isEqual(dateExpiration);
    }

    public boolean estEnAttenteDirecteur() {
        return statut == StatutDerogation.EN_ATTENTE_DIRECTEUR;
    }

    public boolean estEnAttenteAdmin() {
        return statut == StatutDerogation.EN_ATTENTE_ADMIN;
    }

    public boolean estEnAttente() {
        return statut == StatutDerogation.EN_ATTENTE_DIRECTEUR
                || statut == StatutDerogation.EN_ATTENTE_ADMIN
                || statut == StatutDerogation.EN_ATTENTE;
    }

    public boolean estTraitee() {
        return statut == StatutDerogation.APPROUVEE || statut == StatutDerogation.REFUSEE;
    }

    /**
     * Retourne l'étape actuelle dans le workflow (1, 2 ou 3)
     */
    public int getEtapeWorkflow() {
        return switch (statut) {
            case EN_ATTENTE_DIRECTEUR, EN_ATTENTE -> 1;
            case EN_ATTENTE_ADMIN -> 2;
            case APPROUVEE, REFUSEE, EXPIREE, ANNULEE -> 3;
        };
    }
}