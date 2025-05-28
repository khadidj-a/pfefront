// models/reaffectation.model.ts

export interface Reaffectation {
  idreaf: number;
  ideqpt: number;
  iduniteemt: number | null;
  idunitedest: number;
  datereaf: string;
  motifreaf: string;
}

export interface CreateReaffectationDTO {
  idEquipement: number;
  idUniteDestination: number;
  date: string | Date;
  motif: string;
}
