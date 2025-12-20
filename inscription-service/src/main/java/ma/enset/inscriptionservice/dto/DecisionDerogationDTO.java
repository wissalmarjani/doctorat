package ma.enset.inscriptionservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour approuver ou refuser une dérogation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DecisionDerogationDTO {

    @NotNull(message = "L'ID de la dérogation est obligatoire")
    private Long derogationId;

    @NotNull(message = "La décision est obligatoire (true = approuver, false = refuser)")
    private Boolean approuver;

    @NotNull(message = "L'ID du décideur est obligatoire")
    private Long decideurId;

    private String commentaire;
}
