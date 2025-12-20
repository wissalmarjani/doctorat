package ma.enset.inscriptionservice.repositories;

import ma.enset.inscriptionservice.entities.Inscription;
import ma.enset.inscriptionservice.enums.StatutInscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InscriptionRepository extends JpaRepository<Inscription, Long> {

    List<Inscription> findByDoctorantId(Long doctorantId);

    List<Inscription> findByDirecteurId(Long directeurId);

    List<Inscription> findByStatut(StatutInscription statut);

    List<Inscription> findByCampagneId(Long campagneId);
}