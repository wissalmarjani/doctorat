package ma.enset.userservice.mappers;

import ma.enset.userservice.dto.UserDTO;
import ma.enset.userservice.entities.User;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

/**
 * Mapper pour convertir User ↔ UserDTO
 * ✅ IMPORTANT: Tous les champs doivent être mappés, surtout les prérequis
 */
@Component
public class UserMapper {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Convertir User (Entity) → UserDTO
     */
    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        return UserDTO.builder()
                // Identifiants
                .id(user.getId())
                .username(user.getMatricule())  // ✅ matricule → username
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .telephone(user.getTelephone())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .enabled(user.getEnabled())

                // Documents
                .cv(user.getCv())
                .diplome(user.getDiplome())
                .lettreMotivation(user.getLettreMotivation())

                // Workflow
                .etat(user.getEtat())
                .motifRefus(user.getMotifRefus())
                .directeurId(user.getDirecteurId())

                // ✅ Sujet de thèse
                .titreThese(user.getTitreThese())

                // ✅ PRÉREQUIS - Suivi doctorant (TRÈS IMPORTANT)
                .dateInscription(user.getDateInscription() != null
                        ? user.getDateInscription().format(DATE_FORMATTER) : null)
                .anneeThese(user.getAnneeThese())
                .nbPublications(user.getNbPublications())      // ✅ Doit être mappé
                .nbConferences(user.getNbConferences())        // ✅ Doit être mappé
                .heuresFormation(user.getHeuresFormation())    // ✅ Doit être mappé

                // Timestamps
                .createdAt(user.getCreatedAt() != null
                        ? user.getCreatedAt().format(DATE_FORMATTER) : null)
                .updatedAt(user.getUpdatedAt() != null
                        ? user.getUpdatedAt().format(DATE_FORMATTER) : null)

                .build();
    }

    /**
     * Convertir UserDTO → User (Entity)
     * Note: Ne convertit que les champs modifiables
     */
    public User toEntity(UserDTO dto) {
        if (dto == null) {
            return null;
        }

        User user = new User();
        user.setId(dto.getId());
        user.setMatricule(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setTelephone(dto.getTelephone());
        user.setEnabled(dto.getEnabled());

        // Documents
        user.setCv(dto.getCv());
        user.setDiplome(dto.getDiplome());
        user.setLettreMotivation(dto.getLettreMotivation());

        // Workflow
        user.setEtat(dto.getEtat());
        user.setMotifRefus(dto.getMotifRefus());
        user.setDirecteurId(dto.getDirecteurId());

        // Sujet de thèse
        user.setTitreThese(dto.getTitreThese());

        // Suivi doctorant
        user.setAnneeThese(dto.getAnneeThese());
        user.setNbPublications(dto.getNbPublications());
        user.setNbConferences(dto.getNbConferences());
        user.setHeuresFormation(dto.getHeuresFormation());

        return user;
    }

    /**
     * Mettre à jour une entité existante avec les données du DTO
     */
    public void updateEntityFromDTO(UserDTO dto, User user) {
        if (dto == null || user == null) {
            return;
        }

        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getNom() != null) user.setNom(dto.getNom());
        if (dto.getPrenom() != null) user.setPrenom(dto.getPrenom());
        if (dto.getTelephone() != null) user.setTelephone(dto.getTelephone());

        // Documents
        if (dto.getCv() != null) user.setCv(dto.getCv());
        if (dto.getDiplome() != null) user.setDiplome(dto.getDiplome());
        if (dto.getLettreMotivation() != null) user.setLettreMotivation(dto.getLettreMotivation());

        // Workflow
        if (dto.getEtat() != null) user.setEtat(dto.getEtat());
        if (dto.getMotifRefus() != null) user.setMotifRefus(dto.getMotifRefus());
        if (dto.getDirecteurId() != null) user.setDirecteurId(dto.getDirecteurId());

        // Sujet de thèse
        if (dto.getTitreThese() != null) user.setTitreThese(dto.getTitreThese());

        // ✅ Suivi doctorant - PRÉREQUIS
        if (dto.getAnneeThese() != null) user.setAnneeThese(dto.getAnneeThese());
        if (dto.getNbPublications() != null) user.setNbPublications(dto.getNbPublications());
        if (dto.getNbConferences() != null) user.setNbConferences(dto.getNbConferences());
        if (dto.getHeuresFormation() != null) user.setHeuresFormation(dto.getHeuresFormation());
    }
}