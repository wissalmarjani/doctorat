package ma.enset.inscriptionservice.repositories;

import ma.enset.inscriptionservice.entities.Derogation;
import ma.enset.inscriptionservice.enums.StatutDerogation;
import ma.enset.inscriptionservice.enums.TypeDerogation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DerogationRepository extends JpaRepository<Derogation, Long> {

    /**
     * Trouve toutes les dérogations d'un doctorant
     */
    List<Derogation> findByDoctorantIdOrderByDateDemandeDesc(Long doctorantId);

    /**
     * Trouve les dérogations par statut
     */
    List<Derogation> findByStatut(StatutDerogation statut);

    /**
     * Trouve les dérogations en attente
     */
    List<Derogation> findByStatutOrderByDateDemandeAsc(StatutDerogation statut);

    /**
     * Vérifie si une dérogation approuvée existe pour un doctorant et une année
     */
    @Query("SELECT d FROM Derogation d WHERE d.doctorantId = :doctorantId " +
           "AND d.anneeDemandee = :annee AND d.statut = 'APPROUVEE' " +
           "AND (d.dateExpiration IS NULL OR d.dateExpiration >= CURRENT_DATE)")
    Optional<Derogation> findDerogationValide(@Param("doctorantId") Long doctorantId, 
                                               @Param("annee") Integer annee);

    /**
     * Vérifie si le doctorant a une dérogation approuvée et valide
     */
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Derogation d " +
           "WHERE d.doctorantId = :doctorantId AND d.statut = 'APPROUVEE' " +
           "AND d.anneeDemandee >= :annee " +
           "AND (d.dateExpiration IS NULL OR d.dateExpiration >= CURRENT_DATE)")
    boolean hasDerogationValide(@Param("doctorantId") Long doctorantId, @Param("annee") Integer annee);

    /**
     * Trouve la dernière dérogation approuvée d'un doctorant
     */
    @Query("SELECT d FROM Derogation d WHERE d.doctorantId = :doctorantId " +
           "AND d.statut = 'APPROUVEE' ORDER BY d.anneeDemandee DESC")
    List<Derogation> findDernieresDerogationsApprouvees(@Param("doctorantId") Long doctorantId);

    /**
     * Compte les dérogations en attente (pour dashboard admin)
     */
    long countByStatut(StatutDerogation statut);
}
