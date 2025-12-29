package ma.enset.inscriptionservice.repositories;

import ma.enset.inscriptionservice.entities.Inscription;
import ma.enset.inscriptionservice.enums.StatutInscription;
import ma.enset.inscriptionservice.enums.TypeInscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InscriptionRepository extends JpaRepository<Inscription, Long> {

    // Par doctorant
    List<Inscription> findByDoctorantIdOrderByCreatedAtDesc(Long doctorantId);
    List<Inscription> findByDoctorantId(Long doctorantId);

    // Par directeur
    List<Inscription> findByDirecteurIdOrderByCreatedAtDesc(Long directeurId);
    List<Inscription> findByDirecteurId(Long directeurId);

    // Par statut
    List<Inscription> findByStatut(StatutInscription statut);

    // Par campagne
    List<Inscription> findByCampagneId(Long campagneId);

    // Par type
    List<Inscription> findByTypeInscription(TypeInscription type);

    // Combinaisons pour le workflow
    List<Inscription> findByDirecteurIdAndTypeInscriptionAndStatut(
            Long directeurId,
            TypeInscription type,
            StatutInscription statut
    );

    List<Inscription> findByTypeInscriptionAndStatut(
            TypeInscription type,
            StatutInscription statut
    );

    // Pour directeur - toutes les inscriptions en attente de validation
    List<Inscription> findByDirecteurIdAndStatut(Long directeurId, StatutInscription statut);
}