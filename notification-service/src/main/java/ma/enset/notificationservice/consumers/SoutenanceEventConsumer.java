package ma.enset.notificationservice.consumers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.notificationservice.config.KafkaTopics;
import ma.enset.notificationservice.enums.NotificationType;
import ma.enset.notificationservice.events.JuryInvitationEvent;
import ma.enset.notificationservice.events.SoutenanceCreatedEvent;
import ma.enset.notificationservice.events.SoutenanceStatusChangedEvent;
import ma.enset.notificationservice.services.NotificationService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class SoutenanceEventConsumer {

    private final NotificationService notificationService;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm");

    /**
     * Écoute les événements de création de soutenance
     */
    @KafkaListener(
            topics = KafkaTopics.SOUTENANCE_CREATED,
            groupId = "notification-group",
            containerFactory = "soutenanceCreatedKafkaListenerContainerFactory"
    )
    public void handleSoutenanceCreated(SoutenanceCreatedEvent event) {
        log.info("📩 Événement reçu: Soutenance créée - ID: {}, Doctorant: {} {}",
                event.getSoutenanceId(), event.getDoctorantPrenom(), event.getDoctorantNom());

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("doctorantNom", event.getDoctorantNom());
            variables.put("doctorantPrenom", event.getDoctorantPrenom());
            variables.put("sujetThese", event.getSujetThese());
            variables.put("soutenanceId", event.getSoutenanceId());

            // Notification au doctorant
            notificationService.createAndSendNotification(
                    NotificationType.SOUTENANCE_CREATED,
                    event.getDoctorantEmail(),
                    event.getDoctorantPrenom() + " " + event.getDoctorantNom(),
                    "Confirmation de votre demande de soutenance",
                    "soutenance-created",
                    variables,
                    event.getSoutenanceId(),
                    "SOUTENANCE"
            );

            // Notification au directeur de thèse
            if (event.getDirecteurTheseEmail() != null && !event.getDirecteurTheseEmail().isEmpty()) {
                Map<String, Object> directorVariables = new HashMap<>(variables);
                directorVariables.put("directeurNom", event.getDirecteurTheseNom());

                notificationService.createAndSendNotification(
                        NotificationType.VALIDATION_REQUIRED,
                        event.getDirecteurTheseEmail(),
                        event.getDirecteurTheseNom(),
                        "Nouvelle demande de soutenance - " + event.getDoctorantPrenom() + " " + event.getDoctorantNom(),
                        "validation-required",
                        directorVariables,
                        event.getSoutenanceId(),
                        "SOUTENANCE"
                );
            }

            log.info("✅ Notifications envoyées pour la soutenance {}", event.getSoutenanceId());

        } catch (Exception e) {
            log.error("❌ Erreur lors du traitement de l'événement SoutenanceCreated: {}", e.getMessage(), e);
        }
    }

    /**
     * Écoute les changements de statut de soutenance
     */
    @KafkaListener(
            topics = KafkaTopics.SOUTENANCE_STATUS_CHANGED,
            groupId = "notification-group",
            containerFactory = "soutenanceStatusKafkaListenerContainerFactory"
    )
    public void handleSoutenanceStatusChanged(SoutenanceStatusChangedEvent event) {
        log.info("📩 Événement reçu: Statut soutenance changé - ID: {}, {} -> {}",
                event.getSoutenanceId(), event.getOldStatus(), event.getNewStatus());

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("doctorantNom", event.getDoctorantNom());
            variables.put("doctorantPrenom", event.getDoctorantPrenom());
            variables.put("sujetThese", event.getSujetThese());
            variables.put("oldStatus", event.getOldStatus());
            variables.put("newStatus", event.getNewStatus());
            variables.put("commentaire", event.getCommentaire());
            variables.put("soutenanceId", event.getSoutenanceId());

            // Ajouter les infos de planification si présentes
            if (event.getDateSoutenance() != null) {
                variables.put("dateSoutenance", event.getDateSoutenance().format(DATE_FORMATTER));
                variables.put("lieu", event.getLieu());
                variables.put("salle", event.getSalle());
            }

            // Ajouter les infos du jury si présentes
            if (event.getPresidentJury() != null) {
                variables.put("presidentJury", event.getPresidentJury());
                variables.put("rapporteur1", event.getRapporteur1());
                variables.put("rapporteur2", event.getRapporteur2());
            }

            NotificationType type;
            String subject;
            String template;

            // Déterminer le type de notification selon le nouveau statut
            switch (event.getNewStatus().toUpperCase()) {
                case "PREREQUIS_VALIDES" -> {
                    type = NotificationType.SOUTENANCE_PREREQUIS_VALIDATED;
                    subject = "✅ Prérequis de soutenance validés";
                    template = "soutenance-prerequis-validated";
                }
                case "JURY_PROPOSE" -> {
                    type = NotificationType.SOUTENANCE_JURY_PROPOSED;
                    subject = "Jury de soutenance proposé";
                    template = "soutenance-jury-proposed";
                }
                case "AUTORISEE" -> {
                    type = NotificationType.SOUTENANCE_AUTHORIZED;
                    subject = "🎓 Votre soutenance est autorisée !";
                    template = "soutenance-authorized";
                }
                case "PLANIFIEE" -> {
                    type = NotificationType.SOUTENANCE_SCHEDULED;
                    subject = "📅 Votre soutenance est planifiée";
                    template = "soutenance-scheduled";
                }
                case "TERMINEE" -> {
                    type = NotificationType.SOUTENANCE_COMPLETED;
                    subject = "🎉 Félicitations Docteur !";
                    template = "soutenance-completed";
                }
                default -> {
                    type = NotificationType.SOUTENANCE_CREATED;
                    subject = "Mise à jour de votre demande de soutenance";
                    template = "generic-notification";
                }
            }

            notificationService.createAndSendNotification(
                    type,
                    event.getDoctorantEmail(),
                    event.getDoctorantPrenom() + " " + event.getDoctorantNom(),
                    subject,
                    template,
                    variables,
                    event.getSoutenanceId(),
                    "SOUTENANCE"
            );

            log.info("✅ Notification de changement de statut envoyée pour la soutenance {}", event.getSoutenanceId());

        } catch (Exception e) {
            log.error("❌ Erreur lors du traitement du changement de statut: {}", e.getMessage(), e);
        }
    }

    /**
     * Écoute les invitations de jury
     */
    @KafkaListener(
            topics = KafkaTopics.JURY_INVITATION,
            groupId = "notification-group"
    )
    public void handleJuryInvitation(JuryInvitationEvent event) {
        log.info("📩 Événement reçu: Invitation jury - Membre: {}, Rôle: {}",
                event.getMembreJuryNom(), event.getRoleJury());

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("membreJuryNom", event.getMembreJuryNom());
            variables.put("roleJury", event.getRoleJury());
            variables.put("doctorantNom", event.getDoctorantNom());
            variables.put("sujetThese", event.getSujetThese());
            variables.put("soutenanceId", event.getSoutenanceId());

            if (event.getDateSoutenance() != null) {
                variables.put("dateSoutenance", event.getDateSoutenance().format(DATE_FORMATTER));
                variables.put("lieu", event.getLieu());
                variables.put("salle", event.getSalle());
            }

            String roleLabel = switch (event.getRoleJury().toUpperCase()) {
                case "PRESIDENT" -> "Président du jury";
                case "RAPPORTEUR" -> "Rapporteur";
                case "EXAMINATEUR" -> "Examinateur";
                default -> "Membre du jury";
            };
            variables.put("roleLabel", roleLabel);

            notificationService.createAndSendNotification(
                    NotificationType.JURY_INVITATION,
                    event.getMembreJuryEmail(),
                    event.getMembreJuryNom(),
                    "Invitation à participer à un jury de thèse - " + roleLabel,
                    "jury-invitation",
                    variables,
                    event.getSoutenanceId(),
                    "SOUTENANCE"
            );

            log.info("✅ Invitation jury envoyée à {}", event.getMembreJuryEmail());

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi de l'invitation jury: {}", e.getMessage(), e);
        }
    }
}
