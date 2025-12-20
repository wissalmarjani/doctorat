package ma.enset.soutenanceservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.soutenanceservice.clients.UserServiceClient;
import ma.enset.soutenanceservice.dto.UserDTO;
import ma.enset.soutenanceservice.entities.MembreJury;
import ma.enset.soutenanceservice.entities.Soutenance;
import ma.enset.soutenanceservice.enums.StatutSoutenance;
import ma.enset.soutenanceservice.events.SoutenanceCreatedEvent;
import ma.enset.soutenanceservice.events.SoutenanceStatusChangedEvent;
import ma.enset.soutenanceservice.repositories.MembreJuryRepository;
import ma.enset.soutenanceservice.repositories.SoutenanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class SoutenanceServiceImpl implements SoutenanceService {

    private final SoutenanceRepository soutenanceRepository;
    private final MembreJuryRepository membreJuryRepository;
    private final UserServiceClient userServiceClient;
    private final SoutenanceEventPublisher eventPublisher;  // ← AJOUTÉ

    @Override
    public Soutenance createSoutenance(Soutenance soutenance) {
        log.info("Creating soutenance for doctorant: {}", soutenance.getDoctorantId());

        UserDTO doctorant = null;
        UserDTO directeur = null;

        // Vérifier que le doctorant et le directeur existent
        try {
            doctorant = userServiceClient.getUserById(soutenance.getDoctorantId());
            directeur = userServiceClient.getUserById(soutenance.getDirecteurId());

            log.info("Doctorant vérifié: {} {}", doctorant.getNom(), doctorant.getPrenom());
            log.info("Directeur vérifié: {} {}", directeur.getNom(), directeur.getPrenom());

        } catch (Exception e) {
            log.error("Erreur lors de la vérification des utilisateurs: {}", e.getMessage());
            throw new RuntimeException("Impossible de vérifier les utilisateurs. Assurez-vous que le doctorant et le directeur existent.");
        }

        Soutenance saved = soutenanceRepository.save(soutenance);

        // ====== PUBLIER L'ÉVÉNEMENT KAFKA ======
        try {
            SoutenanceCreatedEvent event = SoutenanceCreatedEvent.builder()
                    .soutenanceId(saved.getId())
                    .doctorantId(saved.getDoctorantId())
                    .doctorantEmail(doctorant != null ? doctorant.getEmail() : null)
                    .doctorantNom(doctorant != null ? doctorant.getNom() : null)
                    .doctorantPrenom(doctorant != null ? doctorant.getPrenom() : null)
                    .sujetThese(saved.getTitreThese())
                    .directeurTheseEmail(directeur != null ? directeur.getEmail() : null)
                    .directeurTheseNom(directeur != null ? directeur.getNom() + " " + directeur.getPrenom() : null)
                    .status(saved.getStatut().name())
                    .build();

            eventPublisher.publishSoutenanceCreated(event);
            log.info("✅ Événement SoutenanceCreated publié pour soutenance ID: {}", saved.getId());
        } catch (Exception e) {
            log.warn("⚠️ Impossible de publier l'événement Kafka: {}", e.getMessage());
        }
        // ====== FIN ÉVÉNEMENT KAFKA ======

        return saved;
    }

    @Override
    public Soutenance updateSoutenance(Long id, Soutenance soutenance) {
        log.info("Updating soutenance with id: {}", id);

        return soutenanceRepository.findById(id)
                .map(existing -> {
                    existing.setTitreThese(soutenance.getTitreThese());
                    existing.setResume(soutenance.getResume());
                    existing.setMotsCles(soutenance.getMotsCles());
                    return soutenanceRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Soutenance non trouvée avec l'id: " + id));
    }

    @Override
    public void deleteSoutenance(Long id) {
        log.info("Deleting soutenance with id: {}", id);
        soutenanceRepository.deleteById(id);
    }

    @Override
    public Optional<Soutenance> getSoutenanceById(Long id) {
        Optional<Soutenance> soutenance = soutenanceRepository.findById(id);
        soutenance.ifPresent(this::enrichirAvecInfosUtilisateurs);
        return soutenance;
    }

    @Override
    public List<Soutenance> getAllSoutenances() {
        List<Soutenance> soutenances = soutenanceRepository.findAll();
        soutenances.forEach(this::enrichirAvecInfosUtilisateurs);
        return soutenances;
    }

    @Override
    public List<Soutenance> getSoutenancesByDoctorant(Long doctorantId) {
        List<Soutenance> soutenances = soutenanceRepository.findByDoctorantId(doctorantId);
        soutenances.forEach(this::enrichirAvecInfosUtilisateurs);
        return soutenances;
    }

    @Override
    public List<Soutenance> getSoutenancesByDirecteur(Long directeurId) {
        List<Soutenance> soutenances = soutenanceRepository.findByDirecteurId(directeurId);
        soutenances.forEach(this::enrichirAvecInfosUtilisateurs);
        return soutenances;
    }

    @Override
    public List<Soutenance> getSoutenancesByStatut(StatutSoutenance statut) {
        List<Soutenance> soutenances = soutenanceRepository.findByStatut(statut);
        soutenances.forEach(this::enrichirAvecInfosUtilisateurs);
        return soutenances;
    }

    @Override
    public Soutenance verifierPrerequisEtSoumettre(Long id) {
        log.info("Verifying prerequis for soutenance: {}", id);

        return soutenanceRepository.findById(id)
                .map(soutenance -> {
                    if (!soutenance.prerequisSontValides()) {
                        throw new RuntimeException("Les prérequis ne sont pas remplis. Minimum requis: 2 articles Q1/Q2, 2 conférences, 200h de formation.");
                    }

                    String ancienStatut = soutenance.getStatut().name();

                    // Marquer les prérequis comme validés
                    soutenance.getPrerequis().setPrerequisValides(true);
                    soutenance.setStatut(StatutSoutenance.PREREQUIS_VALIDES);
                    Soutenance updated = soutenanceRepository.save(soutenance);

                    // ====== PUBLIER L'ÉVÉNEMENT KAFKA ======
                    publishStatusChangedEvent(updated, ancienStatut, "PREREQUIS_VALIDES", "Prérequis validés automatiquement");
                    // ====== FIN ÉVÉNEMENT KAFKA ======

                    return updated;
                })
                .orElseThrow(() -> new RuntimeException("Soutenance non trouvée avec l'id: " + id));
    }

    @Override
    public Soutenance ajouterMembreJury(Long soutenanceId, MembreJury membreJury) {
        log.info("Adding jury member to soutenance: {}", soutenanceId);

        return soutenanceRepository.findById(soutenanceId)
                .map(soutenance -> {
                    membreJury.setSoutenance(soutenance);
                    soutenance.getMembresJury().add(membreJury);
                    return soutenanceRepository.save(soutenance);
                })
                .orElseThrow(() -> new RuntimeException("Soutenance non trouvée avec l'id: " + soutenanceId));
    }

    @Override
    public Soutenance proposerJury(Long id) {
        log.info("Proposing jury for soutenance: {}", id);

        return soutenanceRepository.findById(id)
                .map(soutenance -> {
                    if (soutenance.getStatut() != StatutSoutenance.PREREQUIS_VALIDES) {
                        throw new RuntimeException("Les prérequis doivent être validés avant de proposer le jury");
                    }

                    if (!soutenance.juryEstComplet()) {
                        throw new RuntimeException("Le jury doit contenir au moins 1 président et 2 rapporteurs");
                    }

                    String ancienStatut = soutenance.getStatut().name();
                    soutenance.setStatut(StatutSoutenance.JURY_PROPOSE);
                    Soutenance updated = soutenanceRepository.save(soutenance);

                    // ====== PUBLIER L'ÉVÉNEMENT KAFKA ======
                    publishStatusChangedEvent(updated, ancienStatut, "JURY_PROPOSE", "Jury proposé");

                    // Envoyer les invitations au jury
                    try {
                        List<MembreJury> membresJury = membreJuryRepository.findBySoutenanceId(id);
                        String doctorantNom = getDoctorantNom(updated.getDoctorantId());
                        eventPublisher.publishAllJuryInvitations(updated, doctorantNom, membresJury);
                        log.info("✅ Invitations jury envoyées pour {} membres", membresJury.size());
                    } catch (Exception e) {
                        log.warn("⚠️ Impossible d'envoyer les invitations jury: {}", e.getMessage());
                    }
                    // ====== FIN ÉVÉNEMENT KAFKA ======

                    return updated;
                })
                .orElseThrow(() -> new RuntimeException("Soutenance non trouvée avec l'id: " + id));
    }

    @Override
    public Soutenance soumettreRapportRapporteur(Long soutenanceId, Long membreJuryId, Boolean avisFavorable, String commentaire) {
        log.info("Submitting rapport for rapporteur {} in soutenance {}", membreJuryId, soutenanceId);

        MembreJury membre = membreJuryRepository.findById(membreJuryId)
                .orElseThrow(() -> new RuntimeException("Membre jury non trouvé avec l'id: " + membreJuryId));

        membre.setRapportSoumis(true);
        membre.setAvisFavorable(avisFavorable);
        membre.setCommentaireRapport(commentaire);
        membreJuryRepository.save(membre);

        return soutenanceRepository.findById(soutenanceId)
                .orElseThrow(() -> new RuntimeException("Soutenance non trouvée avec l'id: " + soutenanceId));
    }

    @Override
    public Soutenance autoriserSoutenance(Long id, String commentaire) {
        log.info("Authorizing soutenance: {}", id);

        return soutenanceRepository.findById(id)
                .map(soutenance -> {
                    if (soutenance.getStatut() != StatutSoutenance.JURY_PROPOSE) {
                        throw new RuntimeException("Le jury doit être proposé avant l'autorisation");
                    }

                    if (!soutenance.tousLesRapportsRecus()) {
                        throw new RuntimeException("Tous les rapports des rapporteurs doivent être soumis");
                    }

                    if (!soutenance.tousLesRapportsFavorables()) {
                        throw new RuntimeException("Tous les rapporteurs doivent donner un avis favorable");
                    }

                    String ancienStatut = soutenance.getStatut().name();
                    soutenance.setStatut(StatutSoutenance.AUTORISEE);
                    soutenance.setCommentaireAdmin(commentaire);
                    soutenance.setDateAutorisation(LocalDateTime.now());
                    Soutenance updated = soutenanceRepository.save(soutenance);

                    // ====== PUBLIER L'ÉVÉNEMENT KAFKA ======
                    publishStatusChangedEvent(updated, ancienStatut, "AUTORISEE", commentaire);
                    // ====== FIN ÉVÉNEMENT KAFKA ======

                    return updated;
                })
                .orElseThrow(() -> new RuntimeException("Soutenance non trouvée avec l'id: " + id));
    }

    @Override
    public Soutenance planifierSoutenance(Long id, LocalDate date, LocalTime heure, String lieu) {
        log.info("Planning soutenance: {}", id);

        return soutenanceRepository.findById(id)
                .map(soutenance -> {
                    if (soutenance.getStatut() != StatutSoutenance.AUTORISEE) {
                        throw new RuntimeException("La soutenance doit être autorisée avant la planification");
                    }

                    String ancienStatut = soutenance.getStatut().name();
                    soutenance.setDateSoutenance(date);
                    soutenance.setHeureSoutenance(heure);
                    soutenance.setLieuSoutenance(lieu);
                    soutenance.setStatut(StatutSoutenance.PLANIFIEE);
                    Soutenance updated = soutenanceRepository.save(soutenance);

                    // ====== PUBLIER L'ÉVÉNEMENT KAFKA (SOUTENANCE_SCHEDULED) ======
                    try {
                        SoutenanceStatusChangedEvent event = buildStatusChangedEvent(updated, ancienStatut, "PLANIFIEE",
                                "Soutenance planifiée le " + date + " à " + heure);
                        // Ajouter les infos de planification
                        event.setDateSoutenance(LocalDateTime.of(date, heure));
                        event.setLieu(lieu);

                        eventPublisher.publishSoutenanceScheduled(event);
                        log.info("✅ Événement SoutenanceScheduled publié");
                    } catch (Exception e) {
                        log.warn("⚠️ Impossible de publier l'événement: {}", e.getMessage());
                    }
                    // ====== FIN ÉVÉNEMENT KAFKA ======

                    return updated;
                })
                .orElseThrow(() -> new RuntimeException("Soutenance non trouvée avec l'id: " + id));
    }

    @Override
    public Soutenance enregistrerResultat(Long id, Double note, String mention, Boolean felicitations) {
        log.info("Recording result for soutenance: {}", id);

        return soutenanceRepository.findById(id)
                .map(soutenance -> {
                    String ancienStatut = soutenance.getStatut().name();
                    soutenance.setNoteFinale(note);
                    soutenance.setMention(mention);
                    soutenance.setFelicitationsJury(felicitations);
                    soutenance.setStatut(StatutSoutenance.TERMINEE);
                    Soutenance updated = soutenanceRepository.save(soutenance);

                    // ====== PUBLIER L'ÉVÉNEMENT KAFKA ======
                    String commentaire = "Soutenance terminée - Mention: " + mention;
                    if (felicitations) {
                        commentaire += " avec félicitations du jury";
                    }
                    publishStatusChangedEvent(updated, ancienStatut, "TERMINEE", commentaire);
                    // ====== FIN ÉVÉNEMENT KAFKA ======

                    return updated;
                })
                .orElseThrow(() -> new RuntimeException("Soutenance non trouvée avec l'id: " + id));
    }

    @Override
    public Soutenance rejeterSoutenance(Long id, String motif) {
        log.info("Rejecting soutenance: {}", id);

        return soutenanceRepository.findById(id)
                .map(soutenance -> {
                    String ancienStatut = soutenance.getStatut().name();
                    soutenance.setStatut(StatutSoutenance.REJETEE);
                    soutenance.setCommentaireAdmin(motif);
                    Soutenance updated = soutenanceRepository.save(soutenance);

                    // ====== PUBLIER L'ÉVÉNEMENT KAFKA ======
                    publishStatusChangedEvent(updated, ancienStatut, "REJETEE", motif);
                    // ====== FIN ÉVÉNEMENT KAFKA ======

                    return updated;
                })
                .orElseThrow(() -> new RuntimeException("Soutenance non trouvée avec l'id: " + id));
    }

    // ====== MÉTHODES UTILITAIRES POUR KAFKA ======

    private void publishStatusChangedEvent(Soutenance soutenance, String oldStatus, String newStatus, String commentaire) {
        try {
            SoutenanceStatusChangedEvent event = buildStatusChangedEvent(soutenance, oldStatus, newStatus, commentaire);
            eventPublisher.publishSoutenanceStatusChanged(event);
            log.info("✅ Événement SoutenanceStatusChanged publié: {} -> {}", oldStatus, newStatus);
        } catch (Exception e) {
            log.warn("⚠️ Impossible de publier l'événement Kafka: {}", e.getMessage());
        }
    }

    private SoutenanceStatusChangedEvent buildStatusChangedEvent(Soutenance soutenance, String oldStatus,
                                                                 String newStatus, String commentaire) {
        UserDTO doctorant = null;
        try {
            doctorant = userServiceClient.getUserById(soutenance.getDoctorantId());
        } catch (Exception e) {
            log.warn("Impossible de récupérer les infos du doctorant: {}", e.getMessage());
        }

        return SoutenanceStatusChangedEvent.builder()
                .soutenanceId(soutenance.getId())
                .doctorantId(soutenance.getDoctorantId())
                .doctorantEmail(doctorant != null ? doctorant.getEmail() : null)
                .doctorantNom(doctorant != null ? doctorant.getNom() : null)
                .doctorantPrenom(doctorant != null ? doctorant.getPrenom() : null)
                .sujetThese(soutenance.getTitreThese())
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .dateSoutenance(soutenance.getDateSoutenance() != null && soutenance.getHeureSoutenance() != null
                        ? LocalDateTime.of(soutenance.getDateSoutenance(), soutenance.getHeureSoutenance()) : null)
                .lieu(soutenance.getLieuSoutenance())
                .commentaire(commentaire)
                .build();
    }

    private String getDoctorantNom(Long doctorantId) {
        try {
            UserDTO doctorant = userServiceClient.getUserById(doctorantId);
            return doctorant.getNom() + " " + doctorant.getPrenom();
        } catch (Exception e) {
            return "Doctorant ID: " + doctorantId;
        }
    }

    /**
     * Enrichir la soutenance avec les informations des utilisateurs
     * via OpenFeign
     */
    private Soutenance enrichirAvecInfosUtilisateurs(Soutenance soutenance) {
        try {
            UserDTO doctorant = userServiceClient.getUserById(soutenance.getDoctorantId());
            UserDTO directeur = userServiceClient.getUserById(soutenance.getDirecteurId());

            log.info("Infos enrichies - Doctorant: {} {}, Directeur: {} {}",
                    doctorant.getNom(), doctorant.getPrenom(),
                    directeur.getNom(), directeur.getPrenom());

        } catch (Exception e) {
            log.warn("Impossible de récupérer les infos utilisateurs pour la soutenance {}: {}",
                    soutenance.getId(), e.getMessage());
        }

        return soutenance;
    }
}