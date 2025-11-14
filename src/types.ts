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
  doctorEmail?: string;
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
  idInsurance?: number;
  policy?: string;
  insuranceComment?: string;
}

export interface Doctor {
  idUser: number;
  idMedic: number;
  name: string;
  lname: string;
  email: string;
  about?: string;
  whatsapp?: string;
}

export interface ClinicalHistoryBackground {
  idBackground: number;
  family?: string;
  personal?: string;
  nonPathological?: string;
  gynecological?: string;
  perinatal?: string;
  date: string;
  idUser: number;
  idPatient: number;
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

export interface Insurance {
  idInsurance: number;
  name?: string;
  type?: string;
  provider?: string;
  contactInfo?: string;
}

export interface Profession {
  idProfession: number;
  name?: string;
}

export interface Religion {
  idReligion: number;
  name?: string;
}

export interface DocumentType {
  idDocument: number;
  name?: string;
  code?: string;
}

export interface PatientData {
  patient: Patient;
  history?: ClinicalHistory[];
  allergies?: Allergy[];
  vitals?: Vital[];
  labs?: Lab[];
  vaccines?: Vaccine[];
  pathologicalRecords?: PathologicalRecord[];
  contacts?: Contact[];
  lifestyle?: LifestyleData;
  insurance?: Insurance;
  profession?: Profession;
  religion?: Religion;
  nationality?: { name: string };
  education?: { name: string };
  documentType?: DocumentType;
  clinicalHistories?: ClinicalHistory[];
  clinicalHistoryBackground?: ClinicalHistoryBackground | null;
  files?: PatientFile[];
  doctors?: Doctor[];
}

export interface Allergy {
  idPatientAllergy?: number;
  idElement?: number;
  idPatient?: number;
  idAllergy?: number;
  allergyName?: string;
  name?: string;
  severity?: string;
  reaction?: string;
  type?: string;
  date?: string;
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
  unit?: string;
  referenceRange?: string;
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

// Extended Appointment interface (extends ClinicalHistory with additional fields)
export interface Appointment extends ClinicalHistory {
  idAppointment?: number;
  diagnosisNames?: string;
}

// Subsequent Note Data
export interface SubsequentNoteData {
  date?: string;
  motive?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

// Mutation data types for creating/updating entities
export interface CreateAppointmentData {
  idPatient: number;
  date: string;
  motive?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  isEvolution?: boolean;
}

export interface UpdateAppointmentData {
  date?: string;
  motive?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

export interface CreateAllergyData {
  allergyName: string;
  severity: string;
  type: string;
  reaction: string;
  date?: string;
}

export interface UpdateAllergyData {
  allergyName?: string;
  severity?: string;
  type?: string;
  reaction?: string;
  date?: string;
}

export interface CreateVitalData {
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

export interface CreateVaccineData {
  vaccineName: string;
  date: string;
  nextDose?: string;
  dose?: string;
  manufacturer?: string;
  lotNumber?: string;
}

export interface UpdateVaccineData {
  vaccineName?: string;
  date?: string;
  nextDose?: string;
  dose?: string;
  manufacturer?: string;
  lotNumber?: string;
}

export interface CreateLabData {
  idContent: number;
  value: number;
  date: string;
  unit?: string;
  referenceRange?: string;
  comment?: string | null;
}

export interface CreateContactData {
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateContactData {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// Lab Test interface
export interface LabTest {
  idContent: number;
  name: string;
  category?: string;
}

// Insurance List Item interface
export interface InsuranceListItem {
  idInsurance: number;
  name: string;
  type?: string;
  provider?: string;
}

// API Error interface
export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
  code?: string;
}
