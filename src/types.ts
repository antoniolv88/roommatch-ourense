// src/types.ts

export interface Match {
  id: string;
  users: string[];
}

export interface UserProfile {
  nombre: string;
  email: string;
  zona: string;
  edad?: number;
  [key: string]: any;
}

export interface Piso {
  id: string;
  zona: string;
  precio: number;
  descripcion: string;
  [key: string]: any;
}
