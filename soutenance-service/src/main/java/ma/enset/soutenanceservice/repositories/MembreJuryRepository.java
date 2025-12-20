package ma.enset.soutenanceservice.repositories;

import ma.enset.soutenanceservice.entities.MembreJury;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembreJuryRepository extends JpaRepository<MembreJury, Long> {

    List<MembreJury> findBySoutenanceId(Long soutenanceId);
}