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

interface SubsequentNoteData {
  date?: string;
  motive?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
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
  const [editedAppointment, setEditedAppointment] = useState<Partial<Appointment & { diagnosis?: string; treatment?: string }>>({});
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);

  // Allergy state
  const [editingAllergyId, setEditingAllergyId] = useState<number | null>(null);
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [allergyForm, setAllergyForm] = useState<Partial<Allergy>>({});

  // Vital state
  const [showAddVital, setShowAddVital] = useState(false);
  const [vitalForm, setVitalForm] = useState<Partial<Vital>>({});
  const [showVitalConfirmation, setShowVitalConfirmation] = useState(false);


  // Files state
  const [visibleFilesCount, setVisibleFilesCount] = useState(5);

  // Vitals pagination state
  const [visibleVitalsCount, setVisibleVitalsCount] = useState(5);

  // Lab modal state
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [showLabModal, setShowLabModal] = useState(false);
  const [showAddLab, setShowAddLab] = useState(false);
  const [labForm, setLabForm] = useState<{
    idContent?: number;
    testName?: string;
    value?: number;
    unit?: string;
    referenceRange?: string;
    comment?: string;
    date?: string;
  }>({});

  // Vaccine state
  const [editingVaccineId, setEditingVaccineId] = useState<number | null>(null);
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [vaccineForm, setVaccineForm] = useState<Partial<Vaccine>>({});


  // Contact state
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState<Partial<Contact>>({});

  // File upload state
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileComment, setFileComment] = useState('');
  // Subsequent note (nota subsecuente) state
  const [subsequentNoteForm, setSubsequentNoteForm] = useState({
    date: '',
    motive: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  });

  // Lifestyle & Insurance state (single edit mode since they're unique objects)
  // TODO: Implement lifestyle editing functionality
  // const [editingLifestyle, setEditingLifestyle] = useState(false);
  // const [lifestyleForm, setLifestyleForm] = useState<any>({});
  const [editingInsurance, setEditingInsurance] = useState(false);
  const [insuranceForm, setInsuranceForm] = useState<{
    idInsurance?: number | null;
    policy?: string;
    insuranceComment?: string;
  }>({});

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

  // Fetch insurance list
  const { data: insurancesList, isLoading: isLoadingInsurances, error: insurancesError } = useQuery({
    queryKey: ['insurances'],
    queryFn: async () => {
      const response = await api.get('/patients/insurances/list');
      return response.data;
    },
  });


  const patient = data?.patient;
  const appointments = data?.history || [];
  const allergies = data?.allergies || [];
  const vitals = data?.vitals || [];
  const labs = data?.labs || [];
  const vaccines = data?.vaccines || [];
  const contacts = data?.contacts || [];
  const lifestyle = data?.lifestyle;
  const insurance = data?.insurance;
  const profession = data?.profession;
  const religion = data?.religion;
  const nationality = data?.nationality;
  const education = data?.education;
  const files = data?.files || [];
  const clinicalHistoryBackground = data?.clinicalHistoryBackground;

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
      // Close any open forms
      setShowAddLab(false);
      setShowUploadFile(false);
      setShowAddVaccine(false);
      setLabForm({});
      setSelectedFile(null);
      setFileComment('');
      setSubsequentNoteForm({
        date: '',
        motive: '',
        diagnosis: '',
        treatment: '',
        notes: ''
      });
      setVaccineForm({});
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
      diagnosis: newAppointment.diagnosis,
      treatment: newAppointment.treatment,
      notes: newAppointment.notes,
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
    // Close any open forms
    setShowAddLab(false);
    setShowUploadFile(false);
    setShowAddVaccine(false);
    setLabForm({});
    setSelectedFile(null);
    setFileComment('');
    setSubsequentNoteForm({
      date: '',
      motive: '',
      diagnosis: '',
      treatment: '',
      notes: ''
    });
    setVaccineForm({});
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointmentId(appointment.idHistory);
    setEditedAppointment({
      date: appointment.date,
      motive: appointment.motive,
      diagnosis: appointment.diagnosisIds || '',
      treatment: appointment.medications || '',
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
      // Close any open forms
      setShowAddLab(false);
      setShowUploadFile(false);
      setShowAddVaccine(false);
      setLabForm({});
      setSelectedFile(null);
      setFileComment('');
      setSubsequentNoteForm({
        date: '',
        motive: '',
        diagnosis: '',
        treatment: '',
        notes: ''
      });
      setVaccineForm({});
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
          diagnosis: editedAppointment.diagnosis,
          treatment: editedAppointment.treatment,
          notes: editedAppointment.notes,
        },
      });
    }
  };

  const handleCancelEditAppointment = () => {
    setEditingAppointmentId(null);
    setEditedAppointment({});
    // Close any open forms
    setShowAddLab(false);
    setShowUploadFile(false);
    setShowAddVaccine(false);
    setLabForm({});
    setSelectedFile(null);
    setFileComment('');
    setSubsequentNoteForm({
      date: '',
      motive: '',
      diagnosis: '',
      treatment: '',
      notes: ''
    });
    setVaccineForm({});
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
      // Validate required fields
      if (!allergyData.allergyName || !allergyData.severity || !allergyData.type || !allergyData.reaction) {
        throw new Error(t('patientDetail.allFieldsRequired'));
      }
      const response = await api.post(`/medics/patients/${patient?.idPatient}/allergies`, allergyData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setShowAddAllergy(false);
      setAllergyForm({});
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || error.message || t('patientDetail.saveError'));
    },
  });

  const updateAllergyMutation = useMutation({
    mutationFn: async ({ allergyId, updates }: { allergyId: number; updates: any }) => {
      // Validate required fields
      if (!updates.allergyName || !updates.severity || !updates.type || !updates.reaction) {
        throw new Error(t('patientDetail.allFieldsRequired'));
      }
      const response = await api.patch(`/medics/patients/${patient?.idPatient}/allergies/${allergyId}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setEditingAllergyId(null);
      setAllergyForm({});
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || error.message || t('patientDetail.saveError'));
    },
  });

  const deleteAllergyMutation = useMutation({
    mutationFn: async (allergyId: number) => {
      const response = await api.delete(`/medics/patients/${patient?.idPatient}/allergies/${allergyId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || error.message || t('patientDetail.deleteError'));
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
      setShowVitalConfirmation(false);
      setVitalForm({});
      alert(t('patientDetail.vitalSavedSuccess'));
    },
    onError: (error: any) => {
      console.error('Error creating vital:', error);
      alert(error.response?.data?.message || error.message || t('patientDetail.saveError'));
    },
  });

  // Function to validate and confirm vital data before saving
  const handleVitalSave = () => {
    // Validate required fields
    if (!vitalForm.date) {
      alert(t('patientDetail.dateRequired'));
      return;
    }

    // Show confirmation dialog with data summary
    setShowVitalConfirmation(true);
  };

  // Function to confirm and save vital data
  const confirmVitalSave = () => {
    createVitalMutation.mutate(vitalForm);
  };

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

  // ====== LAB RESULTS MUTATIONS ======
  const createLabMutation = useMutation({
    mutationFn: async (labData: any) => {
      const response = await api.post(`/medics/patients/${patient?.idPatient}/labs`, labData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setShowAddLab(false);
      setLabForm({});
      alert(t('patientDetail.vitalSavedSuccess'));
    },
    onError: (err: any) => {
      console.error('Error creating lab result:', err);
      alert(t('medic.patientDetail.saveError') + ': ' + (err.response?.data?.message || err.message));
    },
  });

  // Fetch available lab tests
  const { data: labTests } = useQuery({
    queryKey: ['lab-tests'],
    queryFn: async () => {
      const response = await api.get('/medics/lab-tests');
      return response.data;
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

  // ====== INSURANCE MUTATIONS ======
  const updateInsuranceMutation = useMutation({
    mutationFn: async (insuranceData: { idInsurance?: number | null; policy?: string; insuranceComment?: string }) => {
      const response = await api.patch(`/patients/${patient?.idPatient}`, insuranceData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setEditingInsurance(false);
      setInsuranceForm({});
    },
    onError: (err) => {
      console.error('Error updating insurance:', err);
      alert(t('patientDetail.saveError'));
    },
  });

  const deleteInsuranceMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/patients/${patient?.idPatient}`, {
        idInsurance: null,
        policy: '',
        insuranceComment: '',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
    },
    onError: (err) => {
      console.error('Error deleting insurance:', err);
      alert(t('patientDetail.deleteError'));
    },
  });

  // ====== INSURANCE HANDLERS ======
  const handleEditInsurance = () => {
    if (patient) {
      setInsuranceForm({
        idInsurance: patient.idInsurance || null,
        policy: patient.policy || '',
        insuranceComment: patient.insuranceComment || '',
      });
      setEditingInsurance(true);
    }
  };

  const handleCancelEditInsurance = () => {
    setEditingInsurance(false);
    setInsuranceForm({});
  };

  const handleSaveInsurance = () => {
    updateInsuranceMutation.mutate(insuranceForm);
  };

  const handleDeleteInsurance = () => {
    if (confirm(t('patientDetail.deleteInsuranceConfirm'))) {
      deleteInsuranceMutation.mutate();
    }
  };

  // ====== FILE UPLOAD MUTATION ======
  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, comment, subsequentNoteData }: { file: File; comment: string; subsequentNoteData?: SubsequentNoteData }) => {
      // First, create the clinical history (nota subsecuente) if data is provided
      let clinicalHistoryId = null;
      if (subsequentNoteData && (subsequentNoteData.date || subsequentNoteData.motive || subsequentNoteData.diagnosis || subsequentNoteData.treatment || subsequentNoteData.notes)) {
        try {
          const historyResponse = await api.post('/clinical-history', {
            idPatient: patient?.idPatient,
            date: subsequentNoteData.date || new Date().toISOString(),
            motive: subsequentNoteData.motive || '',
            diagnosis: subsequentNoteData.diagnosis || '',
            treatment: subsequentNoteData.treatment || '',
            notes: subsequentNoteData.notes || '',
            isEvolution: true
          });
          clinicalHistoryId = historyResponse.data.idHistory;
        } catch (err) {
          console.error('Error creating clinical history:', err);
          // Continue with file upload even if history creation fails
        }
      }

      // Then upload the file
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
      return { ...response.data, clinicalHistoryId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setShowUploadFile(false);
      setSelectedFile(null);
      setFileComment('');
      setSubsequentNoteForm({
        date: '',
        motive: '',
        diagnosis: '',
        treatment: '',
        notes: ''
      });
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
      uploadFileMutation.mutate({ 
        file: selectedFile, 
        comment: fileComment,
        subsequentNoteData: subsequentNoteForm
      });
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

  const formatDateShort = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Lab test categories mapping
  const labTestCategories: Record<string, string> = {
    // Biometría Hemática
    'Hemoglobina': 'biometriaHematica',
    'Hematocrito': 'biometriaHematica',
    'Leucocitos': 'biometriaHematica',
    'Plaquetas': 'biometriaHematica',
    // Química Sanguínea
    'Urea': 'quimicaSanguinea',
    'Creatinina': 'quimicaSanguinea',
    'Electrolitos': 'quimicaSanguinea',
    'Sodio': 'quimicaSanguinea',
    'Potasio': 'quimicaSanguinea',
    'Cloro': 'quimicaSanguinea',
    'Ácido Úrico': 'quimicaSanguinea',
    'Acido Úrico': 'quimicaSanguinea',
    'Hemoglobina Glucosilada': 'quimicaSanguinea',
    'Hemoglobina glucosilada': 'quimicaSanguinea',
    // Función Hepática
    'AST': 'funcionHepatica',
    'ALT': 'funcionHepatica',
    'Fosfatasa Alcalina': 'funcionHepatica',
    'Fosfatasa alcalina': 'funcionHepatica',
    'Bilirrubina Total': 'funcionHepatica',
    'Bilirrubina total': 'funcionHepatica',
    'Bilirrubina Directa': 'funcionHepatica',
    'Bilirrubina directa': 'funcionHepatica',
    'Directa': 'funcionHepatica',
    'Bilirrubina Indirecta': 'funcionHepatica',
    'Bilirrubina indirecta': 'funcionHepatica',
    'Indirecta': 'funcionHepatica',
    // Lípidos
    'Colesterol Total': 'lipidos',
    'Colesterol total': 'lipidos',
    'LDL': 'lipidos',
    'HDL': 'lipidos',
    'Triglicéridos': 'lipidos',
    'Trigliceridos': 'lipidos',
    'Lp(a)': 'lipidos',
    'Lpa': 'lipidos',
  };

  // Group labs by test name and category
  const groupLabsByTest = () => {
    const grouped: Record<string, { category: string; tests: Record<string, Lab[]> }> = {
      biometriaHematica: { category: 'biometriaHematica', tests: {} },
      quimicaSanguinea: { category: 'quimicaSanguinea', tests: {} },
      funcionHepatica: { category: 'funcionHepatica', tests: {} },
      lipidos: { category: 'lipidos', tests: {} },
      otros: { category: 'otros', tests: {} },
    };

    labs.forEach((lab) => {
      const testName = lab.testName || `Lab Test #${lab.idContent}`;
      const category = labTestCategories[testName] || 'otros';

      if (!grouped[category].tests[testName]) {
        grouped[category].tests[testName] = [];
      }
      grouped[category].tests[testName].push(lab);
    });

    // Sort each test's labs by date (newest first)
    Object.keys(grouped).forEach((category) => {
      Object.keys(grouped[category].tests).forEach((testName) => {
        grouped[category].tests[testName].sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA; // Newest first
        });
      });
    });

    return grouped;
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
        <div className="info-section">
          <div className="section-header-wrapper">
            <h3 className="section-title collapsible" onClick={() => toggleSection('insurance')}>
              <span className="section-title-content">
                <ShieldAlert size={20} />
                {t('patientDetail.insurance')}
              </span>
              {expandedSections.insurance ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h3>
            {expandedSections.insurance && !editingInsurance && (insurance || patient?.idInsurance) && (
              <div className="section-button-row">
                <button className="btn-edit-small" onClick={handleEditInsurance}>
                  <Edit2 size={16} /> {t('patientDetail.edit')}
                </button>
              </div>
            )}
            {expandedSections.insurance && !editingInsurance && !insurance && !patient?.idInsurance && (
              <div className="section-button-row">
                <button className="btn-add-small" onClick={handleEditInsurance}>
                  <Plus size={16} /> {t('patientDetail.addInsurance')}
                </button>
              </div>
            )}
          </div>
          {expandedSections.insurance && (
            <div className="section-content">
              {editingInsurance ? (
                <div className="crud-form">
                  <h4>{insurance ? t('patientDetail.editInsurance') : t('patientDetail.addInsurance')}</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('patientDetail.insuranceName')} {t('patientDetail.required')}</label>
                      <select
                        value={insuranceForm.idInsurance || ''}
                        onChange={(e) => setInsuranceForm({ ...insuranceForm, idInsurance: e.target.value ? parseInt(e.target.value) : null })}
                        disabled={isLoadingInsurances}
                      >
                        <option value="">{isLoadingInsurances ? t('patientDetail.loading') : t('patientDetail.select')}</option>
                        {insurancesList && insurancesList.length > 0 ? (
                          insurancesList.map((ins: { idInsurance: number; name: string }) => (
                            <option key={ins.idInsurance} value={ins.idInsurance}>
                              {ins.name}
                            </option>
                          ))
                        ) : (
                          !isLoadingInsurances && <option value="" disabled>{t('patientDetail.noInsurancesAvailable')}</option>
                        )}
                      </select>
                      {insurancesError && (
                        <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                          {t('patientDetail.errorLoadingInsurances')}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>{t('patientDetail.policyNumber')}</label>
                      <input
                        type="text"
                        value={insuranceForm.policy || ''}
                        onChange={(e) => setInsuranceForm({ ...insuranceForm, policy: e.target.value })}
                        placeholder={t('patientDetail.policyNumber')}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>{t('patientDetail.insuranceComment')}</label>
                      <textarea
                        value={insuranceForm.insuranceComment || ''}
                        onChange={(e) => setInsuranceForm({ ...insuranceForm, insuranceComment: e.target.value })}
                        rows={3}
                        placeholder={t('patientDetail.insuranceCommentPlaceholder')}
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    {insurance || patient?.idInsurance ? (
                      <button className="btn-delete" onClick={handleDeleteInsurance} disabled={deleteInsuranceMutation.isPending}>
                        <Trash2 size={16} /> {deleteInsuranceMutation.isPending ? t('patientDetail.deleting') : t('patientDetail.delete')}
                      </button>
                    ) : null}
                    <button className="btn-cancel" onClick={handleCancelEditInsurance}>
                      {t('patientDetail.cancel')}
                    </button>
                    <button className="btn-save" onClick={handleSaveInsurance} disabled={updateInsuranceMutation.isPending}>
                      {updateInsuranceMutation.isPending ? t('patientDetail.saving') : t('patientDetail.save')}
                    </button>
                  </div>
                </div>
              ) : insurance || patient?.idInsurance ? (
                <>
                  <div className="info-row">
                    <span className="info-row-label">{t('patientDetail.insuranceName')}</span>
                    <span className="info-row-value">{insurance?.name || 'N/A'}</span>
                  </div>
                  {insurance?.type && (
                    <div className="info-row">
                      <span className="info-row-label">{t('patientDetail.insuranceType')}</span>
                      <span className="info-row-value">{insurance.type}</span>
                    </div>
                  )}
                  {patient?.policy && (
                    <div className="info-row">
                      <span className="info-row-label">{t('patientDetail.policyNumber')}</span>
                      <span className="info-row-value">{patient.policy}</span>
                    </div>
                  )}
                  {patient?.insuranceComment && (
                    <div className="info-row">
                      <span className="info-row-label">{t('patientDetail.insuranceComment')}</span>
                      <span className="info-row-value">{patient.insuranceComment}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="no-data">{t('patientDetail.noInsurance')}</p>
              )}
            </div>
          )}
        </div>

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
                    required
                    value={allergyForm.allergyName || ''}
                    onChange={(e) => setAllergyForm({ ...allergyForm, allergyName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('patientDetail.severityLabel')} {t('patientDetail.required')}</label>
                  <select
                    required
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
                  <label>{t('patientDetail.type')} {t('patientDetail.required')}</label>
                  <input
                    type="text"
                    required
                    value={allergyForm.type || ''}
                    onChange={(e) => setAllergyForm({ ...allergyForm, type: e.target.value })}
                  />
                </div>
                <div className="form-group full-width">
                  <label>{t('patientDetail.reaction')} {t('patientDetail.required')}</label>
                  <textarea
                    required
                    value={allergyForm.reaction || ''}
                    onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => { setShowAddAllergy(false); setAllergyForm({}); }}>{t('patientDetail.cancel')}</button>
                <button 
                  className="btn-save" 
                  onClick={() => {
                    if (!allergyForm.allergyName || !allergyForm.severity || !allergyForm.type || !allergyForm.reaction) {
                      alert(t('patientDetail.allFieldsRequired'));
                      return;
                    }
                    createAllergyMutation.mutate(allergyForm);
                  }}
                  disabled={createAllergyMutation.isPending}
                >
                  {createAllergyMutation.isPending ? t('patientDetail.saving') : t('patientDetail.save')}
                </button>
              </div>
            </div>
          )}

          <div className="section-content">
            {allergies.length > 0 ? (
              <div className="allergies-list">
                {allergies.map((allergy: Allergy) => (
                  <div key={allergy.idPatientAllergy || allergy.idElement} className="allergy-item">
                    {editingAllergyId === (allergy.idPatientAllergy || allergy.idElement) ? (
                      <div className="crud-form-inline">
                        <div className="form-grid">
                          <div className="form-group">
                            <label>{t('patientDetail.allergyName')} {t('patientDetail.required')}</label>
                            <input
                              type="text"
                              required
                              value={allergyForm.allergyName || allergy.allergyName || ''}
                              onChange={(e) => setAllergyForm({ ...allergyForm, allergyName: e.target.value })}
                            />
                          </div>
                          <div className="form-group">
                            <label>{t('patientDetail.severityLabel')} {t('patientDetail.required')}</label>
                            <select
                              required
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
                            <label>{t('patientDetail.type')} {t('patientDetail.required')}</label>
                            <input
                              type="text"
                              required
                              value={allergyForm.type || allergy.type || ''}
                              onChange={(e) => setAllergyForm({ ...allergyForm, type: e.target.value })}
                            />
                          </div>
                          <div className="form-group full-width">
                            <label>{t('patientDetail.reaction')} {t('patientDetail.required')}</label>
                            <textarea
                              required
                              value={allergyForm.reaction || allergy.reaction || ''}
                              onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className="form-actions">
                          <button className="btn-cancel" onClick={() => { setEditingAllergyId(null); setAllergyForm({}); }}>{t('patientDetail.cancel')}</button>
                          <button 
                            className="btn-save" 
                            onClick={() => {
                              if (!allergyForm.allergyName && !allergy.allergyName || !allergyForm.severity && !allergy.severity || !allergyForm.type && !allergy.type || !allergyForm.reaction && !allergy.reaction) {
                                alert(t('patientDetail.allFieldsRequired'));
                                return;
                              }
                              const allergyId = allergy.idPatientAllergy || allergy.idElement;
                              if (!allergyId) {
                                alert(t('patientDetail.saveError'));
                                return;
                              }
                              updateAllergyMutation.mutate({ 
                                allergyId, 
                                updates: {
                                  allergyName: allergyForm.allergyName || allergy.allergyName,
                                  severity: allergyForm.severity || allergy.severity,
                                  type: allergyForm.type || allergy.type,
                                  reaction: allergyForm.reaction || allergy.reaction,
                                }
                              });
                            }}
                            disabled={updateAllergyMutation.isPending}
                          >
                            {updateAllergyMutation.isPending ? t('patientDetail.saving') : t('patientDetail.save')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="allergy-content">
                        <div className="allergy-header">
                          <div className="allergy-title-section">
                            <AlertTriangle size={16} className="allergy-icon" />
                            <span className="allergy-name">{allergy.allergyName || allergy.name || t('patientDetail.unknown')}</span>
                            {allergy.type && <span className="allergy-type-badge">{allergy.type}</span>}
                            {allergy.severity && (
                              <span className={`severity-badge ${allergy.severity.toLowerCase()}`}>
                                {t(`patientDetail.severity.${allergy.severity.toLowerCase()}`) || allergy.severity}
                              </span>
                            )}
                          </div>
                          <div className="item-actions">
                            <button className="btn-icon-edit" onClick={() => { 
                              const allergyId = allergy.idPatientAllergy || allergy.idElement;
                              if (allergyId) {
                                setEditingAllergyId(allergyId);
                                setAllergyForm(allergy);
                              }
                            }}>
                              <Edit2 size={14} />
                            </button>
                            <button className="btn-icon-delete" onClick={() => {
                              const allergyId = allergy.idPatientAllergy || allergy.idElement;
                              if (allergyId && confirm(t('patientDetail.deleteAllergyConfirm') || t('patientDetail.deleteAllergy'))) {
                                deleteAllergyMutation.mutate(allergyId);
                              }
                            }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        {allergy.reaction && (
                          <div className="allergy-reaction-compact">
                            <span className="allergy-reaction-text">{allergy.reaction}</span>
                          </div>
                        )}
                      </div>
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
                {t('patientDetail.pathologicalRecords')}
              </span>
              {expandedSections.pathological ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h3>
          </div>
          {expandedSections.pathological && (
            <div className="section-content">
              {clinicalHistoryBackground ? (
                <>
                  {/* Heredofamiliares */}
                  <div className="background-subsection">
                    <h4 className="background-subtitle">{t('patientDetail.heredofamiliares')}</h4>
                    {clinicalHistoryBackground.family ? (
                      <div className="background-content">
                        <p>{clinicalHistoryBackground.family}</p>
                      </div>
                    ) : (
                      <p className="no-data">{t('patientDetail.noData')}</p>
                    )}
                  </div>

                  {/* Personales Patológicos */}
                  <div className="background-subsection">
                    <h4 className="background-subtitle">{t('patientDetail.personalesPatologicos')}</h4>
                    {clinicalHistoryBackground.personal ? (
                      <div className="background-content">
                        <p>{clinicalHistoryBackground.personal}</p>
                      </div>
                    ) : (
                      <p className="no-data">{t('patientDetail.noData')}</p>
                    )}
                  </div>

                  {/* Personales No Patológicos */}
                  <div className="background-subsection">
                    <h4 className="background-subtitle">{t('patientDetail.personalesNoPatologicos')}</h4>
                    {clinicalHistoryBackground.nonPathological ? (
                      <div className="background-content">
                        <p>{clinicalHistoryBackground.nonPathological}</p>
                      </div>
                    ) : (
                      <p className="no-data">{t('patientDetail.noData')}</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="no-data">{t('patientDetail.noAntecedents')}</p>
              )}
            </div>
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
            <>
              {!showVitalConfirmation ? (
                <div className="crud-form">
                  <h4>{t('patientDetail.addNewVitalSigns')}</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('patientDetail.date')} {t('patientDetail.required')}</label>
                      <input
                        type="date"
                        value={vitalForm.date || ''}
                        onChange={(e) => setVitalForm({ ...vitalForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('patientDetail.systolic')}</label>
                      <input
                        type="number"
                        value={vitalForm.systolic || ''}
                        onChange={(e) => setVitalForm({ ...vitalForm, systolic: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('patientDetail.diastolic')}</label>
                      <input
                        type="number"
                        value={vitalForm.diastolic || ''}
                        onChange={(e) => setVitalForm({ ...vitalForm, diastolic: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('patientDetail.heartRate')}</label>
                      <input
                        type="number"
                        value={vitalForm.heartRate || ''}
                        onChange={(e) => setVitalForm({ ...vitalForm, heartRate: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('patientDetail.temperature')}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={vitalForm.temperature || ''}
                        onChange={(e) => setVitalForm({ ...vitalForm, temperature: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('patientDetail.oxygenSaturation')}</label>
                      <input
                        type="number"
                        value={vitalForm.oxygenSaturation || ''}
                        onChange={(e) => setVitalForm({ ...vitalForm, oxygenSaturation: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('patientDetail.respiratoryRate')}</label>
                      <input
                        type="number"
                        value={vitalForm.respiratoryRate || ''}
                        onChange={(e) => setVitalForm({ ...vitalForm, respiratoryRate: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn-cancel" onClick={() => { setShowAddVital(false); setVitalForm({}); setShowVitalConfirmation(false); }}>{t('patientDetail.cancel')}</button>
                    <button className="btn-save" onClick={handleVitalSave} disabled={createVitalMutation.isPending}>{t('patientDetail.continue')}</button>
                  </div>
                </div>
              ) : (
                <div className="crud-form">
                  <h4>{t('patientDetail.confirmVitalData')}</h4>
                  <div className="vital-confirmation">
                    <p className="confirmation-message">{t('patientDetail.confirmVitalMessage')}</p>
                    <div className="confirmation-data">
                      <div className="confirmation-row">
                        <strong>{t('patientDetail.date')}:</strong>
                        <span>{vitalForm.date ? formatDate(vitalForm.date) : '-'}</span>
                      </div>
                      {vitalForm.systolic && vitalForm.diastolic && (
                        <div className="confirmation-row">
                          <strong>{t('patientDetail.bloodPressure')}:</strong>
                          <span>{vitalForm.systolic}/{vitalForm.diastolic} mmHg</span>
                        </div>
                      )}
                      {vitalForm.heartRate && (
                        <div className="confirmation-row">
                          <strong>{t('patientDetail.heartRate')}:</strong>
                          <span>{vitalForm.heartRate} bpm</span>
                        </div>
                      )}
                      {vitalForm.temperature && (
                        <div className="confirmation-row">
                          <strong>{t('patientDetail.temperature')}:</strong>
                          <span>{vitalForm.temperature}°C</span>
                        </div>
                      )}
                      {vitalForm.oxygenSaturation && (
                        <div className="confirmation-row">
                          <strong>{t('patientDetail.oxygenSaturation')}:</strong>
                          <span>{vitalForm.oxygenSaturation}%</span>
                        </div>
                      )}
                      {vitalForm.respiratoryRate && (
                        <div className="confirmation-row">
                          <strong>{t('patientDetail.respiratoryRate')}:</strong>
                          <span>{vitalForm.respiratoryRate} rpm</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn-cancel" onClick={() => setShowVitalConfirmation(false)}>{t('patientDetail.goBack')}</button>
                    <button className="btn-save" onClick={confirmVitalSave} disabled={createVitalMutation.isPending}>
                      {createVitalMutation.isPending ? t('patientDetail.saving') : t('patientDetail.confirmAndSave')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="section-content">
            {vitals.length > 0 ? (
              <>
              <div className="vitals-list">
                {vitals.slice(0, visibleVitalsCount).map((vital: Vital, index: number) => (
                  <div key={vital.idVital || index} className="vital-item">
                    <div className="vital-header">
                      <div className="vital-date">{formatDate(vital.date)}</div>
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
                      {vital.respiratoryRate && (
                        <span className="vital-measure">
                          RR: {vital.respiratoryRate} rpm
                        </span>
                      )}
                    </div>
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
                  {(() => {
                    const groupedLabs = groupLabsByTest();
                    const categoryOrder = ['biometriaHematica', 'quimicaSanguinea', 'funcionHepatica', 'lipidos', 'otros'];
                    
                    return categoryOrder.map((categoryKey) => {
                      const category = groupedLabs[categoryKey];
                      const testNames = Object.keys(category.tests);
                      
                      if (testNames.length === 0) return null;
                      
                      return (
                        <div key={categoryKey} className="lab-category-group">
                          <h4 className="lab-category-title">
                            {t(`patientDetail.labTests.categories.${categoryKey}`)}
                          </h4>
                          {testNames.map((testName) => {
                            const testLabs = category.tests[testName];
                            const hasUnit = testLabs.some(lab => lab.unit);
                            const hasReferenceRange = testLabs.some(lab => lab.referenceRange);
                            const hasComment = testLabs.some(lab => lab.comment);
                            
                            // Calculate grid columns dynamically based on visible columns
                            const gridTemplate = `minmax(0, 1.2fr) minmax(0, 1fr)${hasUnit ? ' minmax(0, 1.2fr)' : ''}${hasReferenceRange ? ' minmax(0, 1.3fr)' : ''}${hasComment ? ' minmax(0, 1.8fr)' : ''}`;
                            
                            return (
                              <div key={testName} className="lab-test-group">
                                <h5 className="lab-test-name">{testName}</h5>
                                <div className="lab-historical-table">
                                  <div 
                                    className="lab-table-header"
                                    style={{ gridTemplateColumns: gridTemplate }}
                                  >
                                    <span className="lab-table-header-cell">{t('patientDetail.labTests.date')}</span>
                                    <span className="lab-table-header-cell">{t('patientDetail.labTests.value')}</span>
                                    {hasUnit && (
                                      <span className="lab-table-header-cell">{t('patientDetail.labTests.unit')}</span>
                                    )}
                                    {hasReferenceRange && (
                                      <span className="lab-table-header-cell">{t('patientDetail.labTests.referenceRange')}</span>
                                    )}
                                    {hasComment && (
                                      <span className="lab-table-header-cell">{t('patientDetail.labTests.comment')}</span>
                                    )}
                                  </div>
                                  <div className="lab-table-body">
                                    {testLabs.map((lab, index) => (
                                      <div
                                        key={lab.idLabs || index}
                                        className="lab-table-row clickable"
                                        style={{ gridTemplateColumns: gridTemplate }}
                                        onClick={() => handleOpenLab(lab)}
                                      >
                                        <span className="lab-table-cell">{formatDateShort(lab.date)}</span>
                                        <span className="lab-table-cell lab-value">{lab.value}</span>
                                        {hasUnit && (
                                          <span className="lab-table-cell">{lab.unit || '-'}</span>
                                        )}
                                        {hasReferenceRange && (
                                          <span className="lab-table-cell">{lab.referenceRange || '-'}</span>
                                        )}
                                        {hasComment && (
                                          <span className="lab-table-cell lab-comment">
                                            {lab.comment ? (
                                              <span className="comment-preview" title={lab.comment}>
                                                {lab.comment.length > 30 ? `${lab.comment.substring(0, 30)}...` : lab.comment}
                                              </span>
                                            ) : '-'}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    });
                  })()}
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
          </div>
          {expandedSections.vaccines && (
          <>

          {showAddVaccine && !showAddAppointment && !editingAppointmentId && (
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
          </div>
          {expandedSections.documents && (
            <>
            {showUploadFile && !showAddAppointment && !editingAppointmentId && (
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
                    <label>{t('patientDetail.subsequentNoteInfo')}</label>
                    <p className="form-hint">{t('patientDetail.subsequentNoteHint')}</p>
                  </div>
                  <div className="form-group full-width">
                    <label>{t('patientDetail.subsequentNoteDate')}</label>
                    <div className="input-with-icon">
                      <Calendar size={18} />
                      <input
                        type="datetime-local"
                        value={subsequentNoteForm.date}
                        onChange={(e) => setSubsequentNoteForm({ ...subsequentNoteForm, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>{t('patientDetail.subsequentNoteMotive')}</label>
                    <textarea
                      value={subsequentNoteForm.motive}
                      onChange={(e) => setSubsequentNoteForm({ ...subsequentNoteForm, motive: e.target.value })}
                      rows={2}
                      placeholder={t('patientDetail.subsequentNoteMotivePlaceholder')}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>{t('patientDetail.subsequentNoteDiagnosis')}</label>
                    <textarea
                      value={subsequentNoteForm.diagnosis}
                      onChange={(e) => setSubsequentNoteForm({ ...subsequentNoteForm, diagnosis: e.target.value })}
                      rows={2}
                      placeholder={t('patientDetail.subsequentNoteDiagnosisPlaceholder')}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>{t('patientDetail.subsequentNoteTreatment')}</label>
                    <textarea
                      value={subsequentNoteForm.treatment}
                      onChange={(e) => setSubsequentNoteForm({ ...subsequentNoteForm, treatment: e.target.value })}
                      rows={2}
                      placeholder={t('patientDetail.subsequentNoteTreatmentPlaceholder')}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>{t('patientDetail.subsequentNoteNotes')}</label>
                    <textarea
                      value={subsequentNoteForm.notes}
                      onChange={(e) => setSubsequentNoteForm({ ...subsequentNoteForm, notes: e.target.value })}
                      rows={3}
                      placeholder={t('patientDetail.subsequentNoteNotesPlaceholder')}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>{t('patientDetail.fileComment')}</label>
                    <textarea
                      value={fileComment}
                      onChange={(e) => setFileComment(e.target.value)}
                      rows={2}
                      placeholder={t('patientDetail.fileCommentPlaceholder')}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn-cancel" onClick={() => { 
                    setShowUploadFile(false); 
                    setSelectedFile(null); 
                    setFileComment('');
                    setSubsequentNoteForm({
                      date: '',
                      motive: '',
                      diagnosis: '',
                      treatment: '',
                      notes: ''
                    });
                  }}>
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
          {!showAddAppointment && !editingAppointmentId && expandedSections.appointments && (
            <div className="section-button-row">
              <button className="btn-add-small" onClick={() => setShowAddAppointment(true)}>
                <Plus size={16} />
                {t('medic.patientDetail.addAppointment')}
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
                    placeholder={t('medic.patientDetail.reasonPlaceholder')}
                  />
                </div>

                <div className="form-group full-width">
                  <label>{t('medic.patientDetail.diagnosis')}</label>
                  <textarea
                    value={newAppointment.diagnosis}
                    onChange={(e) => setNewAppointment({...newAppointment, diagnosis: e.target.value})}
                    className="form-textarea"
                    rows={2}
                    placeholder={t('medic.patientDetail.diagnosisPlaceholder')}
                  />
                </div>

                <div className="form-group full-width">
                  <label>{t('medic.patientDetail.treatment')}</label>
                  <textarea
                    value={newAppointment.treatment}
                    onChange={(e) => setNewAppointment({...newAppointment, treatment: e.target.value})}
                    className="form-textarea"
                    rows={2}
                    placeholder={t('medic.patientDetail.treatmentPlaceholder')}
                  />
                </div>

                <div className="form-group full-width">
                  <label>{t('medic.patientDetail.notes')}</label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    className="form-textarea"
                    rows={3}
                    placeholder={t('medic.patientDetail.notesPlaceholder')}
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
              
              {/* Additional actions for visit */}
              <div className="appointment-additional-actions">
                <h4>{t('medic.patientDetail.addToVisit')}</h4>
                <div className="additional-actions-buttons">
                  <button 
                    type="button"
                    className="btn-add-small" 
                    onClick={(e) => {
                      try {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowAddLab(true);
                        setTimeout(() => {
                          const formElement = document.getElementById('lab-form-container');
                          if (formElement) {
                            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      } catch (error) {
                        alert(t('patientDetail.saveError'));
                      }
                    }}
                    disabled={showAddLab || showUploadFile || showAddVaccine}
                  >
                    <Beaker size={28} />
                    <span>{t('patientDetail.labResult')}</span>
                  </button>
                  <button 
                    className="btn-add-small" 
                    onClick={() => setShowUploadFile(true)}
                    disabled={showAddLab || showUploadFile || showAddVaccine}
                  >
                    <File size={28} />
                    <span>{t('patientDetail.document')}</span>
                  </button>
                  <button 
                    className="btn-add-small" 
                    onClick={() => setShowAddVaccine(true)}
                    disabled={showAddLab || showUploadFile || showAddVaccine}
                  >
                    <Syringe size={28} />
                    <span>{t('patientDetail.vaccine')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lab form within appointment context */}
          {showAddLab && (showAddAppointment || editingAppointmentId) && (
            <div className="crud-form" id="lab-form-container">
              <h4>{t('patientDetail.addLabResultFromHistory')}</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>{t('patientDetail.selectTest')} {t('patientDetail.required')}</label>
                  <select
                    value={labForm.idContent || ''}
                    onChange={(e) => {
                      try {
                        const selectedTest = labTests?.find((test: any) => test.idContent === parseInt(e.target.value));
                        setLabForm({
                          ...labForm,
                          idContent: selectedTest ? parseInt(e.target.value) : undefined,
                          testName: selectedTest?.name || '',
                        });
                      } catch (error) {
                        console.error('Error selecting test:', error);
                      }
                    }}
                    className="form-select"
                  >
                    <option value="">{t('patientDetail.select')}</option>
                    {labTests && Array.isArray(labTests) && labTests.length > 0 ? (
                      labTests.map((test: any) => (
                        <option key={test.idContent} value={test.idContent}>
                          {test.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>{t('patientDetail.loadingTests') || 'Loading tests...'}</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('patientDetail.labTests.date')} {t('patientDetail.required')}</label>
                  <input
                    type="date"
                    value={labForm.date || ''}
                    onChange={(e) => setLabForm({ ...labForm, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>{t('patientDetail.testValue')} {t('patientDetail.required')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={labForm.value || ''}
                    onChange={(e) => setLabForm({ ...labForm, value: parseFloat(e.target.value) || undefined })}
                  />
                </div>

                <div className="form-group">
                  <label>{t('patientDetail.testUnit')}</label>
                  <input
                    type="text"
                    value={labForm.unit || ''}
                    onChange={(e) => setLabForm({ ...labForm, unit: e.target.value })}
                    placeholder={t('patientDetail.testUnitPlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label>{t('patientDetail.testReferenceRange')}</label>
                  <input
                    type="text"
                    value={labForm.referenceRange || ''}
                    onChange={(e) => setLabForm({ ...labForm, referenceRange: e.target.value })}
                    placeholder={t('patientDetail.testReferenceRangePlaceholder')}
                  />
                </div>

                <div className="form-group full-width">
                  <label>{t('patientDetail.notes')}</label>
                  <textarea
                    value={labForm.comment || ''}
                    onChange={(e) => setLabForm({ ...labForm, comment: e.target.value })}
                    className="form-textarea"
                    rows={2}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-cancel" onClick={() => { setShowAddLab(false); setLabForm({}); }}>
                  <X size={18} />
                  <span>{t('patientDetail.cancel')}</span>
                </button>
                <button 
                  className="btn-save" 
                  onClick={() => {
                    if (!labForm.idContent || labForm.value === undefined || !labForm.date) {
                      alert(t('patientDetail.allFieldsRequired'));
                      return;
                    }
                    createLabMutation.mutate({
                      idContent: labForm.idContent,
                      value: labForm.value,
                      date: labForm.date,
                      comment: labForm.comment || null,
                    });
                  }}
                  disabled={createLabMutation.isPending}
                >
                  <Save size={18} />
                  <span>{createLabMutation.isPending ? t('patientDetail.saving') : t('patientDetail.save')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Documents form within appointment context */}
          {showUploadFile && (showAddAppointment || editingAppointmentId) && (
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
                  <label>{t('patientDetail.subsequentNoteInfo')}</label>
                  <p className="form-hint">{t('patientDetail.subsequentNoteHint')}</p>
                </div>
                <div className="form-group full-width">
                  <label>{t('patientDetail.subsequentNoteDate')}</label>
                  <div className="input-with-icon">
                    <Calendar size={18} />
                    <input
                      type="datetime-local"
                      value={subsequentNoteForm.date}
                      onChange={(e) => setSubsequentNoteForm({ ...subsequentNoteForm, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>{t('patientDetail.subsequentNoteMotive')}</label>
                  <textarea
                    value={subsequentNoteForm.motive}
                    onChange={(e) => setSubsequentNoteForm({ ...subsequentNoteForm, motive: e.target.value })}
                    rows={2}
                    placeholder={t('patientDetail.subsequentNoteMotivePlaceholder')}
                  />
                </div>
                <div className="form-group full-width">
                  <label>{t('patientDetail.subsequentNoteDiagnosis')}</label>
                  <textarea
                    value={subsequentNoteForm.diagnosis}
                    onChange={(e) => setSubsequentNoteForm({ ...subsequentNoteForm, diagnosis: e.target.value })}
                    rows={2}
                    placeholder={t('patientDetail.subsequentNoteDiagnosisPlaceholder')}
                  />
                </div>
                <div className="form-group full-width">
                  <label>{t('patientDetail.subsequentNoteTreatment')}</label>
                  <textarea
                    value={subsequentNoteForm.treatment}
                    onChange={(e) => setSubsequentNoteForm({ ...subsequentNoteForm, treatment: e.target.value })}
                    rows={2}
                    placeholder={t('patientDetail.subsequentNoteTreatmentPlaceholder')}
                  />
                </div>
                <div className="form-group full-width">
                  <label>{t('patientDetail.subsequentNoteNotes')}</label>
                  <textarea
                    value={subsequentNoteForm.notes}
                    onChange={(e) => setSubsequentNoteForm({ ...subsequentNoteForm, notes: e.target.value })}
                    rows={3}
                    placeholder={t('patientDetail.subsequentNoteNotesPlaceholder')}
                  />
                </div>
                <div className="form-group full-width">
                  <label>{t('patientDetail.fileComment')}</label>
                  <textarea
                    value={fileComment}
                    onChange={(e) => setFileComment(e.target.value)}
                    rows={2}
                    placeholder={t('patientDetail.fileCommentPlaceholder')}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => { 
                  setShowUploadFile(false); 
                  setSelectedFile(null); 
                  setFileComment('');
                  setSubsequentNoteForm({
                    date: '',
                    motive: '',
                    diagnosis: '',
                    treatment: '',
                    notes: ''
                  });
                }}>
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

          {/* Vaccine form within appointment context */}
          {showAddVaccine && (showAddAppointment || editingAppointmentId) && (
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
                  <label>{t('patientDetail.nextDoseDate')}</label>
                  <input
                    type="date"
                    value={vaccineForm.nextDose || ''}
                    onChange={(e) => setVaccineForm({ ...vaccineForm, nextDose: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => { setShowAddVaccine(false); setVaccineForm({}); }}>
                  {t('patientDetail.cancel')}
                </button>
                <button className="btn-save" onClick={() => createVaccineMutation.mutate(vaccineForm)}>
                  {t('patientDetail.save')}
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
                          placeholder={t('medic.patientDetail.reasonPlaceholder')}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>{t('medic.patientDetail.diagnosis')}</label>
                        <textarea
                          value={editedAppointment.diagnosis || ''}
                          onChange={(e) => setEditedAppointment({...editedAppointment, diagnosis: e.target.value})}
                          className="form-textarea"
                          rows={2}
                          placeholder={t('medic.patientDetail.diagnosisPlaceholder')}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>{t('medic.patientDetail.treatment')}</label>
                        <textarea
                          value={editedAppointment.treatment || ''}
                          onChange={(e) => setEditedAppointment({...editedAppointment, treatment: e.target.value})}
                          className="form-textarea"
                          rows={2}
                          placeholder={t('medic.patientDetail.treatmentPlaceholder')}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>{t('medic.patientDetail.notes')}</label>
                        <textarea
                          value={editedAppointment.notes || ''}
                          onChange={(e) => setEditedAppointment({...editedAppointment, notes: e.target.value})}
                          className="form-textarea"
                          rows={3}
                          placeholder={t('medic.patientDetail.notesPlaceholder')}
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
                    
                    {/* Additional actions for visit */}
                    <div className="appointment-additional-actions">
                      <h4>{t('medic.patientDetail.addToVisit')}</h4>
                      <div className="additional-actions-buttons">
                        <button 
                          type="button"
                          className="btn-add-small" 
                          onClick={(e) => {
                            try {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowAddLab(true);
                              // Scroll to form after a brief delay to ensure it's rendered
                              setTimeout(() => {
                                const formElement = document.getElementById('lab-form-container');
                                if (formElement) {
                                  formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }, 100);
                            } catch (error) {
                              console.error('Error opening lab form:', error);
                              alert(t('patientDetail.saveError'));
                            }
                          }}
                          disabled={showAddLab || showUploadFile || showAddVaccine}
                        >
                          <Beaker size={28} />
                          <span>{t('patientDetail.labResult')}</span>
                        </button>
                        <button 
                          className="btn-add-small" 
                          onClick={() => setShowUploadFile(true)}
                          disabled={showAddLab || showUploadFile || showAddVaccine}
                        >
                          <File size={28} />
                          <span>{t('patientDetail.document')}</span>
                        </button>
                        <button 
                          className="btn-add-small" 
                          onClick={() => setShowAddVaccine(true)}
                          disabled={showAddLab || showUploadFile || showAddVaccine}
                        >
                          <Syringe size={28} />
                          <span>{t('patientDetail.vaccine')}</span>
                        </button>
                      </div>
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
