package ma.enset.inscriptionservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.enset.inscriptionservice.enums.TypeDerogation;

/**
 * DTO pour créer une demande de dérogation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeDerogationDTO {

    @NotNull(message = "L'ID du doctorant est obligatoire")
    private Long doctorantId;

    @NotNull(message = "Le type de dérogation est obligatoire")
    private TypeDerogation typeDerogation;

    @NotBlank(message = "Le motif est obligatoire")
    private String motif;
}
