import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
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
  User
} from 'lucide-react';
import './PatientDetail.css';

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
}

interface Appointment {
  idHistory: number;
  idAppointment: number;
  date: string;
  start: string;
  end: string | null;
  motive: string | null;
  diagnosisIds: string | null;
  medications: string | null;
  notes: string | null;
  isEvolution: boolean;
  closed: boolean;
}

// API functions
const fetchPatientDetails = async (patientId: string) => {
  const response = await api.get(`/medics/patients/${patientId}`);
  const data = response.data;
  // Return both patient and history (appointments)
  return {
    patient: data.patient,
    history: data.history || [],
  };
};

export const PatientDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Fetch patient details with React Query (includes history/appointments)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => fetchPatientDetails(id!),
    enabled: !!id,
  });

  const patient = data?.patient;
  const appointments = data?.history || [];

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
    if (confirm('Are you sure you want to delete this appointment?')) {
      deleteAppointmentMutation.mutate(appointmentId);
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setViewingAppointment(appointment);
  };

  const handleCloseAppointmentDetail = () => {
    setViewingAppointment(null);
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
      {/* Header */}
      <header className="detail-header">
        <button className="btn-back" onClick={handleBack}>
          <span>←</span>
          <span>{t('medic.patientDetail.back')}</span>
        </button>

        <div className="header-user-info">
          <div className="user-avatar">
            {getInitials(user?.name, user?.lname)}
          </div>
          <span className="user-name">{user?.name}</span>
        </div>
      </header>

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
                  <label>Blood Group</label>
                  <select
                    value={editedPatient.bloodGroup || ''}
                    onChange={(e) => setEditedPatient({...editedPatient, bloodGroup: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Select...</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Blood Rh</label>
                  <select
                    value={editedPatient.bloodRh || ''}
                    onChange={(e) => setEditedPatient({...editedPatient, bloodRh: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Select...</option>
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

        {/* Appointments Section */}
        <div className="appointments-section">
          <div className="section-header-appointments">
            <h2>{t('medic.patientDetail.appointmentHistory')}</h2>
            {!showAddAppointment && (
              <button className="btn-add" onClick={() => setShowAddAppointment(true)}>
                <Plus size={18} />
                <span>{t('medic.patientDetail.addAppointment')}</span>
              </button>
            )}
          </div>

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
              {appointments.map((appointment: Appointment) => (
                <div key={appointment.idAppointment} className="appointment-card">
                  {editingAppointmentId === appointment.idAppointment ? (
                    <div className="appointment-edit-form">
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
                    <div className="appointment-row">
                      <div
                        className="appointment-content-clickable"
                        onClick={() => handleViewAppointment(appointment)}
                      >
                        <div className="appointment-date-compact">
                          <Calendar size={16} />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="appointment-info-compact">
                          {appointment.motive && (
                            <span className="appointment-chip reason" title={appointment.motive}>
                              <strong>{t('medic.patientDetail.motive')}:</strong> <span className="chip-text">{appointment.motive}</span>
                            </span>
                          )}
                          {appointment.medications && (
                            <span className="appointment-chip treatment" title={appointment.medications}>
                              <strong>{t('medic.patientDetail.medications')}:</strong> <span className="chip-text">{appointment.medications}</span>
                            </span>
                          )}
                          {appointment.notes && (
                            <span className="appointment-chip notes" title={appointment.notes}>
                              <strong>{t('medic.patientDetail.notes')}:</strong> <span className="chip-text">{appointment.notes}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {isAppointmentToday(appointment.date) && (
                        <div className="appointment-actions">
                          <button
                            className="btn-icon-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAppointment(appointment);
                            }}
                          >
                            <Edit2 size={16} />
                            <span>{t('medic.patientDetail.edit')}</span>
                          </button>
                          <button
                            className="btn-icon-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAppointment(appointment.idHistory);
                            }}
                          >
                            <Trash2 size={16} />
                            <span>{t('medic.patientDetail.deleteAppointment')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
                    <Calendar size={18} />
                    <span>{t('medic.patientDetail.diagnosisIds')}</span>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
