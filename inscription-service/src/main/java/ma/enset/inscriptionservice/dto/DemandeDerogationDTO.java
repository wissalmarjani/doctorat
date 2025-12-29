package ma.enset.inscriptionservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.enset.inscriptionservice.enums.TypeDerogation;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DemandeDerogationDTO {

    @NotNull(message = "L'ID du doctorant est obligatoire")
    private Long doctorantId;

    // Optionnel - si non fourni, on récupère le directeur depuis le profil du doctorant
    private Long directeurId;

    @NotNull(message = "Le type de dérogation est obligatoire")
    private TypeDerogation typeDerogation;

    @NotBlank(message = "Le motif est obligatoire")
    private String motif;
}