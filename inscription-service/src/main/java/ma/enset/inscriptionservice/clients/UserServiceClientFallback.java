package ma.enset.inscriptionservice.clients;

import ma.enset.inscriptionservice.dto.UserDTO;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class UserServiceClientFallback implements UserServiceClient {

    @Override
    public UserDTO getUserById(Long id) {
        // Retourne un UserDTO vide en cas d'erreur
        return UserDTO.builder()
                .id(id)
                .nom("Utilisateur")
                .prenom("Inconnu")
                .email("inconnu@example.com")
                .build();
    }

    @Override
    public List<UserDTO> getDoctorantsByDirecteur(Long directeurId) {
        // Retourne une liste vide en cas d'erreur
        return Collections.emptyList();
    }
}