package ma.enset.inscriptionservice.services;

import ma.enset.inscriptionservice.entities.Derogation;
import ma.enset.inscriptionservice.enums.StatutDerogation;
import ma.enset.inscriptionservice.enums.TypeDerogation;

import java.util.List;
import java.util.Optional;

public interface DerogationService {

    /**
     * Crée une demande de dérogation
     */
    Derogation demanderDerogation(Long doctorantId, TypeDerogation type, String motif);

    /**
     * Approuve une dérogation
     */
    Derogation approuverDerogation(Long derogationId, Long decideurId, String commentaire);

    /**
     * Refuse une dérogation
     */
    Derogation refuserDerogation(Long derogationId, Long decideurId, String commentaire);

    /**
     * Récupère une dérogation par ID
     */
    Optional<Derogation> getDerogationById(Long id);

    /**
     * Récupère toutes les dérogations d'un doctorant
     */
    List<Derogation> getDerogationsByDoctorant(Long doctorantId);

    /**
     * Récupère toutes les dérogations en attente
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
}
