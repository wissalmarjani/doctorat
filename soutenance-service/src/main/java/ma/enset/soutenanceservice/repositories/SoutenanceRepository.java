package ma.enset.soutenanceservice.repositories;

import ma.enset.soutenanceservice.entities.Soutenance;
import ma.enset.soutenanceservice.enums.StatutSoutenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SoutenanceRepository extends JpaRepository<Soutenance, Long> {

    List<Soutenance> findByDoctorantId(Long doctorantId);

    List<Soutenance> findByDirecteurId(Long directeurId);

    List<Soutenance> findByStatut(StatutSoutenance statut);

    Optional<Soutenance> findByDoctorantIdAndStatut(Long doctorantId, StatutSoutenance statut);
}