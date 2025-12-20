package ma.enset.inscriptionservice.enums;

public enum StatutInscription {
    BROUILLON,           // En cours de saisie
    SOUMIS,              // Soumis par le doctorant
    VALIDE_DIRECTEUR,    // Validé par le directeur de thèse
    VALIDE_ADMIN,        // Validé par l'administration (inscrit)
    REJETE_DIRECTEUR,    // Rejeté par le directeur
    REJETE_ADMIN         // Rejeté par l'admin
}