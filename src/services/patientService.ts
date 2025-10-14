import api from './api';
import type { Patient, PatientData } from '../types';

export const patientService = {
  async getPatient(id: number): Promise<Patient> {
    const response = await api.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  async getMyPatientData(): Promise<PatientData> {
    // This would need to be adjusted based on your actual API endpoints
    // For now, this is a placeholder that assumes the current user is a patient
    const response = await api.get<PatientData>('/patients/me');
    return response.data;
  },

  async getAllPatients(): Promise<Patient[]> {
    const response = await api.get<Patient[]>('/patients');
    return response.data;
  },
};
