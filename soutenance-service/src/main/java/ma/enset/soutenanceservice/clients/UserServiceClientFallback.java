package ma.enset.soutenanceservice.clients;

import lombok.extern.slf4j.Slf4j;
import ma.enset.soutenanceservice.dto.UserDTO;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class UserServiceClientFallback implements UserServiceClient {

    @Override
    public UserDTO getUserById(Long id) {
        log.warn("Fallback: User Service is unavailable. Returning default user for id: {}", id);
        UserDTO defaultUser = new UserDTO();
        defaultUser.setId(id);
        defaultUser.setNom("INCONNU");
        defaultUser.setPrenom("Service indisponible");
        defaultUser.setEmail("unavailable@service.com");
        return defaultUser;
    }

    @Override
    public UserDTO getUserByUsername(String username) {
        log.warn("Fallback: User Service is unavailable. Returning default user for username: {}", username);
        UserDTO defaultUser = new UserDTO();
        defaultUser.setUsername(username);
        defaultUser.setNom("INCONNU");
        defaultUser.setPrenom("Service indisponible");
        defaultUser.setEmail("unavailable@service.com");
        return defaultUser;
    }
}