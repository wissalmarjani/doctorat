package ma.enset.notificationservice.entities;

import jakarta.persistence.*;
import lombok.*;
import ma.enset.notificationservice.enums.NotificationStatus;
import ma.enset.notificationservice.enums.NotificationType;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;

    @Column(nullable = false)
    private String recipientEmail;

    private String recipientName;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    // Référence vers l'entité concernée (inscription, soutenance, etc.)
    private Long referenceId;

    private String referenceType; // "INSCRIPTION", "SOUTENANCE", "USER"

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime sentAt;

    private int retryCount;

    private String errorMessage;

    // Métadonnées supplémentaires en JSON
    @Column(columnDefinition = "TEXT")
    private String metadata;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = NotificationStatus.PENDING;
        }
        retryCount = 0;
    }
}
