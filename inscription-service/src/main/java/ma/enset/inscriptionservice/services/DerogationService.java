package ma.enset.inscriptionservice.services;

import ma.enset.inscriptionservice.entities.Derogation;
import ma.enset.inscriptionservice.enums.StatutDerogation;
import ma.enset.inscriptionservice.enums.TypeDerogation;

import java.util.List;
import java.util.Optional;

public interface DerogationService {

    // ========================================================
    // DOCTORANT
    // ========================================================

    /**
     * Crée une demande de dérogation (statut: EN_ATTENTE_DIRECTEUR)
     */
    Derogation demanderDerogation(Long doctorantId, Long directeurId, TypeDerogation type, String motif);

    /**
     * Récupère toutes les dérogations d'un doctorant
     */
    List<Derogation> getDerogationsByDoctorant(Long doctorantId);

    // ========================================================
    // DIRECTEUR
    // ========================================================

    /**
     * Récupère les dérogations en attente pour un directeur
     */
    List<Derogation> getDerogationsEnAttenteDirecteur(Long directeurId);

    /**
     * Le directeur valide une dérogation (passe à EN_ATTENTE_ADMIN)
     */
    Derogation validerParDirecteur(Long derogationId, Long directeurId, String commentaire);

    /**
     * Le directeur refuse une dérogation
     */
    Derogation refuserParDirecteur(Long derogationId, Long directeurId, String commentaire);

    // ========================================================
    // ADMIN
    // ========================================================

    /**
     * Récupère les dérogations en attente de validation admin
     */
    List<Derogation> getDerogationsEnAttenteAdmin();

    /**
     * L'admin approuve une dérogation
     */
    Derogation approuverDerogation(Long derogationId, Long decideurId, String commentaire);

    /**
     * L'admin refuse une dérogation
     */
    Derogation refuserDerogation(Long derogationId, Long decideurId, String commentaire);

    // ========================================================
    // COMMUN
    // ========================================================

    /**
     * Récupère une dérogation par ID
     */
    Optional<Derogation> getDerogationById(Long id);

    /**
     * Récupère toutes les dérogations en attente (tous statuts d'attente)
     */
    List<Derogation> getDerogationsEnAttente();

    /**
     * Vérifie si le doctorant a une dérogation valide pour l'année demandée
     */
    boolean hasDerogationValide(Long doctorantId, int annee);

    /**
     * Récupère toutes les dérogations par statut
     */
    List<Derogation> getDerogationsByStatut(StatutDerogation statut);

    /**
     * Récupère toutes les dérogations
     */
    List<Derogation> getAllDerogations();
}