export interface Inscription {
  id: number;
  doctorantId: number;
  directeurId?: number;

  // ✅ CORRECTION : Utilisation de l'interface Campagne définie plus bas
  campagne?: Campagne;

  sujetThese: string;
  laboratoireAccueil: string;
  collaborationExterne?: string;

  statut: StatutInscription;
  typeInscription: TypeInscription;

  // ✅ CORRECTION : Ajouté car utilisé dans inscription-detail.component.html
  anneeInscription?: number;
  datePremiereInscription?: string;

  commentaireDirecteur?: string;
  commentaireAdmin?: string;

  // Champs optionnels pour l'affichage (hydratés par le UserService)
  doctorantNom?: string;
  doctorantPrenom?: string;

  createdAt: string;
  updatedAt?: string;
}

// ✅ CORRECTION : L'interface Campagne était manquante
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

  // ✅ IMPORTANT : Je remets 'SOUMIS' pour éviter les erreurs dans vos anciens composants.
  // Vous devrez progressivement remplacer 'SOUMIS' par 'EN_ATTENTE_ADMIN' dans vos fichiers.
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