package ma.enset.soutenanceservice.controllers;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/soutenances/files")
@CrossOrigin(origins = "*")
@Slf4j
public class SoutenanceFileController {

    // Dossier racine des uploads (relatif au répertoire de travail du service)
    private final Path rootLocation = Paths.get("uploads/soutenances");

    /**
     * Télécharger un fichier par son nom
     * URL: GET /api/soutenances/files/{filename}
     * Exemple: /api/soutenances/files/manuscrit_123_1703123456.pdf
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        log.info("📥 Demande de téléchargement du fichier: {}", filename);
        return serveFile(filename);
    }

    /**
     * Télécharger un fichier via query param (pour les chemins complexes)
     * URL: GET /api/soutenances/files/download?path=uploads/soutenances/xxx.pdf
     */
    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam("path") String filePath) {
        log.info("📥 Demande de téléchargement via path: {}", filePath);

        // Décoder l'URL si nécessaire
        String decodedPath = URLDecoder.decode(filePath, StandardCharsets.UTF_8);

        // Extraire juste le nom du fichier si c'est un chemin complet
        String filename = extractFilename(decodedPath);

        return serveFile(filename);
    }

    /**
     * Méthode commune pour servir un fichier
     */
    private ResponseEntity<Resource> serveFile(String filename) {
        try {
            // Nettoyer le nom de fichier (enlever le chemin si présent)
            String cleanFilename = extractFilename(filename);

            // Résoudre le chemin
            Path file = rootLocation.resolve(cleanFilename).normalize();
            log.info("📂 Chemin résolu: {}", file.toAbsolutePath());

            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(cleanFilename);

                log.info("✅ Fichier trouvé: {} (type: {})", cleanFilename, contentType);

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                log.warn("❌ Fichier non trouvé ou non lisible: {}", file.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            log.error("❌ URL malformée pour le fichier: {}", filename, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Extraire le nom de fichier d'un chemin complet
     * "uploads/soutenances/manuscrit_123.pdf" → "manuscrit_123.pdf"
     */
    private String extractFilename(String path) {
        if (path == null || path.isEmpty()) {
            return path;
        }

        // Remplacer les backslashes par des slashes
        path = path.replace("\\", "/");

        // Si le chemin contient "uploads/soutenances/", extraire juste le nom
        if (path.contains("uploads/soutenances/")) {
            return path.substring(path.lastIndexOf("uploads/soutenances/") + "uploads/soutenances/".length());
        }

        // Sinon, prendre juste le dernier segment
        int lastSlash = path.lastIndexOf("/");
        if (lastSlash >= 0) {
            return path.substring(lastSlash + 1);
        }

        return path;
    }

    /**
     * Déterminer le type MIME du fichier
     */
    private String determineContentType(String filename) {
        if (filename == null) return "application/octet-stream";

        String lower = filename.toLowerCase();

        if (lower.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lower.endsWith(".doc")) {
            return "application/msword";
        } else if (lower.endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (lower.endsWith(".png")) {
            return "image/png";
        } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        } else {
            return "application/octet-stream";
        }
    }
}