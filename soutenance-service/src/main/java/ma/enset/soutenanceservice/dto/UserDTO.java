package ma.enset.soutenanceservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour récupérer les informations utilisateur depuis user-service via OpenFeign
 * ✅ IMPORTANT: Les champs doivent EXACTEMENT correspondre à ceux retournés par UserController
 *
 * Basé sur le UserDTO du user-service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;

    // ✅ ATTENTION: Le user-service utilise "username" pour le matricule
    private String username;  // Matricule

    private String email;
    private String nom;
    private String prenom;
    private String telephone;
    private String role;
    private Boolean enabled;

    // Documents
    private String cv;
    private String diplome;
    private String lettreMotivation;

    // Workflow
    private String etat;
    private String motifRefus;

    // Directeur assigné
    private Long directeurId;

    // ✅ Sujet de thèse (assigné par le directeur)
    private String titreThese;

    // ✅ Suivi doctorant - PRÉREQUIS
    private String dateInscription;
    private Integer anneeThese;
    private Integer nbPublications;    // Nombre de publications Q1/Q2
    private Integer nbConferences;     // Nombre de conférences
    private Integer heuresFormation;   // Heures de formation cumulées

    // Timestamps
    private String createdAt;
    private String updatedAt;

    // =====================================================
    // MÉTHODES HELPER
    // =====================================================

    /**
     * Vérifier si les prérequis sont valides pour soutenir
     */
    public boolean hasValidPrerequisites() {
        return getPublicationsCount() >= 2 &&
                getConferencesCount() >= 2 &&
                getHeuresFormationCount() >= 200;
    }

    public int getPublicationsCount() {
        return nbPublications != null ? nbPublications : 0;
    }

    public int getConferencesCount() {
        return nbConferences != null ? nbConferences : 0;
    }

    public int getHeuresFormationCount() {
        return heuresFormation != null ? heuresFormation : 0;
    }

    /**
     * Obtenir le nom complet
     */
    public String getFullName() {
        return (prenom != null ? prenom : "") + " " + (nom != null ? nom : "");
    }
}