export interface Soutenance {
    id?: number;
    titre: string;
    doctorantId: number;
    doctorantNom?: string;
    directeurId: number;
    statut: StatutSoutenance;
    dateDemande?: Date;
    manuscrit?: string;
    rapportAntiPlagiat?: string;
    autorisation?: string;
    dateSoutenance?: Date;
    heureSoutenance?: string;
    lieuSoutenance?: string;
    note?: number;
    mention?: string;
    felicitations?: boolean;
    commentaireDirecteur?: string;
    commentaireAdmin?: string;
    motifRejet?: string;
    membresJury?: MembreJury[];
    createdAt?: Date;
    updatedAt?: Date;
}

export type StatutSoutenance =
    | 'BROUILLON'
    | 'SOUMIS'
    | 'PREREQUIS_VALIDES'
    | 'PREREQUIS_REJETES'
    | 'AUTORISE'
    | 'JURY_PROPOSE'
    | 'JURY_VALIDE'
    | 'JURY_REFUSE'
    | 'PLANIFIE'
    | 'PLANIFICATION_REFUSEE'
    | 'SOUTENUE'
    | 'AJOURNE';

export interface MembreJury {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    etablissement: string;
    role: RoleJury;
    avisFavorable?: boolean;
    commentaire?: string;
    rapportSoumis?: boolean;
}

export type RoleJury =
    | 'PRESIDENT'
    | 'RAPPORTEUR'
    | 'EXAMINATEUR'
    | 'DIRECTEUR_THESE'
    | 'CO_DIRECTEUR';

export interface JuryDisponible {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    etablissement: string;
    specialite?: string;
    grade?: string;
    rolesDisponibles: RoleJury[];
}

export interface PlanificationRequest {
    dateSoutenance: string;
    heureSoutenance: string;
    lieuSoutenance: string;
}

export interface ResultatRequest {
    note?: number;
    mention?: string;
    felicitations?: boolean;
}
