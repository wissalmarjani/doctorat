package ma.enset.userservice.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.userservice.dto.*;
import ma.enset.userservice.services.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200") // Soyez spécifique sur l'origine
public class AuthController {

    private final AuthService authService;
    private final ObjectMapper objectMapper;

    /**
     * INSCRIPTION SIMPLE (JSON)
     */
    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("📝 Inscription JSON pour matricule: {}", request.getMatricule());
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    AuthResponse.builder().message(e.getMessage()).build()
            );
        }
    }

    /**
     * ✅ INSCRIPTION AVEC FICHIERS (Multipart)
     * Correction : "candidat" doit correspondre au formData.append('candidat', ...) du Frontend
     */
    @PostMapping(value = "/register-with-files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AuthResponse> registerWithFiles(
            @RequestPart("candidat") String userJson, // ⚠️ Changé de "data" à "candidat"
            @RequestPart("cv") MultipartFile cv,
            @RequestPart("diplome") MultipartFile diplome,
            @RequestPart(value = "lettre", required = false) MultipartFile lettre
    ) throws IOException {

        log.info("📎 Inscription multipart reçue");

        // 1. Désérialisation du JSON
        RegisterRequest request = objectMapper.readValue(userJson, RegisterRequest.class);
        log.info("   - Candidat: {}", request.getMatricule());
        log.info("   - CV Taille: {}", cv.getSize());

        // 2. Appel du service
        AuthResponse response = authService.registerWithFiles(request, cv, diplome, lettre);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * CONNEXION
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("🔐 Connexion pour: {}", request.getUsername());
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    AuthResponse.builder().message(e.getMessage()).build()
            );
        }
    }

    /**
     * PROFIL
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(authService.getCurrentUser(userDetails.getUsername()));
    }

    /**
     * CHANGER MOT DE PASSE
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(Map.of("message", "Mot de passe changé avec succès"));
    }

    /**
     * VALIDER TOKEN
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "username", authentication.getName(),
                    "authorities", authentication.getAuthorities()
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false));
    }

    /**
     * LOGOUT
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
    }
}