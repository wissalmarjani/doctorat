package ma.enset.inscriptionservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.inscriptionservice.clients.UserServiceClient;
import ma.enset.inscriptionservice.dto.UserDTO;
import ma.enset.inscriptionservice.entities.Derogation;
import ma.enset.inscriptionservice.enums.StatutDerogation;
import ma.enset.inscriptionservice.enums.TypeDerogation;
import ma.enset.inscriptionservice.repositories.DerogationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class DerogationServiceImpl implements DerogationService {

    private final DerogationRepository derogationRepository;
    private final UserServiceClient userServiceClient;

    // ========================================================
    // DOCTORANT
    // ========================================================

    @Override
    public Derogation demanderDerogation(Long doctorantId, Long directeurId, TypeDerogation type, String motif) {
        log.info("📝 Demande de dérogation - Doctorant: {}, Directeur: {}, Type: {}", doctorantId, directeurId, type);

        // Si directeurId n'est pas fourni, essayer de le récupérer depuis le profil du doctorant
        Long finalDirecteurId = directeurId;
        if (finalDirecteurId == null) {
            try {
                UserDTO doctorant = userServiceClient.getUserById(doctorantId);
                if (doctorant != null && doctorant.getDirecteurId() != null) {
                    finalDirecteurId = doctorant.getDirecteurId();
                    log.info("📋 Directeur récupéré depuis le profil du doctorant: {}", finalDirecteurId);
                }
            } catch (Exception e) {
                log.warn("⚠️ Impossible de récupérer le directeur du doctorant: {}", e.getMessage());
            }
        }

        // Vérifier si une demande similaire est déjà en attente
        List<Derogation> derogationsEnAttente = derogationRepository
                .findByDoctorantIdOrderByDateDemandeDesc(doctorantId)
                .stream()
                .filter(Derogation::estEnAttente)
                .filter(d -> d.getTypeDerogation() == type)
                .toList();

        if (!derogationsEnAttente.isEmpty()) {
            throw new RuntimeException("Une demande de dérogation similaire est déjà en cours pour ce doctorant");
        }

        // Déterminer le statut initial
        StatutDerogation statutInitial = (finalDirecteurId != null)
                ? StatutDerogation.EN_ATTENTE_DIRECTEUR
                : StatutDerogation.EN_ATTENTE_ADMIN;

        // Créer la dérogation
        Derogation derogation = Derogation.builder()
                .doctorantId(doctorantId)
                .directeurId(finalDirecteurId)
                .typeDerogation(type)
                .motif(motif)
                .anneeDemandee(type.getAnneeAutorisee())
                .statut(statutInitial)
                .dateDemande(LocalDateTime.now())
                .build();

        Derogation saved = derogationRepository.save(derogation);
        log.info("✅ Demande de dérogation créée - ID: {}, Statut: {}", saved.getId(), statutInitial);

        return enrichirDerogation(saved);
    }

    @Override
    public List<Derogation> getDerogationsByDoctorant(Long doctorantId) {
        List<Derogation> derogations = derogationRepository.findByDoctorantIdOrderByDateDemandeDesc(doctorantId);
        derogations.forEach(this::enrichirDerogation);
        return derogations;
    }

    // ========================================================
    // DIRECTEUR
    // ========================================================

    @Override
    public List<Derogation> getDerogationsEnAttenteDirecteur(Long directeurId) {
        log.info("📋 Récupération dérogations pour directeur: {}", directeurId);

        List<Derogation> toutesDerogations = new ArrayList<>();

        // 1. Dérogations où directeur_id = directeurId (assignation directe)
        List<Derogation> derogationsDirectes = derogationRepository.findByDirecteurIdOrderByDateDemandeDesc(directeurId);
        log.info("   - {} dérogations avec directeur_id = {}", derogationsDirectes.size(), directeurId);
        toutesDerogations.addAll(derogationsDirectes);

        // 2. Chercher les dérogations des doctorants dont le directeur_id dans users = directeurId
        //    mais qui n'ont pas de directeur_id dans la table derogations
        try {
            List<UserDTO> doctorants = userServiceClient.getDoctorantsByDirecteur(directeurId);
            log.info("   - {} doctorants trouvés pour ce directeur", doctorants != null ? doctorants.size() : 0);

            if (doctorants != null && !doctorants.isEmpty()) {
                for (UserDTO doctorant : doctorants) {
                    List<Derogation> derogationsDoctorant = derogationRepository
                            .findByDoctorantIdOrderByDateDemandeDesc(doctorant.getId())
                            .stream()
                            .filter(d -> d.getDirecteurId() == null)
                            .filter(d -> d.getStatut() == StatutDerogation.EN_ATTENTE_DIRECTEUR
                                    || d.getStatut() == StatutDerogation.EN_ATTENTE)
                            .toList();

                    // Mettre à jour le directeur_id pour ces dérogations
                    for (Derogation d : derogationsDoctorant) {
                        d.setDirecteurId(directeurId);
                        derogationRepository.save(d);
                        log.info("   - Mise à jour directeur_id={} pour dérogation {} du doctorant {}",
                                directeurId, d.getId(), doctorant.getId());
                    }

                    toutesDerogations.addAll(derogationsDoctorant);
                }
            }
        } catch (Exception e) {
            log.warn("⚠️ Erreur lors de la récupération des doctorants: {}", e.getMessage());
        }

        // 3. Dédupliquer par ID et enrichir
        toutesDerogations = toutesDerogations.stream()
                .collect(Collectors.toMap(Derogation::getId, d -> d, (d1, d2) -> d1))
                .values()
                .stream()
                .toList();

        toutesDerogations.forEach(this::enrichirDerogation);
        log.info("✅ {} dérogations totales pour directeur {}", toutesDerogations.size(), directeurId);

        return toutesDerogations;
    }

    @Override
    public Derogation validerParDirecteur(Long derogationId, Long directeurId, String commentaire) {
        log.info("✅ Validation directeur - Dérogation: {}, Directeur: {}", derogationId, directeurId);

        Derogation derogation = derogationRepository.findById(derogationId)
                .orElseThrow(() -> new RuntimeException("Dérogation non trouvée: " + derogationId));

        // Vérifier que c'est bien le directeur (ou que pas de directeur assigné)
        if (derogation.getDirecteurId() != null && !derogation.getDirecteurId().equals(directeurId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à valider cette dérogation");
        }

        if (!derogation.estEnAttenteDirecteur() && derogation.getStatut() != StatutDerogation.EN_ATTENTE) {
            throw new RuntimeException("Cette dérogation n'est pas en attente de validation directeur. Statut: " + derogation.getStatut());
        }

        // Mettre à jour le directeur si pas encore assigné
        if (derogation.getDirecteurId() == null) {
            derogation.setDirecteurId(directeurId);
        }

        derogation.setStatut(StatutDerogation.EN_ATTENTE_ADMIN);
        derogation.setDateValidationDirecteur(LocalDateTime.now());
        derogation.setCommentaireDirecteur(commentaire);
        derogation.setValideParDirecteur(true);

        Derogation saved = derogationRepository.save(derogation);
        log.info("✅ Dérogation {} validée par directeur, passée à EN_ATTENTE_ADMIN", derogationId);

        return enrichirDerogation(saved);
    }

    @Override
    public Derogation refuserParDirecteur(Long derogationId, Long directeurId, String commentaire) {
        log.info("❌ Refus directeur - Dérogation: {}, Directeur: {}", derogationId, directeurId);

        Derogation derogation = derogationRepository.findById(derogationId)
                .orElseThrow(() -> new RuntimeException("Dérogation non trouvée: " + derogationId));

        if (derogation.getDirecteurId() != null && !derogation.getDirecteurId().equals(directeurId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à traiter cette dérogation");
        }

        if (!derogation.estEnAttenteDirecteur() && derogation.getStatut() != StatutDerogation.EN_ATTENTE) {
            throw new RuntimeException("Cette dérogation n'est pas en attente de validation directeur");
        }

        if (derogation.getDirecteurId() == null) {
            derogation.setDirecteurId(directeurId);
        }

        derogation.setStatut(StatutDerogation.REFUSEE);
        derogation.setDateValidationDirecteur(LocalDateTime.now());
        derogation.setCommentaireDirecteur(commentaire);
        derogation.setValideParDirecteur(false);
        derogation.setDateDecision(LocalDateTime.now());

        Derogation saved = derogationRepository.save(derogation);
        log.info("❌ Dérogation {} refusée par directeur", derogationId);

        return enrichirDerogation(saved);
    }

    // ========================================================
    // ADMIN
    // ========================================================

    @Override
    public List<Derogation> getDerogationsEnAttenteAdmin() {
        log.info("📋 Récupération dérogations en attente admin");
        List<Derogation> derogations = derogationRepository.findByStatutOrderByDateDemandeAsc(StatutDerogation.EN_ATTENTE_ADMIN);
        derogations.forEach(this::enrichirDerogation);
        return derogations;
    }

    @Override
    public Derogation approuverDerogation(Long derogationId, Long decideurId, String commentaire) {
        log.info("✅ Approbation admin - Dérogation: {}, Admin: {}", derogationId, decideurId);

        Derogation derogation = derogationRepository.findById(derogationId)
                .orElseThrow(() -> new RuntimeException("Dérogation non trouvée: " + derogationId));

        if (derogation.getStatut() != StatutDerogation.EN_ATTENTE_ADMIN) {
            throw new RuntimeException("Cette dérogation n'est pas en attente de validation admin. Statut: " + derogation.getStatut());
        }

        derogation.setStatut(StatutDerogation.APPROUVEE);
        derogation.setDecideParId(decideurId);
        derogation.setCommentaireDecision(commentaire);
        derogation.setDateDecision(LocalDateTime.now());
        derogation.setDateExpiration(LocalDate.now().plusYears(1).withMonth(9).withDayOfMonth(30));

        Derogation saved = derogationRepository.save(derogation);
        log.info("✅ Dérogation {} approuvée", derogationId);

        return enrichirDerogation(saved);
    }

    @Override
    public Derogation refuserDerogation(Long derogationId, Long decideurId, String commentaire) {
        log.info("❌ Refus admin - Dérogation: {}, Admin: {}", derogationId, decideurId);

        Derogation derogation = derogationRepository.findById(derogationId)
                .orElseThrow(() -> new RuntimeException("Dérogation non trouvée: " + derogationId));

        if (derogation.getStatut() != StatutDerogation.EN_ATTENTE_ADMIN) {
            throw new RuntimeException("Cette dérogation n'est pas en attente de validation admin");
        }

        derogation.setStatut(StatutDerogation.REFUSEE);
        derogation.setDecideParId(decideurId);
        derogation.setCommentaireDecision(commentaire);
        derogation.setDateDecision(LocalDateTime.now());

        Derogation saved = derogationRepository.save(derogation);
        log.info("❌ Dérogation {} refusée", derogationId);

        return enrichirDerogation(saved);
    }

    // ========================================================
    // COMMUN
    // ========================================================

    @Override
    public Optional<Derogation> getDerogationById(Long id) {
        Optional<Derogation> derogation = derogationRepository.findById(id);
        derogation.ifPresent(this::enrichirDerogation);
        return derogation;
    }

    @Override
    public List<Derogation> getDerogationsEnAttente() {
        List<Derogation> derogations = derogationRepository.findByStatutIn(
                List.of(StatutDerogation.EN_ATTENTE_DIRECTEUR, StatutDerogation.EN_ATTENTE_ADMIN, StatutDerogation.EN_ATTENTE)
        );
        derogations.forEach(this::enrichirDerogation);
        return derogations;
    }

    @Override
    public boolean hasDerogationValide(Long doctorantId, int annee) {
        return derogationRepository.hasDerogationValide(doctorantId, annee);
    }

    @Override
    public List<Derogation> getDerogationsByStatut(StatutDerogation statut) {
        List<Derogation> derogations = derogationRepository.findByStatut(statut);
        derogations.forEach(this::enrichirDerogation);
        return derogations;
    }

    @Override
    public List<Derogation> getAllDerogations() {
        List<Derogation> derogations = derogationRepository.findAll();
        derogations.forEach(this::enrichirDerogation);
        return derogations;
    }

    // ========================================================
    // MÉTHODES UTILITAIRES
    // ========================================================

    private Derogation enrichirDerogation(Derogation derogation) {
        try {
            // Infos doctorant
            UserDTO doctorant = userServiceClient.getUserById(derogation.getDoctorantId());
            if (doctorant != null) {
                derogation.setDoctorantNom(doctorant.getNom());
                derogation.setDoctorantPrenom(doctorant.getPrenom());
                derogation.setDoctorantEmail(doctorant.getEmail());

                // Si pas de directeur_id, le récupérer du doctorant
                if (derogation.getDirecteurId() == null && doctorant.getDirecteurId() != null) {
                    derogation.setDirecteurId(doctorant.getDirecteurId());
                }
            }

            // Infos directeur
            if (derogation.getDirecteurId() != null) {
                UserDTO directeur = userServiceClient.getUserById(derogation.getDirecteurId());
                if (directeur != null) {
                    derogation.setDirecteurNom(directeur.getNom());
                    derogation.setDirecteurPrenom(directeur.getPrenom());
                }
            }
        } catch (Exception e) {
            log.warn("Impossible d'enrichir la dérogation {}: {}", derogation.getId(), e.getMessage());
        }
        return derogation;
    }
}