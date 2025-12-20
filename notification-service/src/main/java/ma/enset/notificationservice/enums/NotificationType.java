package ma.enset.notificationservice.enums;

public enum NotificationType {
    // Notifications liées aux inscriptions
    INSCRIPTION_CREATED,           // Nouvelle inscription créée
    INSCRIPTION_SUBMITTED,         // Inscription soumise
    INSCRIPTION_APPROVED,          // Inscription approuvée
    INSCRIPTION_REJECTED,          // Inscription rejetée
    INSCRIPTION_PENDING_VALIDATION, // En attente de validation
    
    // Notifications liées aux réinscriptions
    REINSCRIPTION_REMINDER,        // Rappel de réinscription
    REINSCRIPTION_APPROVED,        // Réinscription approuvée
    
    // Notifications liées aux soutenances
    SOUTENANCE_CREATED,            // Demande de soutenance créée
    SOUTENANCE_PREREQUIS_VALIDATED, // Prérequis validés
    SOUTENANCE_JURY_PROPOSED,      // Jury proposé
    SOUTENANCE_AUTHORIZED,         // Soutenance autorisée
    SOUTENANCE_SCHEDULED,          // Soutenance planifiée
    SOUTENANCE_COMPLETED,          // Soutenance terminée
    SOUTENANCE_REMINDER,           // Rappel de soutenance
    
    // Notifications liées aux rapports
    RAPPORT_SUBMITTED,             // Rapport soumis
    RAPPORT_FAVORABLE,             // Rapport favorable reçu
    RAPPORT_DEFAVORABLE,           // Rapport défavorable reçu
    
    // Notifications générales
    ACCOUNT_CREATED,               // Compte créé
    PASSWORD_RESET,                // Réinitialisation mot de passe
    CAMPAGNE_OPENED,               // Campagne ouverte
    CAMPAGNE_CLOSING_SOON,         // Campagne bientôt fermée
    DOCTORAT_EXPIRING_SOON,        // Doctorat approche de la limite (3 ans ou 6 ans)
    
    // Notifications aux encadrants/jury
    VALIDATION_REQUIRED,           // Validation requise
    JURY_INVITATION                // Invitation au jury
}
