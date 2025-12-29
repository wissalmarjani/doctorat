package ma.enset.inscriptionservice.repositories;

import ma.enset.inscriptionservice.entities.Derogation;
import ma.enset.inscriptionservice.enums.StatutDerogation;
import ma.enset.inscriptionservice.enums.TypeDerogation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DerogationRepository extends JpaRepository<Derogation, Long> {

    // ========== DOCTORANT ==========

    List<Derogation> findByDoctorantIdOrderByDateDemandeDesc(Long doctorantId);

    // ========== DIRECTEUR ==========

    List<Derogation> findByDirecteurIdAndStatut(Long directeurId, StatutDerogation statut);

    List<Derogation> findByDirecteurIdOrderByDateDemandeDesc(Long directeurId);

    /**
     * Récupérer toutes les dérogations pour un directeur
     */
    @Query("SELECT d FROM Derogation d WHERE d.directeurId = :directeurId ORDER BY d.dateDemande DESC")
    List<Derogation> findAllByDirecteurId(@Param("directeurId") Long directeurId);

    // ========== ADMIN ==========

    List<Derogation> findByStatutOrderByDateDemandeAsc(StatutDerogation statut);

    List<Derogation> findByStatut(StatutDerogation statut);

    List<Derogation> findByStatutIn(List<StatutDerogation> statuts);

    // ========== VÉRIFICATIONS ==========

    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Derogation d " +
            "WHERE d.doctorantId = :doctorantId " +
            "AND d.anneeDemandee = :annee " +
            "AND d.statut = :statut " +
            "AND (d.dateExpiration IS NULL OR d.dateExpiration >= CURRENT_DATE)")
    boolean hasDerogationValideByStatut(@Param("doctorantId") Long doctorantId,
                                        @Param("annee") int annee,
                                        @Param("statut") StatutDerogation statut);

    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Derogation d " +
            "WHERE d.doctorantId = :doctorantId " +
            "AND d.typeDerogation = :type " +
            "AND d.statut IN :statuts")
    boolean hasDerogationEnCoursByStatuts(@Param("doctorantId") Long doctorantId,
                                          @Param("type") TypeDerogation type,
                                          @Param("statuts") List<StatutDerogation> statuts);

    // Méthodes simplifiées qui utilisent les méthodes ci-dessus
    default boolean hasDerogationValide(Long doctorantId, int annee) {
        return hasDerogationValideByStatut(doctorantId, annee, StatutDerogation.APPROUVEE);
    }

    default boolean hasDerogationEnCours(Long doctorantId, TypeDerogation type) {
        return hasDerogationEnCoursByStatuts(doctorantId, type,
                List.of(StatutDerogation.EN_ATTENTE_DIRECTEUR, StatutDerogation.EN_ATTENTE_ADMIN, StatutDerogation.EN_ATTENTE));
    }
}