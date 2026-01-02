export interface User {
    id?: number;
    matricule: string;
    email: string;
    nom: string;
    prenom: string;
    telephone?: string;
    role: Role;
    enabled: boolean;
    cv?: string;
    diplome?: string;
    lettreMotivation?: string;
    etat: string;
    motifRefus?: string;
    directeurId?: number;
    titreThese?: string;
    dateInscription?: Date;
    anneeThese?: number;
    nbPublications?: number;
    nbConferences?: number;
    heuresFormation?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type Role = 'ADMIN' | 'DOCTORANT' | 'DIRECTEUR_THESE' | 'CANDIDAT';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    matricule: string;
    password: string;
    email: string;
    nom: string;
    prenom: string;
    telephone?: string;
}

export interface AuthResponse {
    token?: string;
    user?: User;
    message?: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}
