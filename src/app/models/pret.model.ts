export interface Pret {
  idpret: number;
  ideqpt: number;
  idunite: number;
  iduniteemt: number;
  duree: number;
  datepret: string; 
  designation?: string;
  motif: string;
}
export interface CreatePretDTO {
  ideqpt: number;
  idunite: number;
  duree: number;
  datepret: string;
  motif: string;
}

