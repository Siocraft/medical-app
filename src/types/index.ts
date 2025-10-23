export interface User {
  idUser: number;
  name: string;
  lname: string;
  email: string;
  type: string;
  sub: string;
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
  lname: string;
  email: string;
  password: string;
  type: string;
  doctorEmail?: string;
}

export interface Patient {
  idPatient: number;
  idUser: number;
  name?: string;
  lname?: string;
  email?: string;
  dateOfBirth?: string;
  phone?: string;
  extraPhone?: string;
  address?: string;
  addressSpecific?: string;
  bloodGroup?: string;
  bloodRh?: string;
  bloodType?: string;
  weight?: number;
  height?: number;
  civilStatus?: string;
  nationality?: number;
  education?: number;
  profession?: number;
  religion?: number;
  policy?: string;
  idInsurance?: number;
  documentType?: number;
  documentValue?: string;
  recordNumber?: string;
  insuranceComment?: string;
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
  diagnosisIds?: string;
  medications?: string;
  motive?: string;
  notes?: string;
}

export interface Allergy {
  idPatientAllergy: number;
  idPatient: number;
  idAllergy?: number;
  allergyName?: string;
  name?: string;
  date: string;
  type?: string;
  severity?: string;
  reaction?: string;
}

export interface Vital {
  idVital: number;
  idPatient: number;
  date: string;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface Lab {
  idLab?: number;
  idLabs?: number;
  idPatient: number;
  idContent?: number;
  date: string;
  testName?: string;
  result?: string;
  value?: number;
  unit?: string;
  referenceRange?: string;
  notes?: string;
  comment?: string;
  idUser?: number;
}

export interface Vaccine {
  idVaccine: number;
  idPatient: number;
  date: string;
  vaccineName?: string;
  dose?: string;
  manufacturer?: string;
  lotNumber?: string;
  nextDose?: string;
}

export interface PathologicalRecord {
  idRecord: number;
  idPatient: number;
  date: string;
  condition?: string;
  diagnosisDate?: string;
  status?: string;
  notes?: string;
}

export interface Contact {
  idContact: number;
  idPatient: number;
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
  date: string;
}

export interface LifestyleData {
  alcohol?: {
    frequency?: string;
    quantity?: string;
    type?: string;
    date?: string;
  };
  tobacco?: {
    frequency?: string;
    quantity?: string;
    yearsUsing?: number;
    date?: string;
  };
  drugs?: {
    type?: string;
    frequency?: string;
    date?: string;
  };
  physicalActivity?: {
    frequency?: string;
    type?: string;
    duration?: string;
    date?: string;
  };
}

export interface Observation {
  idObservation: number;
  idPatient: number;
  date: string;
  content?: string;
  type?: string;
}

export interface Insurance {
  idInsurance: number;
  name?: string;
  type?: string;
  provider?: string;
  contactInfo?: string;
}

export interface DocumentType {
  idDocument: number;
  name?: string;
  code?: string;
}

export interface Profession {
  idProfession: number;
  name?: string;
}

export interface Religion {
  idReligion: number;
  name?: string;
}

export interface PatientFile {
  idFile: number;
  idPatient: number;
  name?: string;
  type?: string;
  url?: string;
  date: string;
  size?: number;
  description?: string;
}

export interface PatientData {
  patient: Patient;
  clinicalHistories?: ClinicalHistory[];
  allergies?: Allergy[];
  history?: ClinicalHistory[];
  vitals?: Vital[];
  labs?: Lab[];
  vaccines?: Vaccine[];
  pathologicalRecords?: PathologicalRecord[];
  contacts?: Contact[];
  lifestyle?: LifestyleData;
  observations?: Observation[];
  insurance?: Insurance;
  documentType?: DocumentType;
  profession?: Profession;
  religion?: Religion;
  files?: PatientFile[];
}
