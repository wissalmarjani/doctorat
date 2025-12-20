package ma.enset.soutenanceservice.enums;

public enum StatutSoutenance {
    BROUILLON,              // En cours de saisie
    SOUMIS,                 // Soumis par le doctorant
    PREREQUIS_VALIDES,      // Prérequis vérifiés et validés
    JURY_PROPOSE,           // Jury proposé par le directeur
    AUTORISEE,              // Autorisée par l'administration
    PLANIFIEE,              // Date et lieu fixés
    TERMINEE,               // Soutenance effectuée
    REJETEE                 // Rejetée
}