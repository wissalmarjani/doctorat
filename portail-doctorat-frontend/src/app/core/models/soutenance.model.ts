// ================================================================
// MODÈLE FRONTEND ALIGNÉ AVEC LE BACKEND
// src/app/core/models/soutenance.model.ts
// ================================================================

export interface Soutenance {
  id: number;
  doctorantId: number;
  directeurId: number;

  // Infos thèse
  titreThese: string;       // ← Backend utilise titreThese, pas sujetThese
  resume?: string;
  motsCles?: string;

  // Statut
  statut: StatutSoutenance;

  // Prérequis (embedded)
  prerequis?: Prerequis;

  // Documents
  cheminManuscrit?: string;
  cheminRapportAntiPlagiat?: string;
  cheminRapportPublications?: string;
  cheminAutorisation?: string;

  // Jury - Backend utilise membresJury, pas jury
  membresJury: MembreJury[];

  // Planification
  dateSoutenance?: string;   // LocalDate → string ISO
  heureSoutenance?: string;  // LocalTime → string "HH:mm"
  lieuSoutenance?: string;

  // Résultat
  noteFinale?: number;
  mention?: string;
  felicitationsJury?: boolean;

  // Commentaires
  commentaireDirecteur?: string;
  commentaireAdmin?: string;
  dateAutorisation?: string;

  // Timestamps
  createdAt: string;
  updatedAt?: string;

  // Infos utilisateur (Transient - viennent du UserService via Feign)
  doctorantInfo?: UserDTO;
  directeurInfo?: UserDTO;
}

export interface UserDTO {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role?: string;
  telephone?: string;
}

export interface Prerequis {
  nombreArticlesQ1Q2: number;
  nombreConferences: number;
  heuresFormation: number;
  prerequisValides: boolean;  // ← Backend a ce champ
}

export interface MembreJury {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  etablissement: string;
  grade: string;
  specialite?: string;
  role: RoleJury;           // ← Backend utilise 'role', pas 'roleJury'
  rapportSoumis?: boolean;  // ← Backend utilise rapportSoumis, pas rapportRecu
  avisFavorable?: boolean;  // ← Backend utilise avisFavorable, pas rapportFavorable
  commentaireRapport?: string;
}

export enum StatutSoutenance {
  BROUILLON = 'BROUILLON',
  SOUMIS = 'SOUMIS',
  PREREQUIS_VALIDES = 'PREREQUIS_VALIDES',
  JURY_PROPOSE = 'JURY_PROPOSE',
  AUTORISEE = 'AUTORISEE',
  PLANIFIEE = 'PLANIFIEE',
  TERMINEE = 'TERMINEE',
  REJETEE = 'REJETEE'
}

export enum RoleJury {
  PRESIDENT = 'PRESIDENT',
  RAPPORTEUR = 'RAPPORTEUR',
  EXAMINATEUR = 'EXAMINATEUR',
  DIRECTEUR = 'DIRECTEUR',
  CO_DIRECTEUR = 'CO_DIRECTEUR'
}

export interface CreateSoutenanceRequest {
  doctorantId: number;
  directeurId: number;
  titreThese: string;
  resume?: string;
  prerequis?: {
    nombreArticlesQ1Q2: number;
    nombreConferences: number;
    heuresFormation: number;
  };
}