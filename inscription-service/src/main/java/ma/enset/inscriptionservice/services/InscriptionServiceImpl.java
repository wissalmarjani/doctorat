package ma.enset.inscriptionservice.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.inscriptionservice.entities.Inscription;
import ma.enset.inscriptionservice.enums.StatutInscription;
import ma.enset.inscriptionservice.repositories.InscriptionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class InscriptionServiceImpl implements InscriptionService {

    private final InscriptionRepository inscriptionRepository;

    @Override
    public Inscription createInscription(Inscription inscription) {
        if (inscription.getStatut() == null) {
            // Par défaut, on initialise en brouillon
            inscription.setStatut(StatutInscription.BROUILLON);
        }
        return inscriptionRepository.save(inscription);
    }

    @Override
    public List<Inscription> getAllInscriptions() {
        return inscriptionRepository.findAll();
    }

    @Override
    public Optional<Inscription> getInscriptionById(Long id) {
        return inscriptionRepository.findById(id);
    }

    @Override
    public List<Inscription> getInscriptionsByDoctorant(Long doctorantId) {
        return inscriptionRepository.findByDoctorantId(doctorantId);
    }

    @Override
    public List<Inscription> getInscriptionsByDirecteur(Long directeurId) {
        return inscriptionRepository.findByDirecteurId(directeurId);
    }

    @Override
    public List<Inscription> getInscriptionsByStatut(StatutInscription statut) {
        return inscriptionRepository.findByStatut(statut);
    }

    @Override
    public Inscription updateInscription(Long id, Inscription inscriptionDetails) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée avec l'id : " + id));

        // Mise à jour des champs
        inscription.setSujetThese(inscriptionDetails.getSujetThese());
        inscription.setLaboratoireAccueil(inscriptionDetails.getLaboratoireAccueil());
        inscription.setCollaborationExterne(inscriptionDetails.getCollaborationExterne());
        inscription.setCampagne(inscriptionDetails.getCampagne());

        // Si le dossier était rejeté, on le remet en circuit (En attente Admin) après modification
        if (inscription.getStatut() == StatutInscription.REJETE_ADMIN ||
                inscription.getStatut() == StatutInscription.REJETE_DIRECTEUR) {
            inscription.setStatut(StatutInscription.EN_ATTENTE_ADMIN);
        }

        return inscriptionRepository.save(inscription);
    }

    @Override
    public void deleteInscription(Long id) {
        inscriptionRepository.deleteById(id);
    }

    // --- WORKFLOW SPECIFIQUE ---

    @Override
    public Inscription soumettreInscription(Long id) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        inscription.setStatut(StatutInscription.EN_ATTENTE_ADMIN);
        return inscriptionRepository.save(inscription);
    }

    @Override
    public Inscription validerParAdmin(Long id, String commentaire) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        // Validation Admin => Passe au Directeur
        inscription.setStatut(StatutInscription.EN_ATTENTE_DIRECTEUR);
        inscription.setCommentaireAdmin(commentaire);
        inscription.setDateValidationAdmin(LocalDateTime.now());

        log.info("Inscription {} validée par Admin. Transmise au Directeur.", id);
        return inscriptionRepository.save(inscription);
    }

    @Override
    public Inscription rejeterParAdmin(Long id, String commentaire) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        inscription.setStatut(StatutInscription.REJETE_ADMIN);
        inscription.setCommentaireAdmin(commentaire);
        inscription.setDateValidationAdmin(LocalDateTime.now());

        log.info("Inscription {} rejetée par Admin.", id);
        return inscriptionRepository.save(inscription);
    }

    @Override
    public Inscription validerParDirecteur(Long id, String commentaire) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        // Validation Directeur => ADMIS
        inscription.setStatut(StatutInscription.ADMIS);
        inscription.setCommentaireDirecteur(commentaire);
        inscription.setDateValidationDirecteur(LocalDateTime.now());

        log.info("Inscription {} validée par Directeur. Candidat ADMIS.", id);
        return inscriptionRepository.save(inscription);
    }

    @Override
    public Inscription rejeterParDirecteur(Long id, String commentaire) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        inscription.setStatut(StatutInscription.REJETE_DIRECTEUR);
        inscription.setCommentaireDirecteur(commentaire);
        inscription.setDateValidationDirecteur(LocalDateTime.now());

        log.info("Inscription {} rejetée par Directeur.", id);
        return inscriptionRepository.save(inscription);
    }

    // --- ✅ LA MÉTHODE MANQUANTE AJOUTÉE ICI ---

    @Override
    public Inscription changerStatut(Long id, StatutInscription nouveauStatut, String commentaire) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        inscription.setStatut(nouveauStatut);

        // On essaye de placer le commentaire au bon endroit selon le statut
        if (nouveauStatut == StatutInscription.REJETE_ADMIN || nouveauStatut == StatutInscription.EN_ATTENTE_DIRECTEUR) {
            inscription.setCommentaireAdmin(commentaire);
            inscription.setDateValidationAdmin(LocalDateTime.now());
        } else if (nouveauStatut == StatutInscription.REJETE_DIRECTEUR || nouveauStatut == StatutInscription.ADMIS) {
            inscription.setCommentaireDirecteur(commentaire);
            inscription.setDateValidationDirecteur(LocalDateTime.now());
        }

        return inscriptionRepository.save(inscription);
    }
}