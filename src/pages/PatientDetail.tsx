import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '../components/Header';
import api from '../services/api';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  User,
  Heart,
  Activity,
  FileText,
  Syringe,
  Beaker,
  Pill,
  Cigarette,
  Wine,
  Dumbbell,
  ShieldAlert,
  Users,
  File,
  AlertTriangle,
  Weight,
  Ruler,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import './PatientDetail.css';
import type {
  PatientData,
  Allergy,
  Vital,
  Lab,
  Vaccine,
  PathologicalRecord,
  Contact,
  PatientFile
} from '../types';

interface Patient {
  idPatient: number;
  idUser: number;
  name: string;
  lname: string;
  email: string;
  phone: string;
  address: string;
  bloodGroup: string;
  bloodRh: string;
  weight?: number;
  height?: number;
  civilStatus?: string;
  nationality?: number;
  education?: number;
  profession?: number;
  religion?: number;
}

interface Appointment {
  idHistory: number;
  idAppointment?: number;
  idUser: number;
  idPatient: number;
  date: string;
  start: string;
  end?: string;
  motive?: string;
  diagnosisIds?: string;
  diagnosisNames?: string;
  medications?: string;
  notes?: string;
  isEvolution: boolean;
  closed: boolean;
}

// API functions
const fetchPatientDetails = async (patientId: string): Promise<PatientData> => {
  const response = await api.get(`/medics/patients/${patientId}`);
  return response.data;
};

