package ma.enset.inscriptionservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.inscriptionservice.dto.EligibiliteReinscriptionDTO;
import ma.enset.inscriptionservice.entities.Inscription;
import ma.enset.inscriptionservice.enums.TypeDerogation;
import ma.enset.inscriptionservice.repositories.DerogationRepository;
import ma.enset.inscriptionservice.repositories.InscriptionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

/**
 * Service pour la gestion des règles temporelles du doctorat.
 * 
 * RÈGLES DU CAHIER DES CHARGES :
 * - Durée normale : 3 ans
 * - Durée maximale : 6 ans
 * - Au-delà de 3 ans : dérogation PED nécessaire
 * - À 6 ans : fin définitive, pas de prolongation possible
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DoctoratDureeService {

    private final InscriptionRepository inscriptionRepository;
    private final DerogationRepository derogationRepository;

    // Constantes du cahier des charges
    public static final int DUREE_NORMALE_ANNEES = 3;
    public static final int DUREE_MAXIMALE_ANNEES = 6;

    /**
     * Calcule l'année de doctorat actuelle du doctorant
     * Basé sur la date de première inscription
     */
    public int calculerAnneeDoctorat(Long doctorantId) {
        // Trouver la première inscription du doctorant
        List<Inscription> inscriptions = inscriptionRepository.findByDoctorantId(doctorantId);
        
        if (inscriptions.isEmpty()) {
            return 0; // Pas encore inscrit
        }

        // Trouver la date de première inscription
        LocalDate datePremiereInscription = inscriptions.stream()
                .filter(i -> i.getDatePremiereInscription() != null)
                .map(Inscription::getDatePremiereInscription)
                .min(LocalDate::compareTo)
                .orElse(null);

        if (datePremiereInscription == null) {
            // Utiliser la date de création de la première inscription
            datePremiereInscription = inscriptions.stream()
                    .map(i -> i.getCreatedAt().toLocalDate())
                    .min(LocalDate::compareTo)
                    .orElse(LocalDate.now());
        }

        // Calculer le nombre d'années depuis la première inscription
        Period period = Period.between(datePremiereInscription, LocalDate.now());
        int annees = period.getYears();
        
        // L'année de doctorat commence à 1
        return annees + 1;
    }

    /**
     * Vérifie si le doctorant peut se réinscrire
     * 
     * @return EligibiliteReinscriptionDTO avec le statut et les détails
     */
    public EligibiliteReinscriptionDTO verifierEligibiliteReinscription(Long doctorantId) {
        int anneeActuelle = calculerAnneeDoctorat(doctorantId);
        int prochaineAnnee = anneeActuelle + 1;

        log.info("🔍 Vérification éligibilité - Doctorant: {}, Année actuelle: {}, Prochaine: {}", 
                doctorantId, anneeActuelle, prochaineAnnee);

        // CAS 1 : Première inscription ou années 1-3 (dans la durée normale)
        if (prochaineAnnee <= DUREE_NORMALE_ANNEES) {
            return EligibiliteReinscriptionDTO.builder()
                    .eligible(true)
                    .anneeActuelle(anneeActuelle)
                    .prochaineAnnee(prochaineAnnee)
                    .derogationRequise(false)
                    .message("Réinscription autorisée (durée normale du doctorat)")
                    .build();
        }

        // CAS 2 : Au-delà de 6 ans - BLOCAGE DÉFINITIF
        if (prochaineAnnee > DUREE_MAXIMALE_ANNEES) {
            return EligibiliteReinscriptionDTO.builder()
                    .eligible(false)
                    .anneeActuelle(anneeActuelle)
                    .prochaineAnnee(prochaineAnnee)
                    .derogationRequise(false)
                    .message("❌ BLOCAGE DÉFINITIF : La durée maximale de 6 ans du doctorat est atteinte. " +
                            "Aucune prolongation n'est possible selon le règlement.")
                    .build();
        }

        // CAS 3 : Années 4, 5 ou 6 - Vérifier si dérogation existe
        boolean hasDerogation = derogationRepository.hasDerogationValide(doctorantId, prochaineAnnee);

        if (hasDerogation) {
            return EligibiliteReinscriptionDTO.builder()
                    .eligible(true)
                    .anneeActuelle(anneeActuelle)
                    .prochaineAnnee(prochaineAnnee)
                    .derogationRequise(true)
                    .derogationObtenue(true)
                    .message("✅ Réinscription autorisée grâce à la dérogation PED approuvée")
                    .build();
        } else {
            TypeDerogation typeRequis = TypeDerogation.pourAnnee(prochaineAnnee);
            return EligibiliteReinscriptionDTO.builder()
                    .eligible(false)
                    .anneeActuelle(anneeActuelle)
                    .prochaineAnnee(prochaineAnnee)
                    .derogationRequise(true)
                    .derogationObtenue(false)
                    .typeDerogationRequise(typeRequis)
                    .message("⚠️ La durée normale de 3 ans est dépassée. " +
                            "Une dérogation PED est requise pour la " + prochaineAnnee + "ème année. " +
                            "Veuillez soumettre une demande de dérogation.")
                    .build();
        }
    }

    /**
     * Vérifie simplement si le doctorant peut se réinscrire (boolean)
     */
    public boolean peutSeReinscrire(Long doctorantId) {
        return verifierEligibiliteReinscription(doctorantId).isEligible();
    }

    /**
     * Retourne le nombre d'années restantes avant la limite
     */
    public int anneesRestantes(Long doctorantId) {
        int anneeActuelle = calculerAnneeDoctorat(doctorantId);
        return Math.max(0, DUREE_MAXIMALE_ANNEES - anneeActuelle);
    }

    /**
     * Vérifie si le doctorant est dans la période d'alerte (5ème ou 6ème année)
     */
    public boolean estEnPeriodeAlerte(Long doctorantId) {
        int annee = calculerAnneeDoctorat(doctorantId);
        return annee >= 5;
    }

    /**
     * Vérifie si le doctorant approche de la fin de la durée normale (3ème année)
     */
    public boolean approcheFinDureeNormale(Long doctorantId) {
        int annee = calculerAnneeDoctorat(doctorantId);
        return annee == 3;
    }

    /**
     * Retourne un message d'alerte approprié selon la situation du doctorant
     */
    public String getMessageAlerte(Long doctorantId) {
        int annee = calculerAnneeDoctorat(doctorantId);

        if (annee < 3) {
            return null; // Pas d'alerte
        }

        if (annee == 3) {
            return "📢 Attention : Vous êtes en 3ème année de doctorat (dernière année de la durée normale). " +
                   "Si vous n'avez pas soutenu à la fin de cette année, une dérogation sera nécessaire pour continuer.";
        }

        if (annee == 4 || annee == 5) {
            int restant = DUREE_MAXIMALE_ANNEES - annee;
            return "⚠️ Alerte : Vous êtes en " + annee + "ème année de doctorat. " +
                   "Il vous reste " + restant + " an(s) avant la limite maximale de 6 ans.";
        }

        if (annee == 6) {
            return "🚨 URGENT : Vous êtes en 6ème et dernière année de doctorat. " +
                   "C'est votre dernière chance de soutenir. Aucune prolongation ne sera possible.";
        }

        return "❌ La durée maximale de 6 ans est dépassée.";
    }
}
