package ma.enset.inscriptionservice.services;

import ma.enset.inscriptionservice.entities.Inscription;
import ma.enset.inscriptionservice.enums.StatutInscription;
import ma.enset.inscriptionservice.enums.TypeInscription;

import java.util.List;
import java.util.Optional;

public interface InscriptionService {

    // CRUD
    Inscription create(Inscription inscription);
    Inscription update(Long id, Inscription inscription);
    void delete(Long id);
    Optional<Inscription> getById(Long id);
    List<Inscription> getAll();

    // Requêtes spécifiques
    List<Inscription> getByDoctorant(Long doctorantId);
    List<Inscription> getByDirecteur(Long directeurId);
    List<Inscription> getByStatut(StatutInscription statut);
    List<Inscription> getByCampagne(Long campagneId);
    List<Inscription> getByTypeInscription(TypeInscription type);

    // Workflow - Soumission
    Inscription soumettre(Long id);

    // Workflow - Validation Directeur
    Inscription validerParDirecteur(Long id, String commentaire);
    Inscription rejeterParDirecteur(Long id, String motif);

    // Workflow - Validation Admin
    Inscription validerParAdmin(Long id, String commentaire);
    Inscription rejeterParAdmin(Long id, String motif);

    // Requêtes spéciales pour le workflow
    List<Inscription> getReinscritionsEnAttenteDirecteur(Long directeurId);
    List<Inscription> getReinscritionsEnAttenteAdmin();
    List<Inscription> getPremieresInscriptionsEnAttenteAdmin();
}