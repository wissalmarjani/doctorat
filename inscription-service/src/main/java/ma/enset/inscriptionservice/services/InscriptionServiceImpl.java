package ma.enset.inscriptionservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.inscriptionservice.entities.Campagne;
import ma.enset.inscriptionservice.entities.Inscription;
import ma.enset.inscriptionservice.enums.StatutInscription;
import ma.enset.inscriptionservice.enums.TypeInscription;
import ma.enset.inscriptionservice.repositories.CampagneRepository;
import ma.enset.inscriptionservice.repositories.InscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InscriptionServiceImpl implements InscriptionService {

    private final InscriptionRepository inscriptionRepository;
    private final CampagneRepository campagneRepository;

    // =============================================================
    // CRUD
    // =============================================================

    @Override
    public Inscription create(Inscription inscription) {
        log.info("📝 Création inscription pour doctorant: {}", inscription.getDoctorantId());

        if (inscription.getCampagne() != null && inscription.getCampagne().getId() != null) {
            Campagne campagne = campagneRepository.findById(inscription.getCampagne().getId())
                    .orElseThrow(() -> new RuntimeException("Campagne non trouvée"));
            inscription.setCampagne(campagne);
        }

        inscription.setStatut(StatutInscription.BROUILLON);
        return inscriptionRepository.save(inscription);
    }

    @Override
    public Inscription update(Long id, Inscription inscriptionDetails) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        if (inscriptionDetails.getSujetThese() != null) {
            inscription.setSujetThese(inscriptionDetails.getSujetThese());
        }
        if (inscriptionDetails.getLaboratoireAccueil() != null) {
            inscription.setLaboratoireAccueil(inscriptionDetails.getLaboratoireAccueil());
        }
        if (inscriptionDetails.getCollaborationExterne() != null) {
            inscription.setCollaborationExterne(inscriptionDetails.getCollaborationExterne());
        }

        return inscriptionRepository.save(inscription);
    }

    @Override
    public void delete(Long id) {
        inscriptionRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Inscription> getById(Long id) {
        return inscriptionRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Inscription> getAll() {
        return inscriptionRepository.findAll();
    }

    // =============================================================
    // REQUÊTES SPÉCIFIQUES
    // =============================================================

    @Override
    @Transactional(readOnly = true)
    public List<Inscription> getByDoctorant(Long doctorantId) {
        return inscriptionRepository.findByDoctorantIdOrderByCreatedAtDesc(doctorantId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Inscription> getByDirecteur(Long directeurId) {
        return inscriptionRepository.findByDirecteurIdOrderByCreatedAtDesc(directeurId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Inscription> getByStatut(StatutInscription statut) {
        return inscriptionRepository.findByStatut(statut);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Inscription> getByCampagne(Long campagneId) {
        return inscriptionRepository.findByCampagneId(campagneId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Inscription> getByTypeInscription(TypeInscription type) {
        return inscriptionRepository.findByTypeInscription(type);
    }

    // =============================================================
    // SOUMISSION - WORKFLOW CORRIGÉ
    // =============================================================

    @Override
    public Inscription soumettre(Long id) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        if (inscription.getStatut() != StatutInscription.BROUILLON) {
            throw new RuntimeException("Seul un brouillon peut être soumis. Statut actuel: " + inscription.getStatut());
        }

        // ✅ WORKFLOW CORRIGÉ:
        // - PREMIERE_INSCRIPTION → EN_ATTENTE_ADMIN (l'admin assigne le directeur)
        // - REINSCRIPTION → EN_ATTENTE_DIRECTEUR (le directeur valide d'abord)

        if (inscription.getTypeInscription() == TypeInscription.REINSCRIPTION) {
            inscription.setStatut(StatutInscription.EN_ATTENTE_DIRECTEUR);
            log.info("📤 Réinscription {} soumise → EN_ATTENTE_DIRECTEUR", id);
        } else {
            inscription.setStatut(StatutInscription.EN_ATTENTE_ADMIN);
            log.info("📤 Première inscription {} soumise → EN_ATTENTE_ADMIN", id);
        }

        inscription.setDateSoumission(LocalDateTime.now());
        return inscriptionRepository.save(inscription);
    }

    // =============================================================
    // VALIDATION DIRECTEUR (pour réinscriptions)
    // =============================================================

    @Override
    public Inscription validerParDirecteur(Long id, String commentaire) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        if (inscription.getStatut() != StatutInscription.EN_ATTENTE_DIRECTEUR) {
            throw new RuntimeException("Cette inscription n'est pas en attente de validation directeur");
        }

        // Après validation directeur → passe à l'admin
        inscription.setStatut(StatutInscription.EN_ATTENTE_ADMIN);
        inscription.setCommentaireDirecteur(commentaire);
        inscription.setDateValidationDirecteur(LocalDateTime.now());

        log.info("✅ Inscription {} validée par directeur → EN_ATTENTE_ADMIN", id);
        return inscriptionRepository.save(inscription);
    }

    @Override
    public Inscription rejeterParDirecteur(Long id, String motif) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        if (inscription.getStatut() != StatutInscription.EN_ATTENTE_DIRECTEUR) {
            throw new RuntimeException("Cette inscription n'est pas en attente de validation directeur");
        }

        inscription.setStatut(StatutInscription.REJETE_DIRECTEUR);
        inscription.setCommentaireDirecteur(motif);
        inscription.setDateValidationDirecteur(LocalDateTime.now());

        log.info("❌ Inscription {} rejetée par directeur. Motif: {}", id, motif);
        return inscriptionRepository.save(inscription);
    }

    // =============================================================
    // VALIDATION ADMIN
    // =============================================================

    @Override
    public Inscription validerParAdmin(Long id, String commentaire) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        if (inscription.getStatut() != StatutInscription.EN_ATTENTE_ADMIN) {
            throw new RuntimeException("Cette inscription n'est pas en attente de validation admin");
        }

        inscription.setStatut(StatutInscription.ADMIS);
        inscription.setCommentaireAdmin(commentaire);
        inscription.setDateValidationAdmin(LocalDateTime.now());

        log.info("✅ Inscription {} validée par admin → ADMIS", id);
        return inscriptionRepository.save(inscription);
    }

    @Override
    public Inscription rejeterParAdmin(Long id, String motif) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));

        if (inscription.getStatut() != StatutInscription.EN_ATTENTE_ADMIN) {
            throw new RuntimeException("Cette inscription n'est pas en attente de validation admin");
        }

        inscription.setStatut(StatutInscription.REJETE_ADMIN);
        inscription.setCommentaireAdmin(motif);
        inscription.setDateValidationAdmin(LocalDateTime.now());

        log.info("❌ Inscription {} rejetée par admin. Motif: {}", id, motif);
        return inscriptionRepository.save(inscription);
    }

    // =============================================================
    // REQUÊTES SPÉCIALES POUR DIRECTEUR ET ADMIN
    // =============================================================

    @Override
    @Transactional(readOnly = true)
    public List<Inscription> getReinscritionsEnAttenteDirecteur(Long directeurId) {
        return inscriptionRepository.findByDirecteurIdAndTypeInscriptionAndStatut(
                directeurId,
                TypeInscription.REINSCRIPTION,
                StatutInscription.EN_ATTENTE_DIRECTEUR
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Inscription> getReinscritionsEnAttenteAdmin() {
        return inscriptionRepository.findByTypeInscriptionAndStatut(
                TypeInscription.REINSCRIPTION,
                StatutInscription.EN_ATTENTE_ADMIN
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Inscription> getPremieresInscriptionsEnAttenteAdmin() {
        return inscriptionRepository.findByTypeInscriptionAndStatut(
                TypeInscription.PREMIERE_INSCRIPTION,
                StatutInscription.EN_ATTENTE_ADMIN
        );
    }
}