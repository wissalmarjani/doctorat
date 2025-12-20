package ma.enset.inscriptionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.enset.inscriptionservice.enums.TypeDerogation;

/**
 * DTO pour retourner le résultat de la vérification d'éligibilité à la réinscription
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EligibiliteReinscriptionDTO {

    /**
     * Indique si le doctorant est éligible à la réinscription
     */
    private boolean eligible;

    /**
     * Année de doctorat actuelle (1, 2, 3, 4, 5 ou 6)
     */
    private int anneeActuelle;

    /**
     * Prochaine année de doctorat si réinscription
     */
    private int prochaineAnnee;

    /**
     * Indique si une dérogation est requise (au-delà de 3 ans)
     */
    private boolean derogationRequise;

    /**
     * Si dérogation requise, indique si elle a été obtenue
     */
    private boolean derogationObtenue;

    /**
     * Type de dérogation requise (si applicable)
     */
    private TypeDerogation typeDerogationRequise;

    /**
     * Message explicatif pour l'utilisateur
     */
    private String message;

    /**
     * Nombre d'années restantes avant la limite de 6 ans
     */
    private int anneesRestantes;

    /**
     * Indique si le doctorant est en période d'alerte (5ème ou 6ème année)
     */
    private boolean enPeriodeAlerte;
}
