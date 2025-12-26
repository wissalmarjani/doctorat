export interface User {
  id: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role | string;
  enabled: boolean;
  telephone?: string;

  // Documents
  cv?: string;
  diplome?: string;
  lettreMotivation?: string;

  // Workflow
  etat?: EtatCandidature | string;
  motifRefus?: string;

  // ✅ Directeur assigné
  directeurId?: number;

  // Suivi Doctorant
  dateInscription?: string;
  anneeThese?: number;
  nbPublications?: number;
  nbConferences?: number;
  heuresFormation?: number;

  createdAt?: string;
  updatedAt?: string;
}

export enum EtatCandidature {
  EN_ATTENTE_ADMIN = 'EN_ATTENTE_ADMIN',
  EN_ATTENTE_DIRECTEUR = 'EN_ATTENTE_DIRECTEUR',
  VALIDE = 'VALIDE',
  REFUSE = 'REFUSE'
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  telephone: string;
  message: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  DOCTORANT = 'DOCTORANT',
  DIRECTEUR_THESE = 'DIRECTEUR_THESE',
  CANDIDAT = 'CANDIDAT'
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  matricule: string;
  telephone: string;
  email: string;
  password: string;
}

export interface UpdateSuiviRequest {
  anneeThese?: number;
  nbPublications?: number;
  nbConferences?: number;
  heuresFormation?: number;
}