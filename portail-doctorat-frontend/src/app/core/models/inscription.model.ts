export interface Inscription {
  id: number;
  doctorantId: number;
  directeurId?: number;

  campagne?: Campagne;

  sujetThese: string;
  laboratoireAccueil: string;
  collaborationExterne?: string;

  statut: StatutInscription;
  typeInscription: TypeInscription;

  anneeInscription?: number;
  datePremiereInscription?: string;

  commentaireDirecteur?: string;
  commentaireAdmin?: string;

  // Champs optionnels pour l'affichage (hydratés par le backend ou le service)
  doctorantNom?: string;
  doctorantPrenom?: string;
  directeurNom?: string;
  directeurPrenom?: string;

  createdAt: string;
  updatedAt?: string;
}

export interface Campagne {
  id: number;
  titre: string;
  anneeUniversitaire: string;
  dateDebut: string;
  dateFin: string;
  active: boolean;
  description?: string;
}

export enum StatutInscription {
  BROUILLON = 'BROUILLON',
  SOUMIS = 'SOUMIS',
  EN_ATTENTE_ADMIN = 'EN_ATTENTE_ADMIN',
  EN_ATTENTE_DIRECTEUR = 'EN_ATTENTE_DIRECTEUR',
  ADMIS = 'ADMIS',
  REJETE_ADMIN = 'REJETE_ADMIN',
  REJETE_DIRECTEUR = 'REJETE_DIRECTEUR'
}

export enum TypeInscription {
  PREMIERE_INSCRIPTION = 'PREMIERE_INSCRIPTION',
  REINSCRIPTION = 'REINSCRIPTION'
}