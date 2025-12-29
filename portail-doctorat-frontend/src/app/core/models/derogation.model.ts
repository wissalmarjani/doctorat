export interface Derogation {
  id: number;
  doctorantId: number;
  directeurId?: number;
  typeDerogation: TypeDerogation;
  statut: StatutDerogation;
  motif: string;
  anneeDemandee: number;

  // Dates
  dateDemande: string;
  dateValidationDirecteur?: string;
  dateDecision?: string;
  dateExpiration?: string;
  createdAt: string;

  // Validation directeur
  commentaireDirecteur?: string;
  valideParDirecteur?: boolean;

  // Décision admin
  decideParId?: number;
  commentaireDecision?: string;

  // Infos enrichies (transient)
  doctorantNom?: string;
  doctorantPrenom?: string;
  doctorantEmail?: string;
  directeurNom?: string;
  directeurPrenom?: string;
}

export interface EligibiliteReinscription {
  eligible: boolean;
  anneeActuelle: number;
  prochaineAnnee: number;
  derogationRequise: boolean;
  derogationObtenue: boolean;
  typeDerogationRequise?: TypeDerogation;
  message: string;
  anneesRestantes: number;
  enPeriodeAlerte: boolean;
}

export interface DemandeDerogationRequest {
  doctorantId: number;
  directeurId?: number;  // Optionnel pour compatibilité avec l'ancien workflow
  typeDerogation: TypeDerogation;
  motif: string;
}

export interface DecisionDerogationRequest {
  derogationId: number;
  approuver: boolean;
  decideurId: number;
  commentaire?: string;
}

export enum TypeDerogation {
  PROLONGATION_4EME_ANNEE = 'PROLONGATION_4EME_ANNEE',
  PROLONGATION_5EME_ANNEE = 'PROLONGATION_5EME_ANNEE',
  PROLONGATION_6EME_ANNEE = 'PROLONGATION_6EME_ANNEE',
  SUSPENSION_TEMPORAIRE = 'SUSPENSION_TEMPORAIRE',
  AUTRE = 'AUTRE'
}

export enum StatutDerogation {
  EN_ATTENTE_DIRECTEUR = 'EN_ATTENTE_DIRECTEUR',
  EN_ATTENTE_ADMIN = 'EN_ATTENTE_ADMIN',
  EN_ATTENTE = 'EN_ATTENTE',  // Legacy
  APPROUVEE = 'APPROUVEE',
  REFUSEE = 'REFUSEE',
  EXPIREE = 'EXPIREE',
  ANNULEE = 'ANNULEE'
}

// Helper pour obtenir l'étape du workflow
export function getEtapeWorkflow(statut: StatutDerogation): number {
  switch (statut) {
    case StatutDerogation.EN_ATTENTE_DIRECTEUR:
    case StatutDerogation.EN_ATTENTE:
      return 1;
    case StatutDerogation.EN_ATTENTE_ADMIN:
      return 2;
    case StatutDerogation.APPROUVEE:
    case StatutDerogation.REFUSEE:
    case StatutDerogation.EXPIREE:
    case StatutDerogation.ANNULEE:
      return 3;
    default:
      return 1;
  }
}

// Helper pour obtenir le label du statut
export function getStatutLabel(statut: StatutDerogation): string {
  const labels: Record<string, string> = {
    'EN_ATTENTE_DIRECTEUR': 'En attente (Directeur)',
    'EN_ATTENTE_ADMIN': 'En attente (Admin)',
    'EN_ATTENTE': 'En attente',
    'APPROUVEE': 'Approuvée',
    'REFUSEE': 'Refusée',
    'EXPIREE': 'Expirée',
    'ANNULEE': 'Annulée'
  };
  return labels[statut] || statut;
}