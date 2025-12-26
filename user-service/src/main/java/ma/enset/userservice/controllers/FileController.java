package ma.enset.userservice.controllers;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*") // Important pour éviter les erreurs CORS si le port change
public class FileController {

    // On utilise un chemin relatif pour que ça marche partout (pas seulement sur le PC de HP)
    // Cela doit correspondre au dossier utilisé dans AuthService
    private final Path rootLocation = Paths.get("uploads");

    @GetMapping("/{filename:.+}")
    // ❌ J'ai retiré @PreAuthorize("hasRole('ADMIN')") car le navigateur n'envoie pas le token dans un nouvel onglet
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path file = rootLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                // Détermine le type de contenu (PDF)
                String contentType = "application/pdf";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}