// 🔥 TIPOS COMPARTIDOS DEL BACKEND - NO DUPLICAR
// Tech Lead: Paula Specter (@SpecterTech)

export type {
  Vacante,
  Candidato,
  Lead,
  RutaLogistica,
  ConfiguracionBot,
  RegistroInteraccion
} from '@shared/schema';

// 🎯 Tipos adicionales específicos del Frontend
export interface CandidatoConScore extends Candidato {
  score?: number;
  fechaContacto?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface Lead {
  id: string;
  nombre: string;
  telefono: string;
  edad: number;
  colonia: string;
  status: 'nuevo' | 'filtrado' | 'citado' | 'no_apto';
  vacanteSugerida?: string;
  papeleríaCompleta: boolean;
  rutaTransporteSabe: boolean;
  lastContact: number;
  notes: string;
  fuenteLead: string;
  fechaCreacion: number;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'operador' | 'viewer';
  createdAt?: number;
}

export interface EstadísticasDashboard {
  totalVacantes: number;
  totalCandidatos: number;
  totalLeads: number;
  vacantesCubiertas: number;
  candidatosContratados: number;
  leadsNuevos: number;
}
