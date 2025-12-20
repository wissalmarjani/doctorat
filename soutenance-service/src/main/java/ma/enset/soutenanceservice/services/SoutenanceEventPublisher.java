package ma.enset.soutenanceservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.soutenanceservice.config.KafkaTopics;
import ma.enset.soutenanceservice.entities.MembreJury;
import ma.enset.soutenanceservice.entities.Soutenance;
import ma.enset.soutenanceservice.events.JuryInvitationEvent;
import ma.enset.soutenanceservice.events.SoutenanceCreatedEvent;
import ma.enset.soutenanceservice.events.SoutenanceStatusChangedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class SoutenanceEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publie un événement de création de soutenance
     */
    public void publishSoutenanceCreated(SoutenanceCreatedEvent event) {
        event.initializeEvent();
        log.info("📤 Publication événement SOUTENANCE_CREATED - ID: {}, Doctorant: {} {}",
                event.getSoutenanceId(), event.getDoctorantPrenom(), event.getDoctorantNom());

        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                KafkaTopics.SOUTENANCE_CREATED,
                String.valueOf(event.getSoutenanceId()),
                event
        );

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("✅ Événement SOUTENANCE_CREATED publié - Partition: {}, Offset: {}",
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            } else {
                log.error("❌ Échec publication SOUTENANCE_CREATED: {}", ex.getMessage(), ex);
            }
        });
    }

    /**
     * Publie un événement de changement de statut
     */
    public void publishSoutenanceStatusChanged(SoutenanceStatusChangedEvent event) {
        event.initializeEvent();
        log.info("📤 Publication événement SOUTENANCE_STATUS_CHANGED - ID: {}, {} -> {}",
                event.getSoutenanceId(), event.getOldStatus(), event.getNewStatus());

        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                KafkaTopics.SOUTENANCE_STATUS_CHANGED,
                String.valueOf(event.getSoutenanceId()),
                event
        );

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("✅ Événement SOUTENANCE_STATUS_CHANGED publié");
            } else {
                log.error("❌ Échec publication: {}", ex.getMessage(), ex);
            }
        });
    }

    /**
     * Publie un événement de planification de soutenance
     */
    public void publishSoutenanceScheduled(SoutenanceStatusChangedEvent event) {
        event.initializeEvent();
        log.info("📤 Publication événement SOUTENANCE_SCHEDULED - ID: {}, Date: {}",
                event.getSoutenanceId(), event.getDateSoutenance());

        kafkaTemplate.send(KafkaTopics.SOUTENANCE_SCHEDULED, String.valueOf(event.getSoutenanceId()), event);
    }

    /**
     * Publie une invitation pour un membre du jury
     */
    public void publishJuryInvitation(JuryInvitationEvent event) {
        event.initializeEvent();
        log.info("📤 Publication événement JURY_INVITATION - Membre: {}, Rôle: {}",
                event.getMembreJuryNom(), event.getRoleJury());

        kafkaTemplate.send(KafkaTopics.JURY_INVITATION, String.valueOf(event.getSoutenanceId()), event);
    }

    /**
     * Publie des invitations pour tous les membres du jury d'une soutenance
     */
    public void publishAllJuryInvitations(Soutenance soutenance, String doctorantNom, List<MembreJury> membresJury) {
        log.info("📤 Publication invitations pour {} membres du jury - Soutenance ID: {}", 
                membresJury.size(), soutenance.getId());

        for (MembreJury membre : membresJury) {
            JuryInvitationEvent event = JuryInvitationEvent.builder()
                    .soutenanceId(soutenance.getId())
                    .membreJuryEmail(membre.getEmail())
                    .membreJuryNom(membre.getNom() + " " + membre.getPrenom())
                    .roleJury(membre.getRole().name())  // RoleJury enum -> String
                    .doctorantNom(doctorantNom)
                    .sujetThese(soutenance.getSujetThese())
                    .dateSoutenance(soutenance.getDateSoutenance())
                    .lieu(soutenance.getLieu())
                    .salle(soutenance.getSalle())
                    .build();

            publishJuryInvitation(event);
        }
    }
}
