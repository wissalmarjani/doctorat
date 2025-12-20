package ma.enset.notificationservice.config;

public final class KafkaTopics {
    
    private KafkaTopics() {
        // Utility class
    }
    
    // Topics pour les inscriptions
    public static final String INSCRIPTION_CREATED = "inscription-created";
    public static final String INSCRIPTION_STATUS_CHANGED = "inscription-status-changed";
    public static final String INSCRIPTION_SUBMITTED = "inscription-submitted";
    
    // Topics pour les soutenances
    public static final String SOUTENANCE_CREATED = "soutenance-created";
    public static final String SOUTENANCE_STATUS_CHANGED = "soutenance-status-changed";
    public static final String SOUTENANCE_SCHEDULED = "soutenance-scheduled";
    public static final String JURY_INVITATION = "jury-invitation";
    
    // Topics pour les utilisateurs
    public static final String USER_CREATED = "user-created";
    public static final String PASSWORD_RESET = "password-reset";
    
    // Topics pour les campagnes
    public static final String CAMPAGNE_OPENED = "campagne-opened";
    public static final String CAMPAGNE_CLOSING = "campagne-closing";
    
    // Topic général de notifications
    public static final String NOTIFICATION_SEND = "notification-send";
}
