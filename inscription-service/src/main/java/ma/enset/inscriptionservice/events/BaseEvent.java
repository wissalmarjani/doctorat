package ma.enset.inscriptionservice.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class BaseEvent {
    
    private String eventId;
    private LocalDateTime timestamp;
    private String source;
    
    public void initializeEvent() {
        if (this.eventId == null) {
            this.eventId = UUID.randomUUID().toString();
        }
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
        if (this.source == null) {
            this.source = "inscription-service";
        }
    }
}
