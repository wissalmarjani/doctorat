package ma.enset.soutenanceservice.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.enset.soutenanceservice.enums.RoleJury;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entité représentant un membre de jury disponible pour sélection.
 * Ces membres peuvent être sélectionnés par le directeur lors de la proposition du jury.
 */
@Entity
@Table(name = "jurys_disponibles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JuryDisponible {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    private String etablissement;

    private String grade;

    @Column(length = 500)
    private String specialite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleJury role;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}