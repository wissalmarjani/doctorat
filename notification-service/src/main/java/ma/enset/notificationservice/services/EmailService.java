package ma.enset.notificationservice.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username:noreply@portail-doctorat.ma}")
    private String fromEmail;

    @Value("${app.mail.from-name:Portail Doctorat}")
    private String fromName;

    /**
     * Envoie un email simple (texte)
     */
    public void sendSimpleEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
            
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, false);
            
            mailSender.send(message);
            log.info("Email simple envoyé à: {}", to);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email à {}: {}", to, e.getMessage());
            throw new RuntimeException("Échec de l'envoi de l'email", e);
        }
    }

    /**
     * Envoie un email HTML basé sur un template Thymeleaf
     */
    public void sendHtmlEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            
            // Traitement du template Thymeleaf
            Context context = new Context();
            context.setVariables(variables);
            String htmlContent = templateEngine.process(templateName, context);
            
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Email HTML envoyé à: {} avec template: {}", to, templateName);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email HTML à {}: {}", to, e.getMessage());
            throw new RuntimeException("Échec de l'envoi de l'email HTML", e);
        }
    }

    /**
     * Envoie un email de manière asynchrone
     */
    @Async("emailExecutor")
    public CompletableFuture<Boolean> sendEmailAsync(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            sendHtmlEmail(to, subject, templateName, variables);
            return CompletableFuture.completedFuture(true);
        } catch (Exception e) {
            log.error("Erreur async lors de l'envoi à {}: {}", to, e.getMessage());
            return CompletableFuture.completedFuture(false);
        }
    }

    /**
     * Envoie un email avec pièce jointe
     */
    public void sendEmailWithAttachment(String to, String subject, String templateName, 
                                         Map<String, Object> variables, byte[] attachment, 
                                         String attachmentName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            
            Context context = new Context();
            context.setVariables(variables);
            String htmlContent = templateEngine.process(templateName, context);
            helper.setText(htmlContent, true);
            
            // Ajout de la pièce jointe
            helper.addAttachment(attachmentName, () -> new java.io.ByteArrayInputStream(attachment));
            
            mailSender.send(message);
            log.info("Email avec pièce jointe envoyé à: {}", to);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email avec pièce jointe à {}: {}", to, e.getMessage());
            throw new RuntimeException("Échec de l'envoi de l'email avec pièce jointe", e);
        }
    }

    /**
     * Vérifie si le service mail est opérationnel
     */
    public boolean isMailServiceHealthy() {
        try {
            mailSender.createMimeMessage();
            return true;
        } catch (Exception e) {
            log.error("Service mail non disponible: {}", e.getMessage());
            return false;
        }
    }
}
