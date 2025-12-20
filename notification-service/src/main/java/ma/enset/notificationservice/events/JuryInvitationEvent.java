package ma.enset.notificationservice.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class JuryInvitationEvent extends BaseEvent {
    
    private Long soutenanceId;
    private String membreJuryEmail;
    private String membreJuryNom;
    private String roleJury; // PRESIDENT, RAPPORTEUR, EXAMINATEUR
    private String doctorantNom;
    private String sujetThese;
    private LocalDateTime dateSoutenance;
    private String lieu;
    private String salle;
}
