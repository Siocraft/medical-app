export interface User {
  idUser: number;
  email: string;
  name: string;
  lname: string;
  type: 'patient' | 'medic';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  lname: string;
  type: 'patient' | 'medic';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Patient {
  idPatient: number;
  idUser: number;
  name: string;
  lname: string;
  email: string;
  phone?: string;
  address?: string;
  bloodGroup?: string;
  bloodRh?: string;
  weight?: number;
  height?: number;
  civilStatus?: string;
  nationality?: number;
  education?: number;
  profession?: number;
  religion?: number;
}

export interface PatientData {
  patient: any;
  history?: any[];
  allergies?: Allergy[];
  vitals?: Vital[];
  labs?: Lab[];
  vaccines?: Vaccine[];
  pathologicalRecords?: PathologicalRecord[];
  contacts?: Contact[];
  lifestyle?: any;
  insurance?: any;
  profession?: { name: string };
  religion?: { name: string };
  nationality?: { name: string };
  education?: { name: string };
  documentType?: { name: string };
  clinicalHistories?: any[];
  files?: PatientFile[];
}

export interface Allergy {
  idPatientAllergy: number;
  allergyName?: string;
  name?: string;
  severity?: string;
  reaction?: string;
  type?: string;
}

export interface Vital {
  idVital?: number;
  date: string;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

export interface Lab {
  idLabs: number;
  idContent: number;
  value: number;
  date: string;
  comment: string | null;
  idUser: number;
  idPatient: number;
  testName?: string | null; // Added by backend from JOIN
}

export interface Vaccine {
  idVaccine: number;
  vaccineName: string;
  date: string;
  dose?: string;
  nextDose?: string;
  manufacturer?: string;
}

export interface PathologicalRecord {
  idRecord: number;
  condition: string;
  diagnosisDate?: string;
  status?: string;
  notes?: string;
}

export interface Contact {
  idContact: number;
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface PatientFile {
  idFile: number;
  idUser: number | null;
  idPatient: number | null;
  code: string;
  name: string;
  comment: string | null;
  spath: string | null;
  mainType: "photo" | "video" | "audio" | "pdf" | "other";
  path: string | null;
  idType: number;
  idSub: number | null;
  size: number;
  date: Date;
  state: boolean;
  public: boolean;
  year: number;
  month: number;
  day: number;
  interpretation: string | null;
  user: number | null;
}
