package ma.enset.notificationservice.consumers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.notificationservice.config.KafkaTopics;
import ma.enset.notificationservice.enums.NotificationType;
import ma.enset.notificationservice.events.InscriptionCreatedEvent;
import ma.enset.notificationservice.events.InscriptionStatusChangedEvent;
import ma.enset.notificationservice.services.NotificationService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class InscriptionEventConsumer {

    private final NotificationService notificationService;

    /**
     * Écoute les événements de création d'inscription
     */
    @KafkaListener(
            topics = KafkaTopics.INSCRIPTION_CREATED,
            groupId = "notification-group",
            containerFactory = "inscriptionCreatedKafkaListenerContainerFactory"
    )
    public void handleInscriptionCreated(InscriptionCreatedEvent event) {
        log.info("📩 Événement reçu: Inscription créée - ID: {}, Doctorant: {} {}",
                event.getInscriptionId(), event.getDoctorantPrenom(), event.getDoctorantNom());

        try {
            // Notification au doctorant
            Map<String, Object> variables = new HashMap<>();
            variables.put("doctorantNom", event.getDoctorantNom());
            variables.put("doctorantPrenom", event.getDoctorantPrenom());
            variables.put("sujetThese", event.getSujetThese());
            variables.put("campagneNom", event.getCampagneNom());
            variables.put("inscriptionId", event.getInscriptionId());

            notificationService.createAndSendNotification(
                    NotificationType.INSCRIPTION_CREATED,
                    event.getDoctorantEmail(),
                    event.getDoctorantPrenom() + " " + event.getDoctorantNom(),
                    "Confirmation de création de votre dossier d'inscription",
                    "inscription-created",
                    variables,
                    event.getInscriptionId(),
                    "INSCRIPTION"
            );

            // Notification au directeur de thèse (si présent)
            if (event.getDirecteurTheseEmail() != null && !event.getDirecteurTheseEmail().isEmpty()) {
                Map<String, Object> directorVariables = new HashMap<>(variables);
                directorVariables.put("directeurNom", event.getDirecteurTheseNom());

                notificationService.createAndSendNotification(
                        NotificationType.VALIDATION_REQUIRED,
                        event.getDirecteurTheseEmail(),
                        event.getDirecteurTheseNom(),
                        "Nouvelle demande d'inscription à valider",
                        "validation-required",
                        directorVariables,
                        event.getInscriptionId(),
                        "INSCRIPTION"
                );
            }

            log.info("✅ Notifications envoyées pour l'inscription {}", event.getInscriptionId());

        } catch (Exception e) {
            log.error("❌ Erreur lors du traitement de l'événement InscriptionCreated: {}", e.getMessage(), e);
        }
    }

    /**
     * Écoute les changements de statut d'inscription
     */
    @KafkaListener(
            topics = KafkaTopics.INSCRIPTION_STATUS_CHANGED,
            groupId = "notification-group",
            containerFactory = "inscriptionStatusKafkaListenerContainerFactory"
    )
    public void handleInscriptionStatusChanged(InscriptionStatusChangedEvent event) {
        log.info("📩 Événement reçu: Statut inscription changé - ID: {}, {} -> {}",
                event.getInscriptionId(), event.getOldStatus(), event.getNewStatus());

        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("doctorantNom", event.getDoctorantNom());
            variables.put("doctorantPrenom", event.getDoctorantPrenom());
            variables.put("sujetThese", event.getSujetThese());
            variables.put("oldStatus", event.getOldStatus());
            variables.put("newStatus", event.getNewStatus());
            variables.put("commentaire", event.getCommentaire());
            variables.put("inscriptionId", event.getInscriptionId());

            NotificationType type;
            String subject;
            String template;

            // Déterminer le type de notification selon le nouveau statut
            switch (event.getNewStatus().toUpperCase()) {
                case "APPROVED", "VALIDEE" -> {
                    type = NotificationType.INSCRIPTION_APPROVED;
                    subject = "🎉 Félicitations ! Votre inscription a été approuvée";
                    template = "inscription-approved";
                }
                case "REJECTED", "REJETEE" -> {
                    type = NotificationType.INSCRIPTION_REJECTED;
                    subject = "Information concernant votre dossier d'inscription";
                    template = "inscription-rejected";
                }
                case "SUBMITTED", "SOUMISE" -> {
                    type = NotificationType.INSCRIPTION_SUBMITTED;
                    subject = "Votre dossier d'inscription a été soumis";
                    template = "inscription-submitted";
                }
                case "PENDING_VALIDATION", "EN_ATTENTE_VALIDATION" -> {
                    type = NotificationType.INSCRIPTION_PENDING_VALIDATION;
                    subject = "Votre dossier est en cours de validation";
                    template = "inscription-pending";
                }
                default -> {
                    type = NotificationType.INSCRIPTION_SUBMITTED;
                    subject = "Mise à jour de votre dossier d'inscription";
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
                    event.getInscriptionId(),
                    "INSCRIPTION"
            );

            log.info("✅ Notification de changement de statut envoyée pour l'inscription {}", event.getInscriptionId());

        } catch (Exception e) {
            log.error("❌ Erreur lors du traitement du changement de statut: {}", e.getMessage(), e);
        }
    }
}
