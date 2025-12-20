package ma.enset.notificationservice.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class BaseEvent {
    
    private String eventId;
    private LocalDateTime timestamp;
    private String source; // Service qui a émis l'événement
    
    public BaseEvent(String source) {
        this.eventId = java.util.UUID.randomUUID().toString();
        this.timestamp = LocalDateTime.now();
        this.source = source;
    }
}
