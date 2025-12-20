package ma.enset.notificationservice.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.notificationservice.entities.Notification;
import ma.enset.notificationservice.enums.NotificationStatus;
import ma.enset.notificationservice.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Récupérer toutes les notifications
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        log.info("GET /api/notifications - Récupération de toutes les notifications");
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    /**
     * Récupérer une notification par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable Long id) {
        log.info("GET /api/notifications/{} - Récupération de la notification", id);
        return notificationService.getNotificationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Récupérer les notifications par email du destinataire
     */
    @GetMapping("/recipient/{email}")
    public ResponseEntity<List<Notification>> getNotificationsByRecipient(@PathVariable String email) {
        log.info("GET /api/notifications/recipient/{} - Récupération par destinataire", email);
        return ResponseEntity.ok(notificationService.getNotificationsByEmail(email));
    }

    /**
     * Récupérer les notifications par statut
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Notification>> getNotificationsByStatus(@PathVariable NotificationStatus status) {
        log.info("GET /api/notifications/status/{} - Récupération par statut", status);
        return ResponseEntity.ok(notificationService.getNotificationsByStatus(status));
    }

    /**
     * Récupérer les notifications par référence (inscription ou soutenance)
     */
    @GetMapping("/reference/{type}/{id}")
    public ResponseEntity<List<Notification>> getNotificationsByReference(
            @PathVariable String type,
            @PathVariable Long id) {
        log.info("GET /api/notifications/reference/{}/{} - Récupération par référence", type, id);
        return ResponseEntity.ok(notificationService.getNotificationsByReference(id, type.toUpperCase()));
    }

    /**
     * Statistiques des notifications
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getNotificationStats() {
        log.info("GET /api/notifications/stats - Récupération des statistiques");
        return ResponseEntity.ok(notificationService.getNotificationStats());
    }

    /**
     * Réessayer manuellement l'envoi des notifications échouées
     */
    @PostMapping("/retry-failed")
    public ResponseEntity<String> retryFailedNotifications() {
        log.info("POST /api/notifications/retry-failed - Réessai des notifications échouées");
        notificationService.retryFailedNotifications();
        return ResponseEntity.ok("Réessai des notifications échouées lancé");
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = Map.of(
                "status", "UP",
                "service", "notification-service",
                "stats", notificationService.getNotificationStats()
        );
        return ResponseEntity.ok(health);
    }
}
