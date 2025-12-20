package ma.enset.inscriptionservice.events;

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
public class InscriptionStatusChangedEvent extends BaseEvent {
    
    private Long inscriptionId;
    private Long doctorantId;
    private String doctorantEmail;
    private String doctorantNom;
    private String doctorantPrenom;
    private String oldStatus;
    private String newStatus;
    private String sujetThese;
    private String commentaire;
    private String validatedBy;
}
