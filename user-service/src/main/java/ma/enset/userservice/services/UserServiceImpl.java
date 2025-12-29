package ma.enset.userservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.userservice.dto.UserDTO;
import ma.enset.userservice.entities.User;
import ma.enset.userservice.enums.Role;
import ma.enset.userservice.mappers.UserMapper;
import ma.enset.userservice.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    // =============================================================
    // CRUD
    // =============================================================

    @Override
    public User createUser(User user) {
        log.info("Creating user: {}", user.getMatricule());

        if (userRepository.existsByMatricule(user.getMatricule())) {
            throw new RuntimeException("Un utilisateur avec ce matricule existe déjà");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà");
        }

        // Encoder le mot de passe
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));

        log.info("📝 Mise à jour de l'utilisateur ID: {}", id);

        // Champs de base
        if (userDetails.getNom() != null) user.setNom(userDetails.getNom());
        if (userDetails.getPrenom() != null) user.setPrenom(userDetails.getPrenom());
        if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
        if (userDetails.getTelephone() != null) user.setTelephone(userDetails.getTelephone());
        if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
        if (userDetails.getEnabled() != null) user.setEnabled(userDetails.getEnabled());

        // ✅ IMPORTANT: Mise à jour des prérequis doctorant
        if (userDetails.getNbPublications() != null) {
            user.setNbPublications(userDetails.getNbPublications());
            log.info("📊 Mise à jour nbPublications: {}", userDetails.getNbPublications());
        }
        if (userDetails.getNbConferences() != null) {
            user.setNbConferences(userDetails.getNbConferences());
            log.info("📊 Mise à jour nbConferences: {}", userDetails.getNbConferences());
        }
        if (userDetails.getHeuresFormation() != null) {
            user.setHeuresFormation(userDetails.getHeuresFormation());
            log.info("📊 Mise à jour heuresFormation: {}", userDetails.getHeuresFormation());
        }

        // Autres champs optionnels
        if (userDetails.getAnneeThese() != null) {
            user.setAnneeThese(userDetails.getAnneeThese());
        }
        if (userDetails.getTitreThese() != null) {
            user.setTitreThese(userDetails.getTitreThese());
        }
        if (userDetails.getDirecteurId() != null) {
            user.setDirecteurId(userDetails.getDirecteurId());
        }

        User savedUser = userRepository.save(user);
        log.info("✅ Utilisateur {} mis à jour avec succès (publications={}, conferences={}, heures={})",
                id, savedUser.getNbPublications(), savedUser.getNbConferences(), savedUser.getHeuresFormation());

        return savedUser;
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé avec l'ID: " + id);
        }
        userRepository.deleteById(id);
    }

    // =============================================================
    // RECHERCHE
    // =============================================================

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByMatricule(username);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // =============================================================
    // LISTES
    // =============================================================

    @Override
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getUsersByEtat(String etat) {
        return userRepository.findByEtat(etat);
    }

    // =============================================================
    // CHANGEMENT DE RÔLE
    // =============================================================

    @Override
    public User changeRole(Long id, Role newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setRole(newRole);
        return userRepository.save(user);
    }

    // =============================================================
    // WORKFLOW ADMIN
    // =============================================================

    @Override
    public User validerCandidature(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!"EN_ATTENTE_ADMIN".equals(user.getEtat())) {
            throw new RuntimeException("Cette candidature n'est pas en attente de validation admin");
        }

        user.setEtat("EN_ATTENTE_DIRECTEUR");
        log.info("✅ Candidature {} validée par admin (sans directeur)", id);
        return userRepository.save(user);
    }

    @Override
    public User validerCandidatureAvecDirecteur(Long id, Long directeurId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));

        if (!"EN_ATTENTE_ADMIN".equals(user.getEtat())) {
            throw new RuntimeException("Cette candidature n'est pas en attente de validation admin. État actuel: " + user.getEtat());
        }

        User directeur = userRepository.findById(directeurId)
                .orElseThrow(() -> new RuntimeException("Directeur non trouvé avec l'ID: " + directeurId));

        if (directeur.getRole() != Role.DIRECTEUR_THESE) {
            throw new RuntimeException("L'utilisateur sélectionné n'est pas un directeur de thèse");
        }

        user.setEtat("EN_ATTENTE_DIRECTEUR");
        user.setDirecteurId(directeurId);

        log.info("✅ Candidature {} validée par admin avec directeur {}", id, directeurId);
        return userRepository.save(user);
    }

    @Override
    public User refuserCandidature(Long id, String motif) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setEtat("REFUSE");
        user.setMotifRefus(motif);

        log.info("❌ Candidature {} refusée par admin. Motif: {}", id, motif);
        return userRepository.save(user);
    }

    // =============================================================
    // WORKFLOW DIRECTEUR
    // =============================================================

    @Override
    public User validerCandidatureDirecteur(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));

        if (!"EN_ATTENTE_DIRECTEUR".equals(user.getEtat())) {
            throw new RuntimeException("Cette candidature n'est pas en attente de validation directeur. État actuel: " + user.getEtat());
        }

        user.setRole(Role.DOCTORANT);
        user.setEtat("VALIDE");
        user.setDateInscription(LocalDateTime.now());
        user.setAnneeThese(1);

        log.info("✅ Candidature {} validée par directeur (sans sujet)", id);
        return userRepository.save(user);
    }

    @Override
    public User validerCandidatureDirecteurAvecSujet(Long id, String sujetThese) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));

        if (!"EN_ATTENTE_DIRECTEUR".equals(user.getEtat())) {
            throw new RuntimeException("Cette candidature n'est pas en attente de validation directeur. État actuel: " + user.getEtat());
        }

        if (sujetThese == null || sujetThese.trim().isEmpty()) {
            throw new RuntimeException("Le sujet de thèse est obligatoire");
        }

        user.setTitreThese(sujetThese.trim());
        user.setRole(Role.DOCTORANT);
        user.setEtat("VALIDE");
        user.setDateInscription(LocalDateTime.now());
        user.setAnneeThese(1);

        User savedUser = userRepository.save(user);

        log.info("✅ Candidature {} validée par directeur", id);
        log.info("   Doctorant: {} {}", user.getNom(), user.getPrenom());
        log.info("   Sujet de thèse: {}", sujetThese);

        return savedUser;
    }

    @Override
    public User refuserCandidatureDirecteur(Long id, String motif) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!"EN_ATTENTE_DIRECTEUR".equals(user.getEtat())) {
            throw new RuntimeException("Cette candidature n'est pas en attente de validation directeur");
        }

        user.setEtat("REFUSE");
        user.setMotifRefus(motif);

        log.info("❌ Candidature {} refusée par directeur. Motif: {}", id, motif);
        return userRepository.save(user);
    }

    // =============================================================
    // GESTION DIRECTEUR - DOCTORANTS
    // =============================================================

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getDoctorantsByDirecteur(Long directeurId) {
        log.info("📋 Récupération des doctorants du directeur: {}", directeurId);

        List<User> doctorants = userRepository.findByDirecteurId(directeurId);

        log.info("✅ {} doctorants trouvés pour le directeur {}", doctorants.size(), directeurId);

        return doctorants.stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }
}