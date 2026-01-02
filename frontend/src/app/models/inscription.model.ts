export interface Inscription {
    id?: number;
    doctorantId: number;
    doctorantNom?: string;
    directeurId?: number;
    campagneId?: number;
    typeInscription: TypeInscription;
    anneeUniversitaire: string;
    anneeThese: number;
    statut: StatutInscription;
    dateSoumission?: Date;
    dateValidationDirecteur?: Date;
    dateValidationAdmin?: Date;
    commentaireDirecteur?: string;
    commentaireAdmin?: string;
    motifRejet?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type TypeInscription = 'PREMIERE_INSCRIPTION' | 'REINSCRIPTION';

export type StatutInscription =
    | 'BROUILLON'
    | 'SOUMIS'
    | 'EN_ATTENTE_DIRECTEUR'
    | 'VALIDE_DIRECTEUR'
    | 'REJETE_DIRECTEUR'
    | 'EN_ATTENTE_ADMIN'
    | 'VALIDE'
    | 'REJETE';

export interface Campagne {
    id?: number;
    titre: string;
    anneeUniversitaire: string;
    dateOuverture: Date;
    dateFermeture: Date;
    active: boolean;
    description?: string;
}

export interface Derogation {
    id?: number;
    doctorantId: number;
    inscriptionId?: number;
    motif: string;
    statut: StatutDerogation;
    dateCreation?: Date;
    dateTraitement?: Date;
    commentaire?: string;
}

export type StatutDerogation = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
