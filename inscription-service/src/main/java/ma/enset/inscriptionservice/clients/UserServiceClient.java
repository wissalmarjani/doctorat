package ma.enset.inscriptionservice.clients;

import ma.enset.inscriptionservice.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "USER-SERVICE", fallback = UserServiceClientFallback.class)
public interface UserServiceClient {

    @GetMapping("/api/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);

    /**
     * Récupérer tous les doctorants d'un directeur
     */
    @GetMapping("/api/users/directeur/{directeurId}/doctorants")
    List<UserDTO> getDoctorantsByDirecteur(@PathVariable("directeurId") Long directeurId);
}