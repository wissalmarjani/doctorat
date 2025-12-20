package ma.enset.notificationservice.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SoutenanceCreatedEvent extends BaseEvent {
    
    private Long soutenanceId;
    private Long doctorantId;
    private String doctorantEmail;
    private String doctorantNom;
    private String doctorantPrenom;
    private String sujetThese;
    private String directeurTheseEmail;
    private String directeurTheseNom;
    private String status;
}
