export interface GroupeIdentiqueDTO {
  id: number;
  codeGrp: string;
  marqueNom: string;
  typeEquipNom: string;
  idType: number;          
  idMarque: number;  
  organes: string[];           
  caracteristiques: string[]; 
}

export interface caracteristiques {
  id_caracteristique: number;
  libelle: string;
}
export interface UpdateGroupeIdentiqueDTO {
  id_organes: number[];
  id_caracteristiques: number[];
}

export interface Marque {
  idmarque: number;
  codemarque: string;   // il y a aussi codemarque dans ta réponse
  nom_fabriquant: string;
}

export interface GroupeOrgane {
  id_organe: number;
  libelle_organe: string;
}

export interface GroupeCaracteristique {
  id_caracteristique: number;
  libelle: string;
}
