// =====================================================
// CAMPAGNE
// =====================================================

export interface Campagne {
  id: number;
  titre: string;
  anneeUniversitaire: string;
  description?: string;
  dateOuverture: string;  // Format: yyyy-MM-dd
  dateFermeture: string;  // Format: yyyy-MM-dd
  active: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Aliases pour compatibilité (si l'API renvoie ces noms)
  dateDebut?: string;
  dateFin?: string;
}

// =====================================================
// INSCRIPTION
// =====================================================

export type StatutInscription =
    | 'BROUILLON'
    | 'EN_ATTENTE_ADMIN'
    | 'EN_ATTENTE_DIRECTEUR'
    | 'ADMIS'
    | 'REJETE_ADMIN'
    | 'REJETE_DIRECTEUR';

export type TypeInscription =
    | 'PREMIERE_INSCRIPTION'
    | 'REINSCRIPTION';

export interface Inscription {
  id: number;
  doctorantId: number;
  directeurId?: number;
  campagne?: Campagne;
  campagneId?: number;
  typeInscription: TypeInscription;
  statut: StatutInscription;
  sujetThese: string;
  laboratoireAccueil?: string;
  collaborationExterne?: string;
  anneeInscription?: number;
  datePremiereInscription?: string;

  // Workflow validation
  commentaireDirecteur?: string;
  commentaireAdmin?: string;
  dateValidationDirecteur?: string;
  dateValidationAdmin?: string;

  // Audit
  createdAt?: string;
  updatedAt?: string;

  // Enrichissement frontend (données jointes)
  doctorant?: any;
  directeur?: any;
}

// =====================================================
// DOCUMENT
// =====================================================

export interface Document {
  id: number;
  inscriptionId: number;
  typeDocument: string;
  nomFichier: string;
  cheminFichier: string;
  tailleFichier?: number;
  createdAt?: string;
}

// =====================================================
// DTOs
// =====================================================

export interface CreateInscriptionDTO {
  doctorantId: number;
  directeurId?: number;
  campagne?: { id: number };
  typeInscription: TypeInscription;
  sujetThese: string;
  laboratoireAccueil?: string;
  collaborationExterne?: string;
  anneeInscription?: number;
}

export interface CreateCampagneDTO {
  titre: string;
  anneeUniversitaire: string;
  description?: string;
  dateOuverture: string;
  dateFermeture: string;
  active?: boolean;
}

// =====================================================
// ELIGIBILITE REINSCRIPTION
// =====================================================

export interface EligibiliteReinscription {
  eligible: boolean;
  anneeActuelle: number;
  prochaineAnnee: number;
  derogationRequise: boolean;
  derogationObtenue: boolean;
  typeDerogationRequise?: string;
  message: string;
  anneesRestantes: number;
  enPeriodeAlerte: boolean;
}