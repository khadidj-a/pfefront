export interface Caracteristique {
  id_caracteristique: number;
  libelle: string;
}

export interface OrganeCaracteristique {
  idcaracteristique: number;
  nomCaracteristique: string; 
  valeur: string;  
}

export interface Marque {
  idmarque: number;
  codemarque: string;
  nom_fabriquant: string;
}

export interface Organe {
  id_organe: number;
  code_organe: string;
  libelle_organe: string;
  id_marque: number;
  nom_marque: string;
  modele: string; 
  caracteristiques: OrganeCaracteristique[];
}

export interface Organee {
  id_organe: number;
  libelle_organe: string;
}

export interface OrganeEquipement {
  idorg: number;
  ideqpt: number;
  numserie: string;  // Changed to match API response
  nomOrgane: string;
}

// Update interfaces for creating organe equipement
export interface CreateOrganeEquipement {
  ideqpt: number;
  organes: OrganeInfo[];
}

export interface OrganeInfo {
  idorg: number;
  numserie: string;  // Changed to match JsonPropertyName in backend
}