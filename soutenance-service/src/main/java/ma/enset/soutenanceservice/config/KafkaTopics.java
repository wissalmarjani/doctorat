package ma.enset.soutenanceservice.config;

public final class KafkaTopics {
    
    public static final String SOUTENANCE_CREATED = "soutenance-created";
    public static final String SOUTENANCE_STATUS_CHANGED = "soutenance-status-changed";
    public static final String SOUTENANCE_SCHEDULED = "soutenance-scheduled";
    public static final String JURY_INVITATION = "jury-invitation";
    
    private KafkaTopics() {
    }
}
