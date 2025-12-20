package ma.enset.inscriptionservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.inscriptionservice.config.KafkaTopics;
import ma.enset.inscriptionservice.events.InscriptionCreatedEvent;
import ma.enset.inscriptionservice.events.InscriptionStatusChangedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class InscriptionEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publie un événement de création d'inscription
     */
    public void publishInscriptionCreated(InscriptionCreatedEvent event) {
        event.initializeEvent();
        log.info("📤 Publication événement INSCRIPTION_CREATED - ID: {}, Doctorant: {} {}",
                event.getInscriptionId(), event.getDoctorantPrenom(), event.getDoctorantNom());

        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                KafkaTopics.INSCRIPTION_CREATED,
                String.valueOf(event.getInscriptionId()),
                event
        );

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("✅ Événement INSCRIPTION_CREATED publié - Partition: {}, Offset: {}",
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            } else {
                log.error("❌ Échec publication INSCRIPTION_CREATED: {}", ex.getMessage(), ex);
            }
        });
    }

    /**
     * Publie un événement de changement de statut
     */
    public void publishInscriptionStatusChanged(InscriptionStatusChangedEvent event) {
        event.initializeEvent();
        log.info("📤 Publication événement INSCRIPTION_STATUS_CHANGED - ID: {}, {} -> {}",
                event.getInscriptionId(), event.getOldStatus(), event.getNewStatus());

        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                KafkaTopics.INSCRIPTION_STATUS_CHANGED,
                String.valueOf(event.getInscriptionId()),
                event
        );

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("✅ Événement INSCRIPTION_STATUS_CHANGED publié");
            } else {
                log.error("❌ Échec publication: {}", ex.getMessage(), ex);
            }
        });
    }

    /**
     * Publie un événement de soumission d'inscription
     */
    public void publishInscriptionSubmitted(InscriptionStatusChangedEvent event) {
        event.initializeEvent();
        log.info("📤 Publication événement INSCRIPTION_SUBMITTED - ID: {}", event.getInscriptionId());

        kafkaTemplate.send(KafkaTopics.INSCRIPTION_SUBMITTED, String.valueOf(event.getInscriptionId()), event);
    }
}
