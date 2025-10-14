export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface Patient {
  idPatient: number;
  idUser: number;
  name?: string;
  email?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
}

export interface ClinicalHistory {
  idHistory: number;
  idUser: number;
  idPatient: number;
  date: string;
  start: string;
  end?: string;
  closed: boolean;
  isEvolution: boolean;
}

export interface PatientData {
  patient: Patient;
  clinicalHistories?: ClinicalHistory[];
  allergies?: any[];
  medications?: any[];
  vitals?: any[];
}
