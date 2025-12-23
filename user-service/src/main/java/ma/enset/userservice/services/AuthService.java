package ma.enset.userservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.userservice.dto.*;
import ma.enset.userservice.entities.User;
import ma.enset.userservice.enums.Role;
import ma.enset.userservice.repositories.UserRepository;
import ma.enset.userservice.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private static final String UPLOAD_DIR = "uploads";

    /* =====================================================
       INSCRIPTION SIMPLE (JSON)
       ===================================================== */
    public AuthResponse register(RegisterRequest request) {
        return processRegistration(request);
    }

    /* =====================================================
       INSCRIPTION AVEC FICHIERS (multipart/form-data)
       ===================================================== */
    public AuthResponse registerWithFiles(
            RegisterRequest request,
            MultipartFile cv,
            MultipartFile diplome,
            MultipartFile lettre
    ) {
        log.info("📂 Inscription avec fichiers pour matricule: {}", request.getMatricule());

        // 1️⃣ Création utilisateur + JWT
        AuthResponse response = processRegistration(request);
        Long userId = response.getUserId();

        // 2️⃣ Traitement des fichiers
        try {
            if (cv != null && !cv.isEmpty()) {
                saveFile(cv, userId, "CV");
            }
            if (diplome != null && !diplome.isEmpty()) {
                saveFile(diplome, userId, "DIPLOME");
            }
            if (lettre != null && !lettre.isEmpty()) {
                saveFile(lettre, userId, "LETTRE");
            }
        } catch (IOException e) {
            log.error("❌ Erreur fichiers", e);
            throw new RuntimeException("Erreur lors de l'enregistrement des fichiers");
        }

        return response;
    }

    /* =====================================================
       LOGIQUE COMMUNE DE CREATION UTILISATEUR
       ===================================================== */
    private AuthResponse processRegistration(RegisterRequest request) {

        log.info("📝 Création compte : {}", request.getMatricule());

        if (userRepository.existsByMatricule(request.getMatricule())) {
            throw new RuntimeException("Ce matricule existe déjà");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        User user = new User();
        user.setMatricule(request.getMatricule());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setTelephone(request.getTelephone());
        user.setRole(Role.CANDIDAT);
        user.setEnabled(true);

        User savedUser = userRepository.save(user);
        log.info("✅ Utilisateur créé : {}", savedUser.getMatricule());

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(savedUser.getMatricule());

        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .userId(savedUser.getId())
                .username(savedUser.getMatricule())
                .email(savedUser.getEmail())
                .nom(savedUser.getNom())
                .prenom(savedUser.getPrenom())
                .role(savedUser.getRole())
                .message("Inscription réussie")
                .build();
    }

    /* =====================================================
       SAUVEGARDE DES FICHIERS (DISQUE LOCAL)
       ===================================================== */
    private void saveFile(MultipartFile file, Long userId, String type) throws IOException {

        Path userDir = Paths.get(UPLOAD_DIR, String.valueOf(userId));
        Files.createDirectories(userDir);

        String filename = type + "_" + file.getOriginalFilename();
        Path destination = userDir.resolve(filename);

        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        log.info("📄 {} sauvegardé : {}", type, destination);
    }

    /* =====================================================
       LOGIN (Matricule OU Email)
       ===================================================== */
    public AuthResponse login(LoginRequest request) {

        String loginInput = request.getUsername();
        log.info("🔐 Tentative de connexion : {}", loginInput);

        User user = userRepository.findByMatricule(loginInput)
                .orElseGet(() -> userRepository.findByEmail(loginInput)
                        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé")));

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getMatricule(),
                            request.getPassword()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String accessToken = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtExpiration / 1000)
                    .userId(user.getId())
                    .username(user.getMatricule())
                    .email(user.getEmail())
                    .nom(user.getNom())
                    .prenom(user.getPrenom())
                    .role(user.getRole())
                    .message("Connexion réussie")
                    .build();

        } catch (BadCredentialsException e) {
            throw new RuntimeException("Identifiant ou mot de passe incorrect");
        }
    }

    /* =====================================================
       REFRESH TOKEN
       ===================================================== */
    public AuthResponse refreshToken(String refreshToken) {

        if (!jwtService.validateToken(refreshToken)) {
            throw new RuntimeException("Token invalide");
        }

        String matricule = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByMatricule(matricule)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(matricule);

        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(userDetails))
                .refreshToken(jwtService.generateRefreshToken(userDetails))
                .tokenType("Bearer")
                .expiresIn(jwtExpiration / 1000)
                .userId(user.getId())
                .username(user.getMatricule())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole())
                .build();
    }

    /* =====================================================
       CHANGER MOT DE PASSE
       ===================================================== */
    public void changePassword(String matricule, ChangePasswordRequest request) {

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Les mots de passe ne correspondent pas");
        }

        User user = userRepository.findByMatricule(matricule)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Ancien mot de passe incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /* =====================================================
       PROFIL UTILISATEUR CONNECTÉ
       ===================================================== */
    public UserDTO getCurrentUser(String matricule) {

        User user = userRepository.findByMatricule(matricule)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return UserDTO.builder()
                .id(user.getId())
                .username(user.getMatricule())
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole().name())
                .build();
    }
}
