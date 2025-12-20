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
public class SoutenanceStatusChangedEvent extends BaseEvent {
    
    private Long soutenanceId;
    private Long doctorantId;
    private String doctorantEmail;
    private String doctorantNom;
    private String doctorantPrenom;
    private String sujetThese;
    private String oldStatus;
    private String newStatus;
    
    // Informations de planification (si soutenance planifiée)
    private LocalDateTime dateSoutenance;
    private String lieu;
    private String salle;
    
    // Informations du jury (si jury proposé)
    private String presidentJury;
    private String rapporteur1;
    private String rapporteur2;
    
    private String commentaire;
}
