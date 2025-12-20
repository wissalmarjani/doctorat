package ma.enset.inscriptionservice.enums;

/**
 * Types de dérogation possibles pour le doctorat
 */
public enum TypeDerogation {
    
    PROLONGATION_4EME_ANNEE("Prolongation 4ème année", 4),
    PROLONGATION_5EME_ANNEE("Prolongation 5ème année", 5),
    PROLONGATION_6EME_ANNEE("Prolongation 6ème année (dernière)", 6),
    SUSPENSION_TEMPORAIRE("Suspension temporaire", 0),
    AUTRE("Autre motif", 0);

    private final String libelle;
    private final int anneeAutorisee;

    TypeDerogation(String libelle, int anneeAutorisee) {
        this.libelle = libelle;
        this.anneeAutorisee = anneeAutorisee;
    }

    public String getLibelle() {
        return libelle;
    }

    public int getAnneeAutorisee() {
        return anneeAutorisee;
    }

    /**
     * Retourne le type de dérogation nécessaire pour une année donnée
     */
    public static TypeDerogation pourAnnee(int annee) {
        return switch (annee) {
            case 4 -> PROLONGATION_4EME_ANNEE;
            case 5 -> PROLONGATION_5EME_ANNEE;
            case 6 -> PROLONGATION_6EME_ANNEE;
            default -> AUTRE;
        };
    }
}