export const PatientDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editedPatient, setEditedPatient] = useState<Partial<Patient>>({});
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    motive: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  });
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null);
  const [editedAppointment, setEditedAppointment] = useState<Partial<Appointment>>({});
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);

  // Allergy state
  const [editingAllergyId, setEditingAllergyId] = useState<number | null>(null);
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [allergyForm, setAllergyForm] = useState<Partial<Allergy>>({});

  // Vital state
  const [editingVitalId, setEditingVitalId] = useState<number | null>(null);
  const [showAddVital, setShowAddVital] = useState(false);
  const [vitalForm, setVitalForm] = useState<Partial<Vital>>({});

  // Lab state
  const [visibleLabsCount, setVisibleLabsCount] = useState(5);

  // Files state
  const [visibleFilesCount, setVisibleFilesCount] = useState(5);

  // Vitals pagination state
  const [visibleVitalsCount, setVisibleVitalsCount] = useState(5);

  // Lab modal state
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [showLabModal, setShowLabModal] = useState(false);

  // Vaccine state
  const [editingVaccineId, setEditingVaccineId] = useState<number | null>(null);
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [vaccineForm, setVaccineForm] = useState<Partial<Vaccine>>({});

  // Pathological Record state
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [recordForm, setRecordForm] = useState<Partial<PathologicalRecord>>({});

  // Contact state
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState<Partial<Contact>>({});

  // File upload state
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileComment, setFileComment] = useState('');

  // Lifestyle & Insurance state (single edit mode since they're unique objects)
  // TODO: Implement lifestyle and insurance editing functionality
  // const [editingLifestyle, setEditingLifestyle] = useState(false);
  // const [lifestyleForm, setLifestyleForm] = useState<any>({});
  // const [editingInsurance, setEditingInsurance] = useState(false);
  // const [insuranceForm, setInsuranceForm] = useState<any>({});

  // Accordion state for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    demographics: true,
    physical: true,
    insurance: true,
    allergies: true,
    pathological: true,
    vitals: true,
    labs: true,
    vaccines: true,
    lifestyle: true,
    contacts: true,
    documents: true,
    appointments: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  // Fetch patient details with React Query (includes history/appointments)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => fetchPatientDetails(id!),
    enabled: !!id,
  });

  const patient = data?.patient;
  const appointments = data?.history || [];
  const allergies = data?.allergies || [];
  const vitals = data?.vitals || [];
  const labs = data?.labs || [];
  const vaccines = data?.vaccines || [];
  const pathologicalRecords = data?.pathologicalRecords || [];
  const contacts = data?.contacts || [];
  const lifestyle = data?.lifestyle;
  const insurance = data?.insurance;
  const profession = data?.profession;
  const religion = data?.religion;
  const nationality = data?.nationality;
  const education = data?.education;
  const files = data?.files || [];

  useEffect(() => {
    if (patient) {
      document.title = `Mi Medicina | ${patient.name} ${patient.lname}`;
    } else {
      document.title = 'Mi Medicina | Paciente';
    }
  }, [patient]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditPatient = () => {
    if (patient) {
      setEditedPatient({
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
        bloodGroup: patient.bloodGroup,
        bloodRh: patient.bloodRh
      });
      setIsEditingPatient(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingPatient(false);
    setEditedPatient({});
  };

  // Mutation for updating patient
  const updatePatientMutation = useMutation({
    mutationFn: async (updates: Partial<Patient>) => {
      const response = await api.patch(`/patients/${patient?.idPatient}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      queryClient.invalidateQueries({ queryKey: ['medic-patients'] });
      setIsEditingPatient(false);
      setEditedPatient({});
    },
    onError: (err) => {
      console.error('Error updating patient:', err);
      alert(t('medic.patientDetail.saveError'));
    },
  });

  const handleSavePatient = () => {
    updatePatientMutation.mutate(editedPatient);
  };

  // Mutation for creating appointment
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await api.post('/clinical-history', appointmentData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setShowAddAppointment(false);
      setNewAppointment({
        date: '',
        motive: '',
        diagnosis: '',
        treatment: '',
        notes: ''
      });
    },
    onError: (err) => {
      console.error('Error creating appointment:', err);
      alert(t('medic.patientDetail.saveError'));
    },
  });

  const handleAddAppointment = () => {
    createAppointmentMutation.mutate({
      idPatient: patient?.idPatient,
      date: newAppointment.date,
      motive: newAppointment.motive,
      notes: newAppointment.notes,
      // For now, we'll ignore diagnosis and treatment since they need special handling
    });
  };

  const handleCancelAddAppointment = () => {
    setShowAddAppointment(false);
    setNewAppointment({
      date: '',
      motive: '',
      diagnosis: '',
      treatment: '',
      notes: ''
    });
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointmentId(appointment.idHistory);
    setEditedAppointment({
      date: appointment.date,
      motive: appointment.motive,
      notes: appointment.notes
    });
  };

  // Mutation for updating appointment
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, updates }: { appointmentId: number; updates: any }) => {
      const response = await api.patch(`/clinical-history/${appointmentId}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setEditingAppointmentId(null);
      setEditedAppointment({});
    },
    onError: (err) => {
      console.error('Error updating appointment:', err);
      alert(t('medic.patientDetail.saveError'));
    },
  });

  const handleSaveEditedAppointment = () => {
    if (editingAppointmentId) {
      updateAppointmentMutation.mutate({
        appointmentId: editingAppointmentId,
        updates: {
          date: editedAppointment.date,
          motive: editedAppointment.motive,
          notes: editedAppointment.notes,
        },
      });
    }
  };

  const handleCancelEditAppointment = () => {
    setEditingAppointmentId(null);
    setEditedAppointment({});
  };

  // Mutation for deleting appointment
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await api.delete(`/clinical-history/${appointmentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
    },
    onError: (err) => {
      console.error('Error deleting appointment:', err);
      alert(t('medic.patientDetail.deleteError'));
    },
  });

  const handleDeleteAppointment = (appointmentId: number) => {
    if (confirm(t('patientDetail.deleteAppointmentConfirm'))) {
      deleteAppointmentMutation.mutate(appointmentId);
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setViewingAppointment(appointment);
  };

  const handleCloseAppointmentDetail = () => {
    setViewingAppointment(null);
  };

  // ====== ALLERGY MUTATIONS ======
  const createAllergyMutation = useMutation({
    mutationFn: async (allergyData: any) => {
      const response = await api.post(`/patients/${patient?.idPatient}/allergies`, allergyData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setShowAddAllergy(false);
      setAllergyForm({});
    },
  });

  const updateAllergyMutation = useMutation({
    mutationFn: async ({ allergyId, updates }: { allergyId: number; updates: any }) => {
      const response = await api.patch(`/patients/${patient?.idPatient}/allergies/${allergyId}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setEditingAllergyId(null);
      setAllergyForm({});
    },
  });

  const deleteAllergyMutation = useMutation({
    mutationFn: async (allergyId: number) => {
      const response = await api.delete(`/patients/${patient?.idPatient}/allergies/${allergyId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
    },
  });

  // ====== VITAL MUTATIONS ======
  const createVitalMutation = useMutation({
    mutationFn: async (vitalData: any) => {
      const response = await api.post(`/patients/${patient?.idPatient}/vitals`, vitalData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setShowAddVital(false);
      setVitalForm({});
    },
  });

  const updateVitalMutation = useMutation({
    mutationFn: async ({ vitalId, updates }: { vitalId: number; updates: any }) => {
      const response = await api.patch(`/patients/${patient?.idPatient}/vitals/${vitalId}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setEditingVitalId(null);
      setVitalForm({});
    },
  });

  const deleteVitalMutation = useMutation({
    mutationFn: async (vitalId: number) => {
      const response = await api.delete(`/patients/${patient?.idPatient}/vitals/${vitalId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
    },
  });

  // ====== VACCINE MUTATIONS ======
  const createVaccineMutation = useMutation({
    mutationFn: async (vaccineData: any) => {
      const response = await api.post(`/patients/${patient?.idPatient}/vaccines`, vaccineData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setShowAddVaccine(false);
      setVaccineForm({});
    },
  });

  const updateVaccineMutation = useMutation({
    mutationFn: async ({ vaccineId, updates }: { vaccineId: number; updates: any }) => {
      const response = await api.patch(`/patients/${patient?.idPatient}/vaccines/${vaccineId}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setEditingVaccineId(null);
      setVaccineForm({});
    },
  });

  const deleteVaccineMutation = useMutation({
    mutationFn: async (vaccineId: number) => {
      const response = await api.delete(`/patients/${patient?.idPatient}/vaccines/${vaccineId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
    },
  });

  // ====== PATHOLOGICAL RECORD MUTATIONS ======
  const createRecordMutation = useMutation({
    mutationFn: async (recordData: any) => {
      const response = await api.post(`/patients/${patient?.idPatient}/pathological-records`, recordData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setShowAddRecord(false);
      setRecordForm({});
    },
  });

  const updateRecordMutation = useMutation({
    mutationFn: async ({ recordId, updates }: { recordId: number; updates: any }) => {
      const response = await api.patch(`/patients/${patient?.idPatient}/pathological-records/${recordId}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setEditingRecordId(null);
      setRecordForm({});
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: number) => {
      const response = await api.delete(`/patients/${patient?.idPatient}/pathological-records/${recordId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
    },
  });

  // ====== CONTACT MUTATIONS ======
  const createContactMutation = useMutation({
    mutationFn: async (contactData: any) => {
      const response = await api.post(`/patients/${patient?.idPatient}/contacts`, contactData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setShowAddContact(false);
      setContactForm({});
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ contactId, updates }: { contactId: number; updates: any }) => {
      const response = await api.patch(`/patients/${patient?.idPatient}/contacts/${contactId}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setEditingContactId(null);
      setContactForm({});
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const response = await api.delete(`/patients/${patient?.idPatient}/contacts/${contactId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
    },
  });

  // ====== FILE UPLOAD MUTATION ======
  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, comment }: { file: File; comment: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (comment) {
        formData.append('comment', comment);
      }
      const response = await api.post(`/medics/patients/${patient?.idPatient}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setShowUploadFile(false);
      setSelectedFile(null);
      setFileComment('');
    },
    onError: (err) => {
      console.error('Error uploading file:', err);
      alert(t('patientDetail.uploadError'));
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadFile = () => {
    if (selectedFile) {
      uploadFileMutation.mutate({ file: selectedFile, comment: fileComment });
    }
  };

  // ====== FILE DELETE MUTATION ======
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await api.delete(`/medics/patients/${patient?.idPatient}/files/${fileId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
    },
    onError: (err) => {
      console.error('Error deleting file:', err);
      alert(t('patientDetail.deleteFileError'));
    },
  });

  const handleDeleteFile = (fileId: number) => {
    if (confirm(t('patientDetail.deleteFileConfirm'))) {
      deleteFileMutation.mutate(fileId);
    }
  };

  // ====== LIFESTYLE & INSURANCE MUTATIONS ======
  // TODO: Implement lifestyle and insurance update mutations when editing UI is added
  // const updateLifestyleMutation = useMutation({
  //   mutationFn: async (lifestyleData: any) => {
  //     const response = await api.patch(`/patients/${patient?.idPatient}/lifestyle`, lifestyleData);
  //     return response.data;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['patient', id] });
  //     setEditingLifestyle(false);
  //     setLifestyleForm({});
  //   },
  // });

  // const updateInsuranceMutation = useMutation({
  //   mutationFn: async (insuranceData: any) => {
  //     const response = await api.patch(`/patients/${patient?.idPatient}/insurance`, insuranceData);
  //     return response.data;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['patient', id] });
  //     setEditingInsurance(false);
  //     setInsuranceForm({});
  //   },
  // });

  const handleOpenFile = async (file: PatientFile) => {
    try {
      const response = await api.get(`/medics/files/${file.code}`, {
        responseType: 'blob',
      });

      // Get the content type from the response headers
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error opening file:', error);
      alert(t('patientDetail.fileOpenError'));
    }
  };

  const handleOpenLab = (lab: Lab) => {
    setSelectedLab(lab);
    setShowLabModal(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isAppointmentToday = (dateString: string) => {
    if (!dateString) return false;
    const appointmentDate = new Date(dateString);
    const today = new Date();

    return appointmentDate.getFullYear() === today.getFullYear() &&
           appointmentDate.getMonth() === today.getMonth() &&
           appointmentDate.getDate() === today.getDate();
  };

  const getInitials = (name?: string, lname?: string) => {
    const firstInitial = name?.charAt(0) || '';
    const lastInitial = lname?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('dashboard.loading')}</p>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="error-container">
        <span className="icon-large">⚠️</span>
        <h2>{t('medic.patientDetail.errorLoading')}</h2>
        <p>{t('medic.patientDetail.notFound')}</p>
        <button className="btn-primary" onClick={handleBack}>
          {t('medic.patientDetail.goBack')}
        </button>
      </div>
    );
  }

  return (
    <div className="patient-detail">
      <Header showBackButton onBack={handleBack} />

      {/* Main Content */}
      <div className="detail-main">
        {/* Patient Info Card */}
        <div className="patient-info-card">
          <div className="patient-header">
            <div className="patient-avatar-large">
              {getInitials(patient.name, patient.lname)}
            </div>
            <div className="patient-header-content">
              <h1>{patient.name} {patient.lname}</h1>
              {patient.bloodGroup && patient.bloodRh && (
                <span className="blood-type-large">
                  {t('medic.patientDetail.bloodType')} {patient.bloodGroup}{patient.bloodRh}
                </span>
              )}
            </div>
            {!isEditingPatient && (
              <button className="btn-edit" onClick={handleEditPatient}>
                <Edit2 size={18} />
                <span>{t('medic.patientDetail.edit')}</span>
              </button>
            )}
          </div>

          {isEditingPatient ? (
            <div className="edit-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('medic.patientDetail.email')}</label>
                  <div className="input-with-icon">
                    <Mail size={18} />
                    <input
                      type="email"
                      value={editedPatient.email || ''}
                      onChange={(e) => setEditedPatient({...editedPatient, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('medic.patientDetail.phone')}</label>
                  <div className="input-with-icon">
                    <Phone size={18} />
                    <input
                      type="tel"
                      value={editedPatient.phone || ''}
                      onChange={(e) => setEditedPatient({...editedPatient, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>{t('medic.patientDetail.address')}</label>
                  <div className="input-with-icon">
                    <MapPin size={18} />
                    <input
                      type="text"
                      value={editedPatient.address || ''}
                      onChange={(e) => setEditedPatient({...editedPatient, address: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('patientDetail.bloodGroup')}</label>
                  <select
                    value={editedPatient.bloodGroup || ''}
                    onChange={(e) => setEditedPatient({...editedPatient, bloodGroup: e.target.value})}
                    className="form-select"
                  >
                    <option value="">{t('patientDetail.select')}</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('patientDetail.bloodRh')}</label>
                  <select
                    value={editedPatient.bloodRh || ''}
                    onChange={(e) => setEditedPatient({...editedPatient, bloodRh: e.target.value})}
                    className="form-select"
                  >
                    <option value="">{t('patientDetail.select')}</option>
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-cancel" onClick={handleCancelEdit}>
                  <X size={18} />
                  <span>{t('medic.patientDetail.cancel')}</span>
                </button>
                <button className="btn-save" onClick={handleSavePatient}>
                  <Save size={18} />
                  <span>{t('medic.patientDetail.save')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">{t('medic.patientDetail.email')}</span>
                <span className="info-value">
                  <Mail size={18} />
                  {patient.email || 'N/A'}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">{t('medic.patientDetail.phone')}</span>
                <span className="info-value">
                  <Phone size={18} />
                  {patient.phone || 'N/A'}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">{t('medic.patientDetail.address')}</span>
                <span className="info-value">
                  <MapPin size={18} />
                  {patient.address || 'N/A'}
                </span>
              </div>

              <div className="info-item">
                <span className="info-label">{t('medic.patientDetail.patientId')}</span>
                <span className="info-value">
                  <User size={18} />
                  #{patient.idPatient}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Demographics & Physical Info Grid */}
        <div className="info-sections-grid">
          {/* Demographics Panel */}
          <div className="info-section">
            <h3 className="section-title collapsible" onClick={() => toggleSection('demographics')}>
              <span className="section-title-content">
                <User size={20} />
                {t('patientDetail.demographics')}
              </span>
              {expandedSections.demographics ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h3>
            {expandedSections.demographics && (
            <div className="section-content">
              {patient.civilStatus && (
                <div className="info-row">
                  <span className="info-row-label">{t('patientDetail.civilStatus')}</span>
                  <span className="info-row-value">{patient.civilStatus}</span>
                </div>
              )}
              {profession && (
                <div className="info-row">
                  <span className="info-row-label">{t('patientDetail.profession')}</span>
                  <span className="info-row-value">{profession.name}</span>
                </div>
              )}
              {religion && (
                <div className="info-row">
                  <span className="info-row-label">{t('patientDetail.religion')}</span>
                  <span className="info-row-value">{religion.name}</span>
                </div>
              )}
              {nationality && (
                <div className="info-row">
                  <span className="info-row-label">{t('patientDetail.nationality')}</span>
                  <span className="info-row-value">{nationality.name}</span>
                </div>
              )}
              {education && (
                <div className="info-row">
                  <span className="info-row-label">{t('patientDetail.education')}</span>
                  <span className="info-row-value">{education.name}</span>
                </div>
              )}
              {!patient.civilStatus && !profession && !religion && !nationality && !education && (
                <p className="no-data">{t('patientDetail.noData')}</p>
              )}
            </div>
            )}
          </div>

          {/* Physical Info */}
          <div className="info-section">
            <h3 className="section-title collapsible" onClick={() => toggleSection('physical')}>
              <span className="section-title-content">
                <Activity size={20} />
                {t('patientDetail.physicalInfo')}
              </span>
              {expandedSections.physical ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h3>
            {expandedSections.physical && (
            <div className="section-content">
              {patient.weight && (
                <div className="info-row">
                  <span className="info-row-label">
                    <Weight size={16} />
                    {t('patientDetail.weight')}
                  </span>
                  <span className="info-row-value">{patient.weight} kg</span>
                </div>
              )}
              {patient.height && (
                <div className="info-row">
                  <span className="info-row-label">
                    <Ruler size={16} />
                    {t('patientDetail.height')}
                  </span>
                  <span className="info-row-value">{patient.height} cm</span>
                </div>
              )}
              {patient.bloodGroup && patient.bloodRh && (
                <div className="info-row">
                  <span className="info-row-label">
                    <Heart size={16} />
                    {t('patientDetail.bloodType')}
                  </span>
                  <span className="info-row-value">{patient.bloodGroup}{patient.bloodRh}</span>
                </div>
              )}
              {!patient.weight && !patient.height && (!patient.bloodGroup || !patient.bloodRh) && (
                <p className="no-data">{t('patientDetail.noData')}</p>
              )}
            </div>
            )}
          </div>
        </div>

        {/* Insurance Info */}
        {insurance && (
          <div className="info-section">
            <h3 className="section-title collapsible" onClick={() => toggleSection('insurance')}>
              <span className="section-title-content">
                <ShieldAlert size={20} />
                {t('patientDetail.insurance')}
              </span>
              {expandedSections.insurance ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h3>
            {expandedSections.insurance && (
            <div className="section-content">
              <div className="info-row">
                <span className="info-row-label">{t('patientDetail.insuranceName')}</span>
                <span className="info-row-value">{insurance.name || 'N/A'}</span>
              </div>
              {insurance.type && (
                <div className="info-row">
                  <span className="info-row-label">{t('patientDetail.insuranceType')}</span>
                  <span className="info-row-value">{insurance.type}</span>
                </div>
              )}
              {patient.policy && (
                <div className="info-row">
                  <span className="info-row-label">{t('patientDetail.policyNumber')}</span>
                  <span className="info-row-value">{patient.policy}</span>
                </div>
              )}
            </div>
            )}
          </div>
        )}

        {/* Allergies Section */}
        <div className="info-section">
          <div className="section-header-wrapper">
            <h3 className="section-title collapsible" onClick={() => toggleSection('allergies')}>
              <span className="section-title-content">
                <AlertTriangle size={20} />
                {t('patientDetail.allergies')} ({allergies.length})
              </span>
              {expandedSections.allergies ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h3>
            {expandedSections.allergies && (
              <div className="section-button-row">
                <button className="btn-add-small" onClick={() => setShowAddAllergy(true)}>
                  <Plus size={16} /> {t('patientDetail.addAllergy')}
                </button>
              </div>
            )}
          </div>
          {expandedSections.allergies && (
          <>

          {showAddAllergy && (
            <div className="crud-form">
              <h4>{t('patientDetail.addNewAllergy')}</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('patientDetail.allergyName')} {t('patientDetail.required')}</label>
                  <input
                    type="text"
                    value={allergyForm.allergyName || ''}
                    onChange={(e) => setAllergyForm({ ...allergyForm, allergyName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.severity')}</label>
                  <select
                    value={allergyForm.severity || ''}
                    onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value })}
                  >
                    <option value="">{t('patientDetail.selectSeverity')}</option>
                    <option value="Mild">{t('patientDetail.mild')}</option>
                    <option value="Moderate">{t('patientDetail.moderate')}</option>
                    <option value="Severe">{t('patientDetail.severe')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.type')}</label>
                  <input
                    type="text"
                    value={allergyForm.type || ''}
                    onChange={(e) => setAllergyForm({ ...allergyForm, type: e.target.value })}
                  />
                </div>
                <div className="form-group full-width">
                  <label>{t('patientDetail.reaction')}</label>
                  <textarea
                    value={allergyForm.reaction || ''}
                    onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => { setShowAddAllergy(false); setAllergyForm({}); }}>{t('patientDetail.cancel')}</button>
                <button className="btn-save" onClick={() => createAllergyMutation.mutate(allergyForm)}>{t('patientDetail.save')}</button>
              </div>
            </div>
          )}

          <div className="section-content">
            {allergies.length > 0 ? (
              <div className="allergies-list">
                {allergies.map((allergy: Allergy) => (
                  <div key={allergy.idPatientAllergy} className="allergy-item">
                    {editingAllergyId === allergy.idPatientAllergy ? (
                      <div className="crud-form-inline">
                        <div className="form-grid">
                          <div className="form-group">
                            <label>{t('patientDetail.allergyName')}</label>
                            <input
                              type="text"
                              value={allergyForm.allergyName || allergy.allergyName || ''}
                              onChange={(e) => setAllergyForm({ ...allergyForm, allergyName: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.severity')}</label>
                            <select
                              value={allergyForm.severity || allergy.severity || ''}
                              onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value })}
                            >
                              <option value="">{t('patientDetail.selectSeverity')}</option>
                              <option value="Mild">{t('patientDetail.mild')}</option>
                              <option value="Moderate">{t('patientDetail.moderate')}</option>
                              <option value="Severe">{t('patientDetail.severe')}</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.type')}</label>
                            <input
                              type="text"
                              value={allergyForm.type || allergy.type || ''}
                              onChange={(e) => setAllergyForm({ ...allergyForm, type: e.target.value })}
                            />
                          </div>
                          <div className="form-group full-width">
                            <label>{t('patientDetail.reaction')}</label>
                            <textarea
                              value={allergyForm.reaction || allergy.reaction || ''}
                              onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className="form-actions">
                          <button className="btn-cancel" onClick={() => { setEditingAllergyId(null); setAllergyForm({}); }}>{t('patientDetail.cancel')}</button>
                          <button className="btn-save" onClick={() => updateAllergyMutation.mutate({ allergyId: allergy.idPatientAllergy, updates: allergyForm })}>{t('patientDetail.save')}</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="allergy-header">
                          <span className="allergy-name">{allergy.allergyName || allergy.name || t('patientDetail.unknown')}</span>
                          <div className="item-actions">
                            <button className="btn-icon-edit" onClick={() => { setEditingAllergyId(allergy.idPatientAllergy); setAllergyForm(allergy); }}>
                              <Edit2 size={14} />
                            </button>
                            <button className="btn-icon-delete" onClick={() => confirm(t('patientDetail.deleteAllergy')) && deleteAllergyMutation.mutate(allergy.idPatientAllergy)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {allergy.severity && <span className={`severity-badge ${allergy.severity.toLowerCase()}`}>{allergy.severity}</span>}
                        {allergy.reaction && <p className="allergy-reaction">{allergy.reaction}</p>}
                        {allergy.type && <span className="allergy-type">{allergy.type}</span>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">{t('patientDetail.noAllergies')}</p>
            )}
          </div>
          </>
          )}
        </div>

        {/* Pathological Records */}
        <div className="info-section">
          <div className="section-header-wrapper">
            <h3 className="section-title collapsible" onClick={() => toggleSection('pathological')}>
              <span className="section-title-content">
                <FileText size={20} />
                {t('patientDetail.pathologicalRecords')} ({pathologicalRecords.length})
              </span>
              {expandedSections.pathological ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h3>
            {expandedSections.pathological && (
              <div className="section-button-row">
                <button className="btn-add-small" onClick={() => setShowAddRecord(true)}>
                  <Plus size={16} /> {t('patientDetail.addRecord')}
                </button>
              </div>
            )}
          </div>
          {expandedSections.pathological && (
          <>

          {showAddRecord && (
            <div className="crud-form">
              <h4>{t('patientDetail.addPathologicalRecord')}</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('patientDetail.condition')} {t('patientDetail.required')}</label>
                  <input
                    type="text"
                    value={recordForm.condition || ''}
                    onChange={(e) => setRecordForm({ ...recordForm, condition: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.diagnosisDate')}</label>
                  <input
                    type="date"
                    value={recordForm.diagnosisDate || ''}
                    onChange={(e) => setRecordForm({ ...recordForm, diagnosisDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.status')}</label>
                  <select
                    value={recordForm.status || ''}
                    onChange={(e) => setRecordForm({ ...recordForm, status: e.target.value })}
                  >
                    <option value="">{t('patientDetail.selectStatus')}</option>
                    <option value="Active">{t('patientDetail.active')}</option>
                    <option value="Resolved">{t('patientDetail.resolved')}</option>
                    <option value="Chronic">{t('patientDetail.chronic')}</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>{t('patientDetail.notes')}</label>
                  <textarea
                    value={recordForm.notes || ''}
                    onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => { setShowAddRecord(false); setRecordForm({}); }}>{t('patientDetail.cancel')}</button>
                <button className="btn-save" onClick={() => createRecordMutation.mutate(recordForm)}>{t('patientDetail.save')}</button>
              </div>
            </div>
          )}

          <div className="section-content">
            {pathologicalRecords.length > 0 ? (
              <div className="records-list">
                {pathologicalRecords.map((record: PathologicalRecord) => (
                  <div key={record.idRecord} className="record-item">
                    {editingRecordId === record.idRecord ? (
                      <div className="crud-form-inline">
                        <div className="form-grid">
                          <div className="form-group">
                            <label>{t('patientDetail.condition')}</label>
                            <input
                              type="text"
                              value={recordForm.condition || record.condition || ''}
                              onChange={(e) => setRecordForm({ ...recordForm, condition: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.diagnosisDate')}</label>
                            <input
                              type="date"
                              value={recordForm.diagnosisDate || record.diagnosisDate || ''}
                              onChange={(e) => setRecordForm({ ...recordForm, diagnosisDate: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.status')}</label>
                            <select
                              value={recordForm.status || record.status || ''}
                              onChange={(e) => setRecordForm({ ...recordForm, status: e.target.value })}
                            >
                              <option value="">{t('patientDetail.selectStatus')}</option>
                              <option value="Active">{t('patientDetail.active')}</option>
                              <option value="Resolved">{t('patientDetail.resolved')}</option>
                              <option value="Chronic">{t('patientDetail.chronic')}</option>
                            </select>
                          </div>
                          <div className="form-group full-width">
                            <label>{t('patientDetail.notes')}</label>
                            <textarea
                              value={recordForm.notes || record.notes || ''}
                              onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                              rows={3}
                            />
                          </div>
                        </div>
                        <div className="form-actions">
                          <button className="btn-cancel" onClick={() => { setEditingRecordId(null); setRecordForm({}); }}>{t('patientDetail.cancel')}</button>
                          <button className="btn-save" onClick={() => updateRecordMutation.mutate({ recordId: record.idRecord, updates: recordForm })}>{t('patientDetail.save')}</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="record-header">
                          <div>
                            <span className="record-condition">{record.condition || t('patientDetail.unknownCondition')}</span>
                            {record.status && <span className={`status-badge ${record.status.toLowerCase()}`}>{record.status}</span>}
                          </div>
                          <div className="item-actions">
                            <button className="btn-icon-edit" onClick={() => { setEditingRecordId(record.idRecord); setRecordForm(record); }}>
                              <Edit2 size={14} />
                            </button>
                            <button className="btn-icon-delete" onClick={() => confirm(t('patientDetail.deleteRecord')) && deleteRecordMutation.mutate(record.idRecord)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {record.diagnosisDate && (
                          <p className="record-date">{t('patientDetail.diagnosed')}: {formatDate(record.diagnosisDate)}</p>
                        )}
                        {record.notes && <p className="record-notes">{record.notes}</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">{t('patientDetail.noPathologicalRecords')}</p>
            )}
          </div>
          </>
          )}
        </div>

        {/* Vitals Timeline */}
        <div className="info-section">
          <div className="section-header-wrapper">
            <h3 className="section-title collapsible" onClick={() => toggleSection('vitals')}>
              <span className="section-title-content">
                <Activity size={20} />
                {t('patientDetail.vitals')} ({vitals.length})
              </span>
              {expandedSections.vitals ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h3>
            {expandedSections.vitals && (
              <div className="section-button-row">
                <button className="btn-add-small" onClick={() => setShowAddVital(true)}>
                  <Plus size={16} /> {t('patientDetail.addVitals')}
                </button>
              </div>
            )}
          </div>
          {expandedSections.vitals && (
          <>

          {showAddVital && (
            <div className="crud-form">
              <h4>{t('patientDetail.addNewVitalSigns')}</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('patientDetail.date')} {t('patientDetail.required')}</label>
                  <input
                    type="date"
                    value={vitalForm.date || ''}
                    onChange={(e) => setVitalForm({ ...vitalForm, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.systolic')}</label>
                  <input
                    type="number"
                    value={vitalForm.systolic || ''}
                    onChange={(e) => setVitalForm({ ...vitalForm, systolic: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.diastolic')}</label>
                  <input
                    type="number"
                    value={vitalForm.diastolic || ''}
                    onChange={(e) => setVitalForm({ ...vitalForm, diastolic: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.heartRate')}</label>
                  <input
                    type="number"
                    value={vitalForm.heartRate || ''}
                    onChange={(e) => setVitalForm({ ...vitalForm, heartRate: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.temperature')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalForm.temperature || ''}
                    onChange={(e) => setVitalForm({ ...vitalForm, temperature: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.oxygenSaturation')}</label>
                  <input
                    type="number"
                    value={vitalForm.oxygenSaturation || ''}
                    onChange={(e) => setVitalForm({ ...vitalForm, oxygenSaturation: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.respiratoryRate')}</label>
                  <input
                    type="number"
                    value={vitalForm.respiratoryRate || ''}
                    onChange={(e) => setVitalForm({ ...vitalForm, respiratoryRate: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => { setShowAddVital(false); setVitalForm({}); }}>{t('patientDetail.cancel')}</button>
                <button className="btn-save" onClick={() => createVitalMutation.mutate(vitalForm)}>{t('patientDetail.save')}</button>
              </div>
            </div>
          )}

          <div className="section-content">
            {vitals.length > 0 ? (
              <>
              <div className="vitals-list">
                {vitals.slice(0, visibleVitalsCount).map((vital: Vital, index: number) => (
                  <div key={vital.idVital || index} className="vital-item">
                    {editingVitalId === vital.idVital ? (
                      <div className="crud-form-inline">
                        <div className="form-grid">
                          <div className="form-group">
                            <label>{t('patientDetail.date')}</label>
                            <input
                              type="date"
                              value={vitalForm.date || vital.date}
                              onChange={(e) => setVitalForm({ ...vitalForm, date: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.systolic')}</label>
                            <input
                              type="number"
                              value={vitalForm.systolic ?? vital.systolic ?? ''}
                              onChange={(e) => setVitalForm({ ...vitalForm, systolic: Number(e.target.value) })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.diastolic')}</label>
                            <input
                              type="number"
                              value={vitalForm.diastolic ?? vital.diastolic ?? ''}
                              onChange={(e) => setVitalForm({ ...vitalForm, diastolic: Number(e.target.value) })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.heartRate')}</label>
                            <input
                              type="number"
                              value={vitalForm.heartRate ?? vital.heartRate ?? ''}
                              onChange={(e) => setVitalForm({ ...vitalForm, heartRate: Number(e.target.value) })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.temperature')}</label>
                            <input
                              type="number"
                              step="0.1"
                              value={vitalForm.temperature ?? vital.temperature ?? ''}
                              onChange={(e) => setVitalForm({ ...vitalForm, temperature: Number(e.target.value) })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.o2Sat')}</label>
                            <input
                              type="number"
                              value={vitalForm.oxygenSaturation ?? vital.oxygenSaturation ?? ''}
                              onChange={(e) => setVitalForm({ ...vitalForm, oxygenSaturation: Number(e.target.value) })}
                            />
                          </div>
                        </div>
                        <div className="form-actions">
                          <button className="btn-cancel" onClick={() => { setEditingVitalId(null); setVitalForm({}); }}>{t('patientDetail.cancel')}</button>
                          <button className="btn-save" onClick={() => updateVitalMutation.mutate({ vitalId: vital.idVital!, updates: vitalForm })}>{t('patientDetail.save')}</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="vital-header">
                          <div className="vital-date">{formatDate(vital.date)}</div>
                          <div className="item-actions">
                            <button className="btn-icon-edit" onClick={() => { setEditingVitalId(vital.idVital!); setVitalForm(vital); }}>
                              <Edit2 size={14} />
                            </button>
                            <button className="btn-icon-delete" onClick={() => confirm(t('patientDetail.deleteVitals')) && deleteVitalMutation.mutate(vital.idVital!)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="vital-measurements">
                          {vital.systolic && vital.diastolic && (
                            <span className="vital-measure">
                              <Heart size={14} />
                              BP: {vital.systolic}/{vital.diastolic} mmHg
                            </span>
                          )}
                          {vital.heartRate && (
                            <span className="vital-measure">
                              <Activity size={14} />
                              HR: {vital.heartRate} bpm
                            </span>
                          )}
                          {vital.temperature && (
                            <span className="vital-measure">
                              Temp: {vital.temperature}°C
                            </span>
                          )}
                          {vital.oxygenSaturation && (
                            <span className="vital-measure">
                              O2: {vital.oxygenSaturation}%
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {vitals.length > visibleVitalsCount && (
                <button
                  className="btn-load-more"
                  onClick={() => setVisibleVitalsCount(prev => prev + 5)}
                >
                  {t('patientDetail.seeMore')} ({vitals.length - visibleVitalsCount} {t('patientDetail.remaining')})
                </button>
              )}
              </>
            ) : (
              <p className="no-data">{t('patientDetail.noVitals')}</p>
            )}
          </div>
          </>
          )}
        </div>

        {/* Lab Results */}
        <div className="info-section">
          <div className="section-header-wrapper">
            <h3 className="section-title collapsible" onClick={() => toggleSection('labs')}>
              <span className="section-title-content">
                <Beaker size={20} />
                {t('patientDetail.labResults')} ({labs.length})
              </span>
              {expandedSections.labs ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h3>
          </div>
          {expandedSections.labs && (
            <div className="section-content">
              {labs.length > 0 ? (
                <>
                  <div className="labs-list">
                    {labs.slice(0, visibleLabsCount).map((lab: Lab, index: number) => (
                      <div
                        key={lab.idLabs || index}
                        className="lab-item-compact clickable"
                        onClick={() => handleOpenLab(lab)}
                      >
                        <Beaker size={16} className="lab-icon" />
                        <span className="lab-name-compact">
                          {lab.testName || `Lab Test #${lab.idContent}`}
                        </span>
                        <span className="lab-value-compact">{lab.value}</span>
                        <span className="lab-date-compact">{formatDate(lab.date)}</span>
                      </div>
                    ))}
                  </div>
                  {labs.length > visibleLabsCount && (
                    <button
                      className="btn-load-more"
                      onClick={() => setVisibleLabsCount(prev => prev + 5)}
                    >
                      {t('patientDetail.seeMore')} ({labs.length - visibleLabsCount} {t('patientDetail.remaining')})
                    </button>
                  )}
                </>
              ) : (
                <p className="no-data">{t('patientDetail.noLabResults')}</p>
              )}
            </div>
          )}
        </div>

        {/* Vaccinations */}
        <div className="info-section">
          <div className="section-header-wrapper">
            <h3 className="section-title collapsible" onClick={() => toggleSection('vaccines')}>
              <span className="section-title-content">
                <Syringe size={20} />
                {t('patientDetail.vaccinations')} ({vaccines.length})
              </span>
              {expandedSections.vaccines ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h3>
            {expandedSections.vaccines && (
              <div className="section-button-row">
                <button className="btn-add-small" onClick={() => setShowAddVaccine(true)}>
                  <Plus size={16} /> {t('patientDetail.addVaccine')}
                </button>
              </div>
            )}
          </div>
          {expandedSections.vaccines && (
          <>

          {showAddVaccine && (
            <div className="crud-form">
              <h4>{t('patientDetail.addNewVaccine')}</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('patientDetail.vaccineName')} {t('patientDetail.required')}</label>
                  <input
                    type="text"
                    value={vaccineForm.vaccineName || ''}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, vaccineName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.date')} {t('patientDetail.required')}</label>
                  <input
                    type="date"
                    value={vaccineForm.date || ''}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.dose')}</label>
                  <input
                    type="text"
                    value={vaccineForm.dose || ''}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, dose: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.manufacturer')}</label>
                  <input
                    type="text"
                    value={vaccineForm.manufacturer || ''}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, manufacturer: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.nextDoseDate')}</label>
                  <input
                    type="date"
                    value={vaccineForm.nextDose || ''}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, nextDose: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => { setShowAddVaccine(false); setVaccineForm({}); }}>{t('patientDetail.cancel')}</button>
                <button className="btn-save" onClick={() => createVaccineMutation.mutate(vaccineForm)}>{t('patientDetail.save')}</button>
              </div>
            </div>
          )}

          <div className="section-content">
            {vaccines.length > 0 ? (
              <div className="vaccines-list">
                {vaccines.map((vaccine: Vaccine, index: number) => (
                  <div key={vaccine.idVaccine || index} className="vaccine-item">
                    {editingVaccineId === vaccine.idVaccine ? (
                      <div className="crud-form-inline">
                        <div className="form-grid">
                          <div className="form-group">
                            <label>{t('patientDetail.vaccineName')}</label>
                            <input
                              type="text"
                              value={vaccineForm.vaccineName || vaccine.vaccineName || ''}
                              onChange={(e) => setVaccineForm({ ...vaccineForm, vaccineName: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.date')}</label>
                            <input
                              type="date"
                              value={vaccineForm.date || vaccine.date}
                              onChange={(e) => setVaccineForm({ ...vaccineForm, date: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.dose')}</label>
                            <input
                              type="text"
                              value={vaccineForm.dose || vaccine.dose || ''}
                              onChange={(e) => setVaccineForm({ ...vaccineForm, dose: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.manufacturer')}</label>
                            <input
                              type="text"
                              value={vaccineForm.manufacturer || vaccine.manufacturer || ''}
                              onChange={(e) => setVaccineForm({ ...vaccineForm, manufacturer: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.nextDose')}</label>
                            <input
                              type="date"
                              value={vaccineForm.nextDose || vaccine.nextDose || ''}
                              onChange={(e) => setVaccineForm({ ...vaccineForm, nextDose: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="form-actions">
                          <button className="btn-cancel" onClick={() => { setEditingVaccineId(null); setVaccineForm({}); }}>{t('patientDetail.cancel')}</button>
                          <button className="btn-save" onClick={() => updateVaccineMutation.mutate({ vaccineId: vaccine.idVaccine, updates: vaccineForm })}>{t('patientDetail.save')}</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="vaccine-header">
                          <div>
                            <span className="vaccine-name">{vaccine.vaccineName || t('patientDetail.unknownVaccine')}</span>
                            <span className="vaccine-date">{formatDate(vaccine.date)}</span>
                          </div>
                          <div className="item-actions">
                            <button className="btn-icon-edit" onClick={() => { setEditingVaccineId(vaccine.idVaccine); setVaccineForm(vaccine); }}>
                              <Edit2 size={14} />
                            </button>
                            <button className="btn-icon-delete" onClick={() => confirm(t('patientDetail.deleteVaccine')) && deleteVaccineMutation.mutate(vaccine.idVaccine)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {vaccine.dose && <p className="vaccine-dose">{t('patientDetail.dose')}: {vaccine.dose}</p>}
                        {vaccine.manufacturer && <p className="vaccine-manufacturer">{vaccine.manufacturer}</p>}
                        {vaccine.nextDose && (
                          <p className="vaccine-next">{t('patientDetail.nextDose')}: {formatDate(vaccine.nextDose)}</p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">{t('patientDetail.noVaccines')}</p>
            )}
          </div>
          </>
          )}
        </div>

        {/* Lifestyle Information */}
        {lifestyle && (lifestyle.alcohol || lifestyle.tobacco || lifestyle.drugs || lifestyle.physicalActivity) && (
          <div className="info-section">
            <h3 className="section-title collapsible" onClick={() => toggleSection('lifestyle')}>
              <span className="section-title-content">
                <Dumbbell size={20} />
                {t('patientDetail.lifestyle')}
              </span>
              {expandedSections.lifestyle ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h3>
            {expandedSections.lifestyle && (
            <div className="section-content">
              <div className="lifestyle-grid">
                {lifestyle.alcohol && (
                  <div className="lifestyle-item">
                    <div className="lifestyle-icon alcohol">
                      <Wine size={20} />
                    </div>
                    <div className="lifestyle-info">
                      <h4>{t('patientDetail.alcohol')}</h4>
                      <p>{t('patientDetail.frequency')}: {lifestyle.alcohol.frequency || 'N/A'}</p>
                      {lifestyle.alcohol.quantity && <p>{t('patientDetail.quantity')}: {lifestyle.alcohol.quantity}</p>}
                      {lifestyle.alcohol.type && <p>{t('patientDetail.type')}: {lifestyle.alcohol.type}</p>}
                    </div>
                  </div>
                )}
                {lifestyle.tobacco && (
                  <div className="lifestyle-item">
                    <div className="lifestyle-icon tobacco">
                      <Cigarette size={20} />
                    </div>
                    <div className="lifestyle-info">
                      <h4>{t('patientDetail.tobacco')}</h4>
                      <p>{t('patientDetail.frequency')}: {lifestyle.tobacco.frequency || 'N/A'}</p>
                      {lifestyle.tobacco.quantity && <p>{t('patientDetail.quantity')}: {lifestyle.tobacco.quantity}</p>}
                      {lifestyle.tobacco.yearsUsing && <p>{t('patientDetail.yearsUsing')}: {lifestyle.tobacco.yearsUsing}</p>}
                    </div>
                  </div>
                )}
                {lifestyle.drugs && (
                  <div className="lifestyle-item">
                    <div className="lifestyle-icon drugs">
                      <Pill size={20} />
                    </div>
                    <div className="lifestyle-info">
                      <h4>{t('patientDetail.drugs')}</h4>
                      <p>{t('patientDetail.type')}: {lifestyle.drugs.type || 'N/A'}</p>
                      {lifestyle.drugs.frequency && <p>{t('patientDetail.frequency')}: {lifestyle.drugs.frequency}</p>}
                    </div>
                  </div>
                )}
                {lifestyle.physicalActivity && (
                  <div className="lifestyle-item">
                    <div className="lifestyle-icon activity">
                      <Dumbbell size={20} />
                    </div>
                    <div className="lifestyle-info">
                      <h4>{t('patientDetail.physicalActivity')}</h4>
                      <p>{t('patientDetail.frequency')}: {lifestyle.physicalActivity.frequency || 'N/A'}</p>
                      {lifestyle.physicalActivity.type && <p>{t('patientDetail.type')}: {lifestyle.physicalActivity.type}</p>}
                      {lifestyle.physicalActivity.duration && <p>{t('patientDetail.duration')}: {lifestyle.physicalActivity.duration}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        )}

        {/* Emergency Contacts */}
        <div className="info-section">
          <div className="section-header-wrapper">
            <h3 className="section-title collapsible" onClick={() => toggleSection('contacts')}>
              <span className="section-title-content">
                <Users size={20} />
                {t('patientDetail.emergencyContacts')} ({contacts.length})
              </span>
              {expandedSections.contacts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h3>
            {expandedSections.contacts && (
              <div className="section-button-row">
                <button className="btn-add-small" onClick={() => setShowAddContact(true)}>
                  <Plus size={16} /> {t('patientDetail.addContact')}
                </button>
              </div>
            )}
          </div>
          {expandedSections.contacts && (
          <>

          {showAddContact && (
            <div className="crud-form">
              <h4>{t('patientDetail.addEmergencyContact')}</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('patientDetail.name')} {t('patientDetail.required')}</label>
                  <input
                    type="text"
                    value={contactForm.name || ''}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.relationship')}</label>
                  <input
                    type="text"
                    value={contactForm.relationship || ''}
                    onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.phone')}</label>
                  <input
                    type="tel"
                    value={contactForm.phone || ''}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.email')}</label>
                  <input
                    type="email"
                    value={contactForm.email || ''}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group full-width">
                  <label>{t('patientDetail.address')}</label>
                  <input
                    type="text"
                    value={contactForm.address || ''}
                    onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => { setShowAddContact(false); setContactForm({}); }}>{t('patientDetail.cancel')}</button>
                <button className="btn-save" onClick={() => createContactMutation.mutate(contactForm)}>{t('patientDetail.save')}</button>
              </div>
            </div>
          )}

          <div className="section-content">
            {contacts.length > 0 ? (
              <div className="contacts-list">
                {contacts.map((contact: Contact, index: number) => (
                  <div key={contact.idContact || index} className="contact-item">
                    {editingContactId === contact.idContact ? (
                      <div className="crud-form-inline">
                        <div className="form-grid">
                          <div className="form-group">
                            <label>{t('patientDetail.name')}</label>
                            <input
                              type="text"
                              value={contactForm.name || contact.name || ''}
                              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.relationship')}</label>
                            <input
                              type="text"
                              value={contactForm.relationship || contact.relationship || ''}
                              onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.phone')}</label>
                            <input
                              type="tel"
                              value={contactForm.phone || contact.phone || ''}
                              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.email')}</label>
                            <input
                              type="email"
                              value={contactForm.email || contact.email || ''}
                              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            />
                          </div>
                          <div className="form-group full-width">
                            <label>{t('patientDetail.address')}</label>
                            <input
                              type="text"
                              value={contactForm.address || contact.address || ''}
                              onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="form-actions">
                          <button className="btn-cancel" onClick={() => { setEditingContactId(null); setContactForm({}); }}>{t('patientDetail.cancel')}</button>
                          <button className="btn-save" onClick={() => updateContactMutation.mutate({ contactId: contact.idContact, updates: contactForm })}>{t('patientDetail.save')}</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="contact-header">
                          <div>
                            <span className="contact-name">{contact.name || t('patientDetail.unknown')}</span>
                            {contact.relationship && <span className="contact-relationship">{contact.relationship}</span>}
                          </div>
                          <div className="item-actions">
                            <button className="btn-icon-edit" onClick={() => { setEditingContactId(contact.idContact); setContactForm(contact); }}>
                              <Edit2 size={14} />
                            </button>
                            <button className="btn-icon-delete" onClick={() => confirm(t('patientDetail.deleteContact')) && deleteContactMutation.mutate(contact.idContact)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="contact-details">
                          {contact.phone && (
                            <div className="contact-detail">
                              <Phone size={14} />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="contact-detail">
                              <Mail size={14} />
                              <span>{contact.email}</span>
                            </div>
                          )}
                          {contact.address && (
                            <div className="contact-detail">
                              <MapPin size={14} />
                              <span>{contact.address}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">{t('patientDetail.noContacts')}</p>
            )}
          </div>
          </>
          )}
        </div>

        {/* Documents/Files */}
        <div className="info-section">
          <div className="section-header-wrapper">
            <h3 className="section-title collapsible" onClick={() => toggleSection('documents')}>
              <span className="section-title-content">
                <File size={20} />
                {t('patientDetail.documents')} ({files.length})
              </span>
              {expandedSections.documents ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h3>
            {expandedSections.documents && (
              <div className="section-button-row">
                <button className="btn-add-small" onClick={() => setShowUploadFile(true)}>
                  <Plus size={16} /> {t('patientDetail.uploadDocument')}
                </button>
              </div>
            )}
          </div>
          {expandedSections.documents && (
            <>
            {showUploadFile && (
              <div className="crud-form">
                <h4>{t('patientDetail.uploadNewDocument')}</h4>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>{t('patientDetail.selectFile')} {t('patientDetail.required')}</label>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,video/*,audio/*,.pdf"
                    />
                    {selectedFile && (
                      <p className="file-selected-name">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
                    )}
                  </div>
                  <div className="form-group full-width">
                    <label>{t('patientDetail.notes')}</label>
                    <textarea
                      value={fileComment}
                      onChange={(e) => setFileComment(e.target.value)}
                      rows={3}
                      placeholder={t('patientDetail.notes')}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn-cancel" onClick={() => { setShowUploadFile(false); setSelectedFile(null); setFileComment(''); }}>
                    {t('patientDetail.cancel')}
                  </button>
                  <button
                    className="btn-save"
                    onClick={handleUploadFile}
                    disabled={!selectedFile || uploadFileMutation.isPending}
                  >
                    {uploadFileMutation.isPending ? t('patientDetail.uploading') : t('patientDetail.save')}
                  </button>
                </div>
              </div>
            )}
            {files.length > 0 ? (
            <div className="section-content">
              <>
              <div className="files-list">
                {files.slice(0, visibleFilesCount).map((file: PatientFile, index: number) => (
                  <div
                    key={file.idFile || index}
                    className="file-item-compact"
                  >
                    <div className="file-item-content" onClick={() => handleOpenFile(file)}>
                      <File size={16} />
                      <span className="file-name-compact">{file.name || t('patientDetail.unnamedFile')}</span>
                      <span className="file-date-compact">{new Date(file.date).toLocaleDateString()}</span>
                    </div>
                    <button
                      className="btn-icon-delete-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.idFile);
                      }}
                      title={t('patientDetail.deleteFile')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {files.length > visibleFilesCount && (
                <button
                  className="btn-load-more"
                  onClick={() => setVisibleFilesCount(prev => prev + 5)}
                >
                  {t('patientDetail.seeMore')} ({files.length - visibleFilesCount} {t('patientDetail.remaining')})
                </button>
              )}
              </>
            </div>
            ) : (
              <div className="section-content">
                <p className="no-data">{t('patientDetail.noDocumentsYet')}</p>
              </div>
            )}
            </>
            )}
        </div>

        {/* Appointments Section */}
        <div className="info-section">
          <h3 className="section-title collapsible" onClick={() => toggleSection('appointments')}>
            <span className="section-title-content">
              <Calendar size={20} />
              {t('medic.patientDetail.appointmentHistory')} ({appointments.length})
            </span>
            {expandedSections.appointments ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </h3>
          {!showAddAppointment && expandedSections.appointments && (
            <div className="section-button-row">
              <button className="btn-add-small" onClick={() => setShowAddAppointment(true)}>
                <Plus size={16} />
              </button>
            </div>
          )}
          {expandedSections.appointments && (
          <>

          {showAddAppointment && (
            <div className="appointment-form">
              <h3>{t('medic.patientDetail.addAppointment')}</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>{t('medic.patientDetail.appointmentDate')}</label>
                  <div className="input-with-icon">
                    <Calendar size={18} />
                    <input
                      type="datetime-local"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>{t('medic.patientDetail.reason')}</label>
                  <textarea
                    value={newAppointment.motive}
                    onChange={(e) => setNewAppointment({...newAppointment, motive: e.target.value})}
                    className="form-textarea"
                    rows={2}
                  />
                </div>

                <div className="form-group full-width">
                  <label>{t('medic.patientDetail.notes')}</label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-cancel" onClick={handleCancelAddAppointment}>
                  <X size={18} />
                  <span>{t('medic.patientDetail.cancel')}</span>
                </button>
                <button className="btn-save" onClick={handleAddAppointment}>
                  <Save size={18} />
                  <span>{t('medic.patientDetail.save')}</span>
                </button>
              </div>
            </div>
          )}

          {appointments.length === 0 && !showAddAppointment ? (
            <div className="empty-appointments">
              <span className="icon-large">📅</span>
              <p>{t('medic.patientDetail.noAppointments')}</p>
            </div>
          ) : (
            <div className="appointments-list">
              {appointments.map((appointment: Appointment) =>
                editingAppointmentId === appointment.idHistory ? (
                  <div key={appointment.idHistory} className="appointment-edit-form">
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label>{t('medic.patientDetail.appointmentDate')}</label>
                        <div className="input-with-icon">
                          <Calendar size={18} />
                          <input
                            type="datetime-local"
                            value={editedAppointment.date || ''}
                            onChange={(e) => setEditedAppointment({...editedAppointment, date: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="form-group full-width">
                        <label>{t('medic.patientDetail.motive')}</label>
                        <textarea
                          value={editedAppointment.motive || ''}
                          onChange={(e) => setEditedAppointment({...editedAppointment, motive: e.target.value})}
                          className="form-textarea"
                          rows={2}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>{t('medic.patientDetail.notes')}</label>
                        <textarea
                          value={editedAppointment.notes || ''}
                          onChange={(e) => setEditedAppointment({...editedAppointment, notes: e.target.value})}
                          className="form-textarea"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button className="btn-cancel" onClick={handleCancelEditAppointment}>
                        <X size={18} />
                        <span>{t('medic.patientDetail.cancel')}</span>
                      </button>
                      <button className="btn-save" onClick={handleSaveEditedAppointment}>
                        <Save size={18} />
                        <span>{t('medic.patientDetail.save')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={appointment.idHistory} className="appointment-card-compact" onClick={() => handleViewAppointment(appointment)}>
                    <Calendar size={16} className="appointment-icon" />
                    <span className="appointment-date-text">
                      {formatDate(appointment.date)}
                    </span>
                    <div className="appointment-indicators">
                      {appointment.motive && (
                        <span className="appointment-badge" title="Has motive/diagnosis">
                          <FileText size={12} />
                        </span>
                      )}
                      {appointment.notes && (
                        <span className="appointment-badge" title="Has notes">
                          <FileText size={12} />
                        </span>
                      )}
                      {appointment.medications && (
                        <span className="appointment-badge" title="Has medications">
                          <Pill size={12} />
                        </span>
                      )}
                    </div>
                    {isAppointmentToday(appointment.date) && (
                      <div className="appointment-actions">
                        <button
                          className="btn-icon-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAppointment(appointment);
                          }}
                          title={t('medic.patientDetail.edit')}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAppointment(appointment.idHistory);
                          }}
                          title={t('medic.patientDetail.deleteAppointment')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
          </>
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {viewingAppointment && (
        <div className="modal-overlay" onClick={handleCloseAppointmentDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('medic.patientDetail.appointmentDetails')}</h2>
              <button className="btn-close-modal" onClick={handleCloseAppointmentDetail}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-item">
                <div className="detail-label">
                  <Calendar size={18} />
                  <span>{t('medic.patientDetail.appointmentDate')}</span>
                </div>
                <div className="detail-value">
                  {formatDate(viewingAppointment.date)}
                </div>
              </div>

              {viewingAppointment.motive && (
                <div className="detail-item">
                  <div className="detail-label">
                    <Calendar size={18} />
                    <span>{t('medic.patientDetail.motive')}</span>
                  </div>
                  <div className="detail-value">
                    {viewingAppointment.motive}
                  </div>
                </div>
              )}

              {viewingAppointment.diagnosisIds && (
                <div className="detail-item">
                  <div className="detail-label">
                    <FileText size={18} />
                    <span>Diagnosis IDs</span>
                  </div>
                  <div className="detail-value">
                    {viewingAppointment.diagnosisIds}
                  </div>
                </div>
              )}

              {viewingAppointment.medications && (
                <div className="detail-item">
                  <div className="detail-label">
                    <Calendar size={18} />
                    <span>{t('medic.patientDetail.medications')}</span>
                  </div>
                  <div className="detail-value">
                    {viewingAppointment.medications}
                  </div>
                </div>
              )}

              {viewingAppointment.notes && (
                <div className="detail-item">
                  <div className="detail-label">
                    <Calendar size={18} />
                    <span>{t('medic.patientDetail.notes')}</span>
                  </div>
                  <div className="detail-value">
                    {viewingAppointment.notes}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="btn-edit"
                  onClick={() => {
                    handleCloseAppointmentDetail();
                    handleEditAppointment(viewingAppointment);
                  }}
                >
                  <Edit2 size={16} />
                  <span>{t('medic.patientDetail.edit')}</span>
                </button>
                <button
                  className="btn-delete"
                  onClick={() => {
                    handleCloseAppointmentDetail();
                    handleDeleteAppointment(viewingAppointment.idHistory);
                  }}
                >
                  <Trash2 size={16} />
                  <span>{t('medic.patientDetail.deleteAppointment')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lab Result Detail Modal */}
      {showLabModal && selectedLab && (
        <div className="modal-overlay" onClick={() => setShowLabModal(false)}>
          <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedLab.testName || `Lab Test #${selectedLab.idContent}`}</h2>
              <button className="btn-close-modal" onClick={() => setShowLabModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="lab-modal-result">
                <span className="lab-modal-label">{t('patientDetail.result')}:</span>
                <span className="lab-modal-value">{selectedLab.value}</span>
              </div>
              <div className="lab-modal-date">
                {formatDate(selectedLab.date)}
              </div>
              {selectedLab.comment && (
                <div className="lab-modal-comment">
                  {selectedLab.comment}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
