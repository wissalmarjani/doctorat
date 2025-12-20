package ma.enset.documentservice.enums;

public enum DocumentType {
    ATTESTATION_INSCRIPTION("Attestation d'inscription"),
    ATTESTATION_REINSCRIPTION("Attestation de réinscription"),
    AUTORISATION_SOUTENANCE("Autorisation de soutenance"),
    CONVOCATION_JURY("Convocation membre du jury"),
    PROCES_VERBAL_SOUTENANCE("Procès-verbal de soutenance"),
    ATTESTATION_REUSSITE("Attestation de réussite"),
    RELEVE_NOTES_FORMATION("Relevé de notes formation doctorale");

    private final String label;

    DocumentType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
