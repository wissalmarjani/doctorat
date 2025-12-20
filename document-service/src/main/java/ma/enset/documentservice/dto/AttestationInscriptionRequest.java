package ma.enset.documentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttestationInscriptionRequest {

    @NotNull(message = "L'ID de l'inscription est obligatoire")
    private Long inscriptionId;

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

    private String laboratoire;

    private String structureRecherche;

    @NotBlank(message = "Le nom du directeur de thèse est obligatoire")
    private String directeurThese;

    private String coDirecteurThese;

    @NotBlank(message = "L'année universitaire est obligatoire")
    private String anneeUniversitaire;

    private LocalDate dateInscription;

    private String numeroInscription;

    private int anneeThese; // 1ère année, 2ème année, etc.

    private String email;
}
