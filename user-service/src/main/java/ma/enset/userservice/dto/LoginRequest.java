package ma.enset.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la requête de login
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Le nom d'utilisateur ou email est obligatoire")
    private String username;  // Peut être username ou email

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;
}
