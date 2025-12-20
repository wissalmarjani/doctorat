package ma.enset.notificationservice.enums;

public enum NotificationStatus {
    PENDING,    // En attente d'envoi
    SENT,       // Envoyée avec succès
    FAILED,     // Échec d'envoi
    RETRY       // En attente de réessai
}
