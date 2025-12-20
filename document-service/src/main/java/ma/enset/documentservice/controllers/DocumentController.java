package ma.enset.documentservice.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.documentservice.dto.*;
import ma.enset.documentservice.entities.GeneratedDocument;
import ma.enset.documentservice.enums.DocumentType;
import ma.enset.documentservice.services.DocumentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    private final DocumentService documentService;

    // ==================== GÉNÉRATION DE DOCUMENTS ====================

    /**
     * Générer une attestation d'inscription
     */
    @PostMapping("/attestation-inscription")
    public ResponseEntity<DocumentResponse> generateAttestationInscription(
            @Valid @RequestBody AttestationInscriptionRequest request) {
        log.info("POST /api/documents/attestation-inscription - Inscription ID: {}", request.getInscriptionId());
        DocumentResponse response = documentService.generateAttestationInscription(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Générer une autorisation de soutenance
     */
    @PostMapping("/autorisation-soutenance")
    public ResponseEntity<DocumentResponse> generateAutorisationSoutenance(
            @Valid @RequestBody AutorisationSoutenanceRequest request) {
        log.info("POST /api/documents/autorisation-soutenance - Soutenance ID: {}", request.getSoutenanceId());
        DocumentResponse response = documentService.generateAutorisationSoutenance(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Générer un procès-verbal de soutenance
     */
    @PostMapping("/proces-verbal")
    public ResponseEntity<DocumentResponse> generateProcesVerbal(
            @Valid @RequestBody ProcesVerbalRequest request) {
        log.info("POST /api/documents/proces-verbal - Soutenance ID: {}", request.getSoutenanceId());
        DocumentResponse response = documentService.generateProcesVerbal(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ==================== TÉLÉCHARGEMENT ====================

    /**
     * Télécharger un document par son ID
     */
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        log.info("GET /api/documents/download/{}", id);

        try {
            GeneratedDocument document = documentService.getDocumentById(id)
                    .orElseThrow(() -> new RuntimeException("Document non trouvé"));

            byte[] content = documentService.getDocumentContent(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", document.getFileName());
            headers.setContentLength(content.length);

            return new ResponseEntity<>(content, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Erreur lors du téléchargement du document {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Prévisualiser un document (inline)
     */
    @GetMapping("/preview/{id}")
    public ResponseEntity<byte[]> previewDocument(@PathVariable Long id) {
        log.info("GET /api/documents/preview/{}", id);

        try {
            GeneratedDocument document = documentService.getDocumentById(id)
                    .orElseThrow(() -> new RuntimeException("Document non trouvé"));

            byte[] content = documentService.getDocumentContent(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getFileName() + "\"");
            headers.setContentLength(content.length);

            return new ResponseEntity<>(content, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("Erreur lors de la prévisualisation du document {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // ==================== CONSULTATION ====================

    /**
     * Récupérer un document par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<GeneratedDocument> getDocument(@PathVariable Long id) {
        log.info("GET /api/documents/{}", id);
        return documentService.getDocumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Récupérer tous les documents d'un utilisateur
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GeneratedDocument>> getDocumentsByUser(@PathVariable Long userId) {
        log.info("GET /api/documents/user/{}", userId);
        return ResponseEntity.ok(documentService.getDocumentsByUser(userId));
    }

    /**
     * Récupérer les documents par type
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<GeneratedDocument>> getDocumentsByType(@PathVariable DocumentType type) {
        log.info("GET /api/documents/type/{}", type);
        return ResponseEntity.ok(documentService.getDocumentsByType(type));
    }

    /**
     * Récupérer les documents par référence (inscription ou soutenance)
     */
    @GetMapping("/reference/{type}/{id}")
    public ResponseEntity<List<GeneratedDocument>> getDocumentsByReference(
            @PathVariable String type,
            @PathVariable Long id) {
        log.info("GET /api/documents/reference/{}/{}", type, id);
        return ResponseEntity.ok(documentService.getDocumentsByReference(id, type.toUpperCase()));
    }

    // ==================== STATISTIQUES ====================

    /**
     * Statistiques des documents
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        log.info("GET /api/documents/stats");
        return ResponseEntity.ok(documentService.getStatistics());
    }

    /**
     * Health check
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = Map.of(
                "status", "UP",
                "service", "document-service",
                "timestamp", java.time.LocalDateTime.now().toString()
        );
        return ResponseEntity.ok(health);
    }
}
