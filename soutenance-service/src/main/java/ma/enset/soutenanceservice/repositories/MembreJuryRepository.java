package ma.enset.soutenanceservice.repositories;

import ma.enset.soutenanceservice.entities.MembreJury;
import ma.enset.soutenanceservice.enums.RoleJury;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembreJuryRepository extends JpaRepository<MembreJury, Long> {

    /**
     * Trouver les membres du jury par soutenance
     */
    List<MembreJury> findBySoutenanceId(Long soutenanceId);

    /**
     * Trouver tous les membres du jury disponibles (non assignés à une soutenance)
     * Ces membres ont soutenance_id = NULL dans la base de données
     */
    List<MembreJury> findBySoutenanceIsNull();

    /**
     * Trouver les membres du jury disponibles par rôle
     * @param role - PRESIDENT, RAPPORTEUR, EXAMINATEUR, INVITE
     */
    List<MembreJury> findBySoutenanceIsNullAndRole(RoleJury role);

    /**
     * Trouver les membres du jury par rôle (tous)
     */
    List<MembreJury> findByRole(RoleJury role);
}