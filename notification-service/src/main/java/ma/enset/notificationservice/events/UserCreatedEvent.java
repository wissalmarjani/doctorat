package ma.enset.notificationservice.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserCreatedEvent extends BaseEvent {
    
    private Long userId;
    private String email;
    private String nom;
    private String prenom;
    private String role;
}
