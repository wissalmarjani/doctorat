package ma.enset.notificationservice.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.notificationservice.enums.NotificationType;
import ma.enset.notificationservice.services.EmailService;
import ma.enset.notificationservice.services.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Contrôleur de test pour vérifier le bon fonctionnement du service de notifications
 * À SUPPRIMER ou DÉSACTIVER en production !
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private final EmailService emailService;
    private final NotificationService notificationService;

    /**
     * Test simple pour vérifier que le service est opérationnel
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "notification-service");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        response.put("mailServiceHealthy", emailService.isMailServiceHealthy());
        return ResponseEntity.ok(response);
    }

    /**
     * Test d'envoi d'email simple
     * Exemple: POST /api/test/send-simple-email?to=test@gmail.com
     */
    @PostMapping("/send-simple-email")
    public ResponseEntity<Map<String, Object>> testSimpleEmail(
            @RequestParam String to,
            @RequestParam(defaultValue = "Test Notification Service") String subject,
            @RequestParam(defaultValue = "Ceci est un email de test du Portail Doctorat.") String content) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("🧪 Test d'envoi d'email simple à: {}", to);
            emailService.sendSimpleEmail(to, subject, content);
            response.put("success", true);
            response.put("message", "Email simple envoyé avec succès à " + to);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Échec du test d'email: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Test d'envoi d'email HTML avec template
     * Exemple: POST /api/test/send-template-email?to=test@gmail.com&template=inscription-created
     */
    @PostMapping("/send-template-email")
    public ResponseEntity<Map<String, Object>> testTemplateEmail(
            @RequestParam String to,
            @RequestParam(defaultValue = "inscription-created") String template) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("🧪 Test d'envoi d'email template '{}' à: {}", template, to);

            // Variables de test
            Map<String, Object> variables = new HashMap<>();
            variables.put("doctorantNom", "ALAMI");
            variables.put("doctorantPrenom", "Ahmed");
            variables.put("sujetThese", "Intelligence Artificielle appliquée à la détection de fraudes");
            variables.put("inscriptionId", 12345L);
            variables.put("soutenanceId", 12345L);
            variables.put("campagneNom", "2024-2025");
            variables.put("recipientName", "Ahmed ALAMI");
            variables.put("directeurNom", "Pr. BENANI Mohamed");
            variables.put("dateSoutenance", "15/03/2025 à 14:00");
            variables.put("lieu", "ENSET Mohammedia");
            variables.put("salle", "Salle de Conférence");
            variables.put("presidentJury", "Pr. TAZI Hassan");
            variables.put("rapporteur1", "Pr. CHRAIBI Fatima");
            variables.put("rapporteur2", "Pr. MOUSSAID Karim");
            variables.put("membreJuryNom", "Pr. TAZI Hassan");
            variables.put("roleJury", "PRESIDENT");
            variables.put("roleLabel", "Président du jury");
            variables.put("email", to);
            variables.put("nom", "ALAMI");
            variables.put("prenom", "Ahmed");
            variables.put("role", "DOCTORANT");
            variables.put("commentaire", "Dossier complet et conforme aux exigences.");
            variables.put("oldStatus", "SOUMISE");
            variables.put("newStatus", "VALIDEE");

            String subject = getSubjectForTemplate(template);

            emailService.sendHtmlEmail(to, subject, template, variables);

            response.put("success", true);
            response.put("message", "Email template '" + template + "' envoyé avec succès à " + to);
            response.put("template", template);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Échec du test d'email template: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Test de création de notification complète (sauvegarde en DB + envoi email)
     */
    @PostMapping("/create-notification")
    public ResponseEntity<Map<String, Object>> testCreateNotification(
            @RequestParam String to,
            @RequestParam(defaultValue = "INSCRIPTION_CREATED") String type) {

        Map<String, Object> response = new HashMap<>();

        try {
            log.info("🧪 Test de création de notification {} pour: {}", type, to);

            NotificationType notificationType = NotificationType.valueOf(type);
            String template = notificationService.getTemplateNameForType(notificationType);
            String subject = getSubjectForTemplate(template);

            Map<String, Object> variables = new HashMap<>();
            variables.put("doctorantNom", "ALAMI");
            variables.put("doctorantPrenom", "Ahmed");
            variables.put("sujetThese", "Intelligence Artificielle appliquée");
            variables.put("inscriptionId", 99999L);
            variables.put("campagneNom", "2024-2025");
            variables.put("recipientName", "Ahmed ALAMI");

            var notification = notificationService.createAndSendNotification(
                    notificationType,
                    to,
                    "Ahmed ALAMI",
                    subject,
                    template,
                    variables,
                    99999L,
                    "TEST"
            );

            response.put("success", true);
            response.put("message", "Notification créée et email envoyé");
            response.put("notificationId", notification.getId());
            response.put("status", notification.getStatus().name());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Échec de création de notification: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Liste tous les templates disponibles
     */
    @GetMapping("/templates")
    public ResponseEntity<Map<String, Object>> listTemplates() {
        Map<String, Object> response = new HashMap<>();
        response.put("templates", new String[]{
                "inscription-created",
                "inscription-submitted",
                "inscription-approved",
                "inscription-rejected",
                "inscription-pending",
                "soutenance-created",
                "soutenance-prerequis-validated",
                "soutenance-jury-proposed",
                "soutenance-authorized",
                "soutenance-scheduled",
                "soutenance-completed",
                "jury-invitation",
                "validation-required",
                "account-created",
                "password-reset",
                "generic-notification"
        });
        response.put("notificationTypes", NotificationType.values());
        return ResponseEntity.ok(response);
    }

    private String getSubjectForTemplate(String template) {
        return switch (template) {
            case "inscription-created" -> "Confirmation de création de votre dossier d'inscription";
            case "inscription-submitted" -> "Votre dossier d'inscription a été soumis";
            case "inscription-approved" -> "🎉 Félicitations ! Votre inscription a été approuvée";
            case "inscription-rejected" -> "Information concernant votre dossier d'inscription";
            case "inscription-pending" -> "Votre dossier est en cours de validation";
            case "soutenance-created" -> "Confirmation de votre demande de soutenance";
            case "soutenance-prerequis-validated" -> "✅ Prérequis de soutenance validés";
            case "soutenance-jury-proposed" -> "Jury de soutenance proposé";
            case "soutenance-authorized" -> "🎓 Votre soutenance est autorisée !";
            case "soutenance-scheduled" -> "📅 Votre soutenance est planifiée";
            case "soutenance-completed" -> "🎉 Félicitations Docteur !";
            case "jury-invitation" -> "Invitation à participer à un jury de thèse";
            case "validation-required" -> "Action requise - Validation en attente";
            case "account-created" -> "Bienvenue sur le Portail Doctorat";
            case "password-reset" -> "Réinitialisation de votre mot de passe";
            default -> "Notification - Portail Doctorat";
        };
    }
}