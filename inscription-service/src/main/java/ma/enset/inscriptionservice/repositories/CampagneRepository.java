package ma.enset.inscriptionservice.repositories;

import ma.enset.inscriptionservice.entities.Campagne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CampagneRepository extends JpaRepository<Campagne, Long> {

    Optional<Campagne> findByActiveTrue();

    Optional<Campagne> findByAnneeUniversitaire(String anneeUniversitaire);
}