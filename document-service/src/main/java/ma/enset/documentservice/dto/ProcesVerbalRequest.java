package ma.enset.documentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcesVerbalRequest {

    @NotNull(message = "L'ID de la soutenance est obligatoire")
    private Long soutenanceId;

    @NotNull(message = "L'ID du doctorant est obligatoire")
    private Long doctorantId;

    @NotBlank(message = "Le nom du doctorant est obligatoire")
    private String nomDoctorant;

    @NotBlank(message = "Le prénom du doctorant est obligatoire")
    private String prenomDoctorant;

    private String cin;

    private LocalDate dateNaissance;

    private String lieuNaissance;

    @NotBlank(message = "Le sujet de thèse est obligatoire")
    private String sujetThese;

    private String specialite;

    @NotBlank(message = "Le nom du directeur de thèse est obligatoire")
    private String directeurThese;

    private String coDirecteurThese;

    // Informations de la soutenance
    @NotNull(message = "La date de soutenance est obligatoire")
    private LocalDateTime dateSoutenance;

    @NotBlank(message = "Le lieu de soutenance est obligatoire")
    private String lieuSoutenance;

    private String salleSoutenance;

    // Composition du jury
    private List<MembreJuryPvDto> membresJury;

    // Résultat de la soutenance
    @NotBlank(message = "La mention est obligatoire")
    private String mention; // TRES_HONORABLE, HONORABLE, PASSABLE

    private boolean avecFelicitations;

    private String observations;

    // Informations du PV
    private String numeroPv;

    private LocalDate datePv;

    private String email;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MembreJuryPvDto {
        private String nom;
        private String prenom;
        private String titre;
        private String etablissement;
        private String role;
        private boolean present;
        private String signature; // Base64 de la signature si disponible
    }
}
