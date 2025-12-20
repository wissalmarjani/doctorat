package ma.enset.notificationservice.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.notificationservice.entities.Notification;
import ma.enset.notificationservice.enums.NotificationStatus;
import ma.enset.notificationservice.enums.NotificationType;
import ma.enset.notificationservice.repositories.NotificationRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    /**
     * Crée et envoie une notification
     */
    @Transactional
    public Notification createAndSendNotification(NotificationType type, String recipientEmail,
                                                   String recipientName, String subject,
                                                   String templateName, Map<String, Object> variables,
                                                   Long referenceId, String referenceType) {
        // Créer la notification
        Notification notification = Notification.builder()
                .type(type)
                .status(NotificationStatus.PENDING)
                .recipientEmail(recipientEmail)
                .recipientName(recipientName)
                .subject(subject)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();

        try {
            // Sérialiser les métadonnées
            notification.setMetadata(objectMapper.writeValueAsString(variables));
        } catch (Exception e) {
            log.warn("Impossible de sérialiser les métadonnées: {}", e.getMessage());
        }

        notification = notificationRepository.save(notification);

        // Envoyer l'email
        sendNotificationEmail(notification, templateName, variables);

        return notification;
    }

    /**
     * Envoie l'email pour une notification
     */
    @Async("notificationExecutor")
    public void sendNotificationEmail(Notification notification, String templateName, Map<String, Object> variables) {
        try {
            // Ajouter des variables communes
            Map<String, Object> enrichedVariables = new HashMap<>(variables);
            enrichedVariables.put("recipientName", notification.getRecipientName());
            enrichedVariables.put("notificationType", notification.getType().name());

            emailService.sendHtmlEmail(
                    notification.getRecipientEmail(),
                    notification.getSubject(),
                    templateName,
                    enrichedVariables
            );

            // Mettre à jour le statut
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);

            log.info("Notification {} envoyée avec succès à {}", notification.getId(), notification.getRecipientEmail());

        } catch (Exception e) {
            log.error("Échec de l'envoi de la notification {}: {}", notification.getId(), e.getMessage());
            notification.setStatus(NotificationStatus.FAILED);
            notification.setRetryCount(notification.getRetryCount() + 1);
            notification.setErrorMessage(e.getMessage());
            notificationRepository.save(notification);
        }
    }

    /**
     * Réessayer les notifications échouées (max 3 tentatives)
     */
    @Scheduled(fixedRate = 300000) // Toutes les 5 minutes
    @Transactional
    public void retryFailedNotifications() {
        List<Notification> failedNotifications = notificationRepository.findFailedNotificationsToRetry();

        for (Notification notification : failedNotifications) {
            log.info("Réessai de la notification {}, tentative {}", notification.getId(), notification.getRetryCount() + 1);

            try {
                Map<String, Object> variables = new HashMap<>();
                if (notification.getMetadata() != null) {
                    variables = objectMapper.readValue(notification.getMetadata(), Map.class);
                }

                String templateName = getTemplateNameForType(notification.getType());
                sendNotificationEmail(notification, templateName, variables);

            } catch (Exception e) {
                log.error("Échec du réessai pour la notification {}: {}", notification.getId(), e.getMessage());
            }
        }
    }

    /**
     * Obtenir le nom du template en fonction du type de notification
     */
    public String getTemplateNameForType(NotificationType type) {
        return switch (type) {
            case INSCRIPTION_CREATED -> "inscription-created";
            case INSCRIPTION_SUBMITTED -> "inscription-submitted";
            case INSCRIPTION_APPROVED -> "inscription-approved";
            case INSCRIPTION_REJECTED -> "inscription-rejected";
            case INSCRIPTION_PENDING_VALIDATION -> "inscription-pending";
            case SOUTENANCE_CREATED -> "soutenance-created";
            case SOUTENANCE_PREREQUIS_VALIDATED -> "soutenance-prerequis-validated";
            case SOUTENANCE_JURY_PROPOSED -> "soutenance-jury-proposed";
            case SOUTENANCE_AUTHORIZED -> "soutenance-authorized";
            case SOUTENANCE_SCHEDULED -> "soutenance-scheduled";
            case SOUTENANCE_COMPLETED -> "soutenance-completed";
            case JURY_INVITATION -> "jury-invitation";
            case VALIDATION_REQUIRED -> "validation-required";
            case ACCOUNT_CREATED -> "account-created";
            case PASSWORD_RESET -> "password-reset";
            default -> "generic-notification";
        };
    }

    /**
     * Récupérer les notifications par email
     */
    public List<Notification> getNotificationsByEmail(String email) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    /**
     * Récupérer une notification par ID
     */
    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    /**
     * Récupérer les notifications par référence
     */
    public List<Notification> getNotificationsByReference(Long referenceId, String referenceType) {
        return notificationRepository.findByReferenceIdAndReferenceType(referenceId, referenceType);
    }

    /**
     * Statistiques des notifications
     */
    public Map<String, Long> getNotificationStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("pending", notificationRepository.countByStatus(NotificationStatus.PENDING));
        stats.put("sent", notificationRepository.countByStatus(NotificationStatus.SENT));
        stats.put("failed", notificationRepository.countByStatus(NotificationStatus.FAILED));
        stats.put("today", notificationRepository.countNotificationsSince(LocalDateTime.now().toLocalDate().atStartOfDay()));
        return stats;
    }

    /**
     * Récupérer toutes les notifications
     */
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    /**
     * Récupérer les notifications par statut
     */
    public List<Notification> getNotificationsByStatus(NotificationStatus status) {
        return notificationRepository.findByStatus(status);
    }
}
