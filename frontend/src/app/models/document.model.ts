export interface DocumentMetadata {
    id?: number;
    nom: string;
    type: string;
    userId: number;
    createdAt: Date;
}

export interface Document {
    id?: number;
    fileName: string;
    fileType: string;
    documentType: DocumentType;
    userId?: number;
    referenceId?: number;
    referenceType?: string;
    createdAt?: Date;
}

export type DocumentType =
    | 'ATTESTATION_INSCRIPTION'
    | 'AUTORISATION_SOUTENANCE'
    | 'PROCES_VERBAL'
    | 'CV'
    | 'DIPLOME'
    | 'LETTRE_MOTIVATION'
    | 'MANUSCRIT'
    | 'RAPPORT_ANTI_PLAGIAT';

export interface UploadedDocument {
    id?: number;
    nomFichier: string;
    typeFichier: string;
    taille: number;
    data?: any;
    createdAt?: Date;
}

export interface AttestationInscriptionRequest {
    inscriptionId: number;
    userId: number;
    format?: string;
}

export interface AutorisationSoutenanceRequest {
    soutenanceId: number;
    userId: number;
    format?: string;
}

export interface ProcesVerbalRequest {
    soutenanceId: number;
    userId: number;
    format?: string;
}

export interface DocumentResponse {
    id: number;
    fileName: string;
    message: string;
}

export interface DocumentStats {
    totalDocuments: number;
    byType: { [key: string]: number };
    recentDocuments: Document[];
}
