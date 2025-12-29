package ma.enset.inscriptionservice.enums;

public enum StatutDerogation {
    EN_ATTENTE_DIRECTEUR,   // Étape 1: En attente validation directeur
    EN_ATTENTE_ADMIN,       // Étape 2: Validé par directeur, en attente admin
    EN_ATTENTE,             // Legacy - pour compatibilité
    APPROUVEE,              // Approuvée par admin
    REFUSEE,                // Refusée (par directeur ou admin)
    EXPIREE,                // Dérogation expirée
    ANNULEE                 // Annulée par le doctorant
}