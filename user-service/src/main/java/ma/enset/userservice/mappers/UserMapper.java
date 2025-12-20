package ma.enset.userservice.mappers;

import ma.enset.userservice.dto.UserDTO;
import ma.enset.userservice.entities.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setRole(user.getRole());
        dto.setEnabled(user.getEnabled());

        return dto;
    }
}