package ma.enset.userservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.userservice.entities.User;
import ma.enset.userservice.enums.Role;
import ma.enset.userservice.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User createUser(User user) {
        log.info("Creating user: {}", user.getUsername());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getEtat() == null) user.setEtat("EN_ATTENTE_ADMIN");
        return userRepository.save(user);
    }

    @Override
    public User updateUser(Long id, User user) {
        log.info("Updating user with id: {}", id);

        return userRepository.findById(id)
                .map(existingUser -> {
                    if (user.getEmail() != null) existingUser.setEmail(user.getEmail());
                    if (user.getNom() != null) existingUser.setNom(user.getNom());
                    if (user.getPrenom() != null) existingUser.setPrenom(user.getPrenom());
                    if (user.getRole() != null) existingUser.setRole(user.getRole());
                    if (user.getEnabled() != null) existingUser.setEnabled(user.getEnabled());
                    if (user.getTelephone() != null) existingUser.setTelephone(user.getTelephone());
                    if (user.getEtat() != null) existingUser.setEtat(user.getEtat());
                    if (user.getMotifRefus() != null) existingUser.setMotifRefus(user.getMotifRefus());
                    if (user.getDirecteurId() != null) existingUser.setDirecteurId(user.getDirecteurId());

                    // Suivi doctorant
                    if (user.getAnneeThese() != null) existingUser.setAnneeThese(user.getAnneeThese());
                    if (user.getNbPublications() != null) existingUser.setNbPublications(user.getNbPublications());
                    if (user.getNbConferences() != null) existingUser.setNbConferences(user.getNbConferences());
                    if (user.getHeuresFormation() != null) existingUser.setHeuresFormation(user.getHeuresFormation());

                    if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                        existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
                    }

                    return userRepository.save(existingUser);
                })
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    // ========================================================
    // WORKFLOW ADMIN
    // ========================================================

    @Override
    public User validerCandidature(Long id) {
        log.info("Validation candidature par Admin (sans directeur) - user id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setEtat("EN_ATTENTE_DIRECTEUR");
        return userRepository.save(user);
    }

    @Override
    public User validerCandidatureAvecDirecteur(Long id, Long directeurId) {
        log.info("Validation candidature par Admin - user id: {} avec directeur: {}", id, directeurId);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier que le directeur existe
        if (directeurId != null) {
            User directeur = userRepository.findById(directeurId)
                    .orElseThrow(() -> new RuntimeException("Directeur non trouvé avec l'id: " + directeurId));

            if (directeur.getRole() != Role.DIRECTEUR_THESE) {
                throw new RuntimeException("L'utilisateur sélectionné n'est pas un Directeur de Thèse");
            }

            user.setDirecteurId(directeurId);
        }

        user.setEtat("EN_ATTENTE_DIRECTEUR");
        return userRepository.save(user);
    }

    @Override
    public User refuserCandidature(Long id, String motif) {
        log.info("Refus candidature par Admin - user id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setEtat("REFUSE");
        user.setMotifRefus(motif);
        return userRepository.save(user);
    }

    // ========================================================
    // WORKFLOW DIRECTEUR DE THÈSE
    // ========================================================

    @Override
    public User validerCandidatureDirecteur(Long id) {
        log.info("Validation Directeur pour user id: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (!"EN_ATTENTE_DIRECTEUR".equals(user.getEtat())) {
            throw new RuntimeException("Ce candidat n'est pas en attente de validation par le directeur. État actuel: " + user.getEtat());
        }

        user.setEtat("VALIDE");
        user.setRole(Role.DOCTORANT);
        user.setDateInscription(LocalDateTime.now());
        user.setAnneeThese(1);

        return userRepository.save(user);
    }

    @Override
    public User refuserCandidatureDirecteur(Long id, String motif) {
        log.info("Refus candidature par Directeur - user id: {} avec motif: {}", id, motif);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id: " + id));

        if (!"EN_ATTENTE_DIRECTEUR".equals(user.getEtat())) {
            throw new RuntimeException("Ce candidat n'est pas en attente de validation par le directeur. État actuel: " + user.getEtat());
        }

        user.setEtat("REFUSE");
        user.setMotifRefus(motif);

        return userRepository.save(user);
    }

    // ========================================================
    // AUTRES MÉTHODES
    // ========================================================

    @Override
    public User changeRole(Long id, Role newRole) {
        log.info("Changement de rôle pour user {}: {}", id, newRole);
        return userRepository.findById(id).map(user -> {
            user.setRole(newRole);
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    @Override
    public void deleteUser(Long id) {
        log.info("Deleting user with id: {}", id);
        userRepository.deleteById(id);
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByMatricule(username);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getUsersByRole(Role role) {
        log.info("Fetching users with role: {}", role);
        return userRepository.findByRole(role);
    }

    @Override
    public List<User> getUsersByEtat(String etat) {
        log.info("Fetching users with etat: {}", etat);
        return userRepository.findByEtat(etat);
    }
}