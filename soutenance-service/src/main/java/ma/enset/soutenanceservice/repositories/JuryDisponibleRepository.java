package ma.enset.soutenanceservice.repositories;

import ma.enset.soutenanceservice.entities.JuryDisponible;
import ma.enset.soutenanceservice.enums.RoleJury;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JuryDisponibleRepository extends JpaRepository<JuryDisponible, Long> {

    /**
     * Trouver tous les jurys disponibles par rôle
     */
    List<JuryDisponible> findByRole(RoleJury role);

    /**
     * Trouver un jury par email
     */
    JuryDisponible findByEmail(String email);

    /**
     * Vérifier si un email existe déjà
     */
    boolean existsByEmail(String email);
}