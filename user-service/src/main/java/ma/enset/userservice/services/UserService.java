package ma.enset.userservice.services;

import ma.enset.userservice.entities.User;
import ma.enset.userservice.enums.Role;

import java.util.List;
import java.util.Optional;

public interface UserService {

    // CRUD
    User createUser(User user);
    User updateUser(Long id, User user);
    void deleteUser(Long id);

    // Recherche
    Optional<User> getUserById(Long id);
    Optional<User> getUserByUsername(String username);
    Optional<User> getUserByEmail(String email);

    // Listes
    List<User> getAllUsers();
    List<User> getUsersByRole(Role role);
    List<User> getUsersByEtat(String etat);

    // Rôle
    User changeRole(Long id, Role newRole);

    // Workflow Admin
    User validerCandidature(Long id);
    User validerCandidatureAvecDirecteur(Long id, Long directeurId);  // ✅ NOUVEAU
    User refuserCandidature(Long id, String motif);

    // Workflow Directeur
    User validerCandidatureDirecteur(Long id);
    User refuserCandidatureDirecteur(Long id, String motif);
}