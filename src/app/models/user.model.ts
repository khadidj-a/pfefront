export interface User {
    idUser: number;
    nom: string;
    prenom: string;
    email: string;
    idrole: number;
    libelle: string;
    isAdmin: boolean;
    role: string;
    numtel: number;
  }
  
  export interface LoginRequest {
    email: string;
    motpasse: string;
  }
  
  export interface LoginResponse {
    token: string;
    user: User;
  }

  