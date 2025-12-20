package ma.enset.inscriptionservice.config;

public final class KafkaTopics {
    
    public static final String INSCRIPTION_CREATED = "inscription-created";
    public static final String INSCRIPTION_STATUS_CHANGED = "inscription-status-changed";
    public static final String INSCRIPTION_SUBMITTED = "inscription-submitted";
    public static final String REINSCRIPTION_REMINDER = "reinscription-reminder";
    
    private KafkaTopics() {
    }
}
