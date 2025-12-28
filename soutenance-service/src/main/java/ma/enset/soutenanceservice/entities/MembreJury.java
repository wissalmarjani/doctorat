package ma.enset.soutenanceservice.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.enset.soutenanceservice.enums.RoleJury;

@Entity
@Table(name = "membres_jury")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MembreJury {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ CRUCIAL : @JsonIgnore empêche la boucle infinie
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soutenance_id", nullable = false)
    @JsonIgnore
    private Soutenance soutenance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleJury role;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false)
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Column(nullable = false)
    private String prenom;

    @Email(message = "Email invalide")
    @NotBlank(message = "L'email est obligatoire")
    @Column(nullable = false)
    private String email;

    // ✅ CORRECTION : On retire nullable=false pour éviter les crashs si l'info manque
    private String etablissement;

    // ✅ CORRECTION : On retire nullable=false
    private String grade;

    @Column(length = 500)
    private String specialite;

    @Column(name = "rapport_soumis")
    private Boolean rapportSoumis = false;

    @Column(name = "avis_favorable")
    private Boolean avisFavorable;

    @Column(name = "commentaire_rapport", length = 2000)
    private String commentaireRapport;
}