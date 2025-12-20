package ma.enset.inscriptionservice.enums;

/**
 * Statuts possibles d'une demande de dérogation
 */
public enum StatutDerogation {
    
    EN_ATTENTE("En attente de décision"),
    APPROUVEE("Approuvée"),
    REFUSEE("Refusée"),
    EXPIREE("Expirée"),
    ANNULEE("Annulée");

    private final String libelle;

    StatutDerogation(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
