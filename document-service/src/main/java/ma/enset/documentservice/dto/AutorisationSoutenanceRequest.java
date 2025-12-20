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
public class AutorisationSoutenanceRequest {

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

    private LocalDate datePremiereInscription;

    private String laboratoire;

    private String structureRecherche;

    // Informations du jury
    private List<MembreJuryDto> membresJury;

    // Date et lieu de soutenance
    private LocalDateTime dateSoutenance;

    private String lieuSoutenance;

    private String salleSoutenance;

    private String numeroAutorisation;

    private LocalDate dateAutorisation;

    private String email;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MembreJuryDto {
        private String nom;
        private String prenom;
        private String titre; // Pr., Dr., etc.
        private String etablissement;
        private String role; // PRESIDENT, RAPPORTEUR, EXAMINATEUR, DIRECTEUR
        private String email;
    }
}
