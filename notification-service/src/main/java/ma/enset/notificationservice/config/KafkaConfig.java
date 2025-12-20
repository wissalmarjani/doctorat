package ma.enset.notificationservice.config;

import ma.enset.notificationservice.events.*;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableKafka
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id:notification-group}")
    private String groupId;

    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class.getName());
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "ma.enset.*");
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, Object.class.getName());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setConcurrency(3);
        return factory;
    }

    // Factory spécifique pour InscriptionCreatedEvent
    @Bean
    public ConsumerFactory<String, InscriptionCreatedEvent> inscriptionCreatedConsumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        JsonDeserializer<InscriptionCreatedEvent> deserializer = new JsonDeserializer<>(InscriptionCreatedEvent.class);
        deserializer.setRemoveTypeHeaders(false);
        deserializer.addTrustedPackages("ma.enset.*");
        deserializer.setUseTypeMapperForKey(true);
        
        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, InscriptionCreatedEvent> inscriptionCreatedKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, InscriptionCreatedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(inscriptionCreatedConsumerFactory());
        return factory;
    }

    // Factory spécifique pour InscriptionStatusChangedEvent
    @Bean
    public ConsumerFactory<String, InscriptionStatusChangedEvent> inscriptionStatusConsumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        JsonDeserializer<InscriptionStatusChangedEvent> deserializer = new JsonDeserializer<>(InscriptionStatusChangedEvent.class);
        deserializer.setRemoveTypeHeaders(false);
        deserializer.addTrustedPackages("ma.enset.*");
        deserializer.setUseTypeMapperForKey(true);
        
        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, InscriptionStatusChangedEvent> inscriptionStatusKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, InscriptionStatusChangedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(inscriptionStatusConsumerFactory());
        return factory;
    }

    // Factory spécifique pour SoutenanceCreatedEvent
    @Bean
    public ConsumerFactory<String, SoutenanceCreatedEvent> soutenanceCreatedConsumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        JsonDeserializer<SoutenanceCreatedEvent> deserializer = new JsonDeserializer<>(SoutenanceCreatedEvent.class);
        deserializer.setRemoveTypeHeaders(false);
        deserializer.addTrustedPackages("ma.enset.*");
        deserializer.setUseTypeMapperForKey(true);
        
        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, SoutenanceCreatedEvent> soutenanceCreatedKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, SoutenanceCreatedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(soutenanceCreatedConsumerFactory());
        return factory;
    }

    // Factory spécifique pour SoutenanceStatusChangedEvent
    @Bean
    public ConsumerFactory<String, SoutenanceStatusChangedEvent> soutenanceStatusConsumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        JsonDeserializer<SoutenanceStatusChangedEvent> deserializer = new JsonDeserializer<>(SoutenanceStatusChangedEvent.class);
        deserializer.setRemoveTypeHeaders(false);
        deserializer.addTrustedPackages("ma.enset.*");
        deserializer.setUseTypeMapperForKey(true);
        
        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, SoutenanceStatusChangedEvent> soutenanceStatusKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, SoutenanceStatusChangedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(soutenanceStatusConsumerFactory());
        return factory;
    }
}
