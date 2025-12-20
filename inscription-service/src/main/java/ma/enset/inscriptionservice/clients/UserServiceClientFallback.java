package ma.enset.inscriptionservice.clients;

import lombok.extern.slf4j.Slf4j;
import ma.enset.inscriptionservice.dto.UserDTO;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class UserServiceClientFallback implements UserServiceClient {

    @Override
    public UserDTO getUserById(Long id) {
        log.warn("⚠️ Fallback: User Service indisponible pour getUserById({})", id);
        return UserDTO.builder()
                .id(id)
                .nom("Utilisateur")
                .prenom("Inconnu")
                .email("user" + id + "@fallback.ma")
                .build();
    }
}