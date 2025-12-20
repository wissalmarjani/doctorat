package ma.enset.soutenanceservice.clients;

import ma.enset.soutenanceservice.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "USER-SERVICE", fallback = UserServiceClientFallback.class)
public interface UserServiceClient {

    @GetMapping("/api/users/{id}/dto")
    UserDTO getUserById(@PathVariable Long id);

    @GetMapping("/api/users/username/{username}/dto")
    UserDTO getUserByUsername(@PathVariable String username);
}