package ma.enset.inscriptionservice.enums;

public enum StatutInscription {
    BROUILLON,              // Créé mais pas envoyé
    EN_ATTENTE_ADMIN,       // 1. Soumis par le candidat, en attente de l'Admin
    EN_ATTENTE_DIRECTEUR,   // 2. Validé par Admin, en attente du Directeur
    ADMIS,                  // 3. Validé par Directeur (Le candidat devient Doctorant)

    REJETE_ADMIN,           // Refusé par l'Admin (Fin de parcours ou modification requise)
    REJETE_DIRECTEUR        // Refusé par le Directeur (Fin de parcours ou modification requise)
}