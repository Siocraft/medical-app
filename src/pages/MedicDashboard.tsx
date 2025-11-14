import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { PatientCardSkeleton } from '../components/PatientCardSkeleton';
import { Header } from '../components/Header';
import api from '../services/api';
import {
  Search,
  Calendar,
  Activity,
  ChevronRight,
  AlertCircle,
  UserCircle,
  Plus,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Droplet,
  UserPlus,
  Link,
  Trash2,
  Home,
  Briefcase,
  GraduationCap,
  Shield,
  FileText
} from 'lucide-react';
import './MedicDashboard.css';

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
  appointmentCount: string;
  lastAppointment: string;
}

const fetchPatients = async () => {
  const response = await api.get('/medics/my-patients');
  return response.data.patients || [];
};

export const MedicDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ patientId: number; x: number; y: number } | null>(null);
  const [unlinking, setUnlinking] = useState<number | null>(null);
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const justOpenedMenu = React.useRef<boolean>(false);

  useEffect(() => {
    document.title = 'Mi Medicina | Inicio';
  }, []);

  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ['medic-patients'],
    queryFn: fetchPatients,
  });

  // Mutation to create a new patient
  const createPatientMutation = useMutation({
    mutationFn: async (patientData: {
      name: string;
      lname: string;
      email: string;
      password: string;
      phone: string;
      address: string;
      bloodGroup: '' | 'A' | 'B' | 'AB' | 'O';
      bloodRh: '' | '+' | '-';
      weight: string;
      height: string;
      biologicalSex: '' | 'M' | 'F' | 'O';
      birthDate: string;
      birthPlace: string;
      residencePlace: string;
      streetAddress: string;
      neighborhood: string;
      occupation: string;
      education: string;
      extraPhone: string;
      hasInsurance: boolean;
      insuranceCompany: string;
      referredBy: string;
      recordNumber: string;
      recordNumberManual: boolean;
    }) => {
      // Step 1: Create user account
      const userResponse = await api.post('/auth/register', {
        name: patientData.name,
        lname: patientData.lname,
        email: patientData.email,
        password: patientData.password,
        type: 'patient'
      });

      const newUserId = userResponse.data.user.idUser;

      // Step 2: Create patient record
      // Map education string to number (0 = none, 1 = elementary, 2 = middle, 3 = high, 4 = university, 5 = postgraduate)
      const educationMap: Record<string, number> = {
        'none': 0,
        'elementary': 1,
        'middle': 2,
        'high': 3,
        'university': 4,
        'postgraduate': 5
      };

      const patientPayload = {
        idUser: newUserId,
        email: patientData.email,
        phone: patientData.phone || '0000000000',
        extraPhone: patientData.extraPhone || '',
        address: patientData.streetAddress || patientData.address || 'No especificada',
        addressSpecific: patientData.neighborhood || '',
        bloodGroup: patientData.bloodGroup || '',
        bloodRh: patientData.bloodRh || '',
        weight: patientData.weight ? parseFloat(patientData.weight) : undefined,
        height: patientData.height ? parseInt(patientData.height) : undefined,
        education: patientData.education ? educationMap[patientData.education] : 0,
        civilStatus: '',
        policy: patientData.hasInsurance ? (patientData.insuranceCompany || '') : '',
        origin: patientData.referredBy || '',
        originSent: '',
        originPlace: patientData.birthPlace || '',
        insuranceComment: patientData.hasInsurance ? patientData.insuranceCompany : '',
        recordNumber: patientData.recordNumberManual && patientData.recordNumber ? patientData.recordNumber : undefined,
      };

      const patientResponse = await api.post('/patients', patientPayload);
      return patientResponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medic-patients'] });
      setShowCreateModal(false);
      formik.resetForm();
      alert(t('medic.createPatient.success'));
    },
    onError: (error: any) => {
      console.error('Error creating patient:', error);
      alert(t('medic.createPatient.error') + ': ' + (error.response?.data?.message || error.message));
    },
  });

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      name: '',
      lname: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      bloodGroup: '' as '' | 'A' | 'B' | 'AB' | 'O',
      bloodRh: '' as '' | '+' | '-',
      weight: '',
      height: '',
      biologicalSex: '' as '' | 'M' | 'F' | 'O',
      birthDate: '',
      birthPlace: '',
      residencePlace: '',
      streetAddress: '',
      neighborhood: '',
      occupation: '',
      education: '',
      extraPhone: '',
      hasInsurance: false,
      insuranceCompany: '',
      referredBy: '',
      recordNumber: '',
      recordNumberManual: false
    },
    validate: (values) => {
      const errors: any = {};

      // Required fields
      if (!values.name.trim()) {
        errors.name = t('medic.createPatient.nameRequired') || 'First name is required';
      }
      if (!values.lname.trim()) {
        errors.lname = t('medic.createPatient.lnameRequired') || 'Last name is required';
      }
      if (!values.email.trim()) {
        errors.email = t('medic.createPatient.emailRequired') || 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = t('medic.createPatient.emailInvalid') || 'Invalid email address';
      }
      if (!values.password) {
        errors.password = t('medic.createPatient.passwordRequired') || 'Password is required';
      } else if (values.password.length < 6) {
        errors.password = t('medic.createPatient.passwordLength') || 'Password must be at least 6 characters';
      }

      return errors;
    },
    onSubmit: (values) => {
      createPatientMutation.mutate(values);
    },
  });

  const handleViewPatient = (patientId: number) => {
    navigate(`/medic/patient/${patientId}`);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    formik.resetForm();
  };

  const handleCloseLinkModal = () => {
    setShowLinkModal(false);
    setPatientSearchQuery('');
    setPatientSearchResults([]);
  };

  const searchPatients = async () => {
    if (!patientSearchQuery.trim()) {
      setPatientSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await api.get(`/medics/search-patients?q=${encodeURIComponent(patientSearchQuery)}`);
      // Ensure we always get an array
      const results = Array.isArray(response.data) ? response.data : [];
      setPatientSearchResults(results);
    } catch (error) {
      console.error('Error searching patients:', error);
      setPatientSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const linkToPatient = async (patientEmail: string, patientId: number) => {
    try {
      setLinking(patientId);
      await api.post('/medics/link-patient', { patientEmail });
      alert(t('medic.linkPatient.linkSuccess'));
      setPatientSearchQuery('');
      setPatientSearchResults([]);
      setShowLinkModal(false);
      queryClient.invalidateQueries({ queryKey: ['medic-patients'] });
    } catch (error: any) {
      console.error('Error linking to patient:', error);
      alert(error.response?.data?.message || t('medic.linkPatient.linkError'));
    } finally {
      setLinking(null);
    }
  };

  const unlinkFromPatient = async (patientId: number) => {
    if (!window.confirm(t('medic.patients.unlinkConfirm'))) {
      return;
    }

    try {
      setUnlinking(patientId);
      await api.delete(`/medics/unlink-patient/${patientId}`);
      alert(t('medic.patients.unlinkSuccess'));
      setContextMenu(null);
      queryClient.invalidateQueries({ queryKey: ['medic-patients'] });
    } catch (error: any) {
      console.error('Error unlinking from patient:', error);
      alert(error.response?.data?.message || t('medic.patients.unlinkError'));
    } finally {
      setUnlinking(null);
    }
  };

  const handleLongPressStart = (patientId: number, event: React.MouseEvent | React.TouchEvent) => {
    // Capture the rect before setTimeout to avoid React event pooling issues
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    longPressTimer.current = setTimeout(() => {
      justOpenedMenu.current = true;
      setContextMenu({
        patientId,
        x: rect.left + rect.width / 2,
        y: rect.bottom + 5,
      });
    }, 500); // 500ms long press
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      // Ignore the first click that happens right after opening the menu
      if (justOpenedMenu.current) {
        justOpenedMenu.current = false;
        return;
      }
      setContextMenu(null);
    };

    if (contextMenu) {
      // Add a small delay to prevent the release event from immediately closing the menu
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [contextMenu]);

  const filteredPatients = patients.filter((patient: Patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.name?.toLowerCase().includes(searchLower) ||
      patient.lname?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchTerm)
    );
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name?: string, lname?: string) => {
    const firstInitial = name?.charAt(0) || '';
    const lastInitial = lname?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const isRecentVisit = (dateString: string) => {
    if (!dateString) return false;
    const lastVisit = new Date(dateString);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  };

  return (
    <div className="medic-dashboard">
      <Header />

      {/* Main Content */}
      <div className="medic-main">
        <div className="patients-section">
          <div className="section-header">
            <div>
              <h1>{t('medic.patients.title')}</h1>
              <p className="section-subtitle">
                {t('medic.patients.subtitle', { count: patients.length })}
              </p>
            </div>
          </div>

          {/* Search Bar and Actions */}
          <div className="search-actions-bar">
            <div className="search-bar">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder={t('medic.patients.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn-link-patient"
                onClick={() => setShowLinkModal(true)}
              >
                <Link size={20} />
                <span>{t('medic.linkPatient.title')}</span>
              </button>
              <button
                className="btn-create-patient"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={20} />
                <span>{t('medic.createPatient.title')}</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {isError && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <p>{t('medic.patients.loadFailed')}</p>
            </div>
          )}

          {/* Patients List */}
          <div className="patients-grid">
            {isLoading ? (
              // Show skeleton loaders while loading
              <>
                <PatientCardSkeleton />
                <PatientCardSkeleton />
                <PatientCardSkeleton />
                <PatientCardSkeleton />
                <PatientCardSkeleton />
                <PatientCardSkeleton />
                <PatientCardSkeleton />
                <PatientCardSkeleton />
                <PatientCardSkeleton />
                <PatientCardSkeleton />
                <PatientCardSkeleton />
                <PatientCardSkeleton />
              </>
            ) : filteredPatients.length === 0 ? (
              <div className="empty-state">
                <UserCircle className="empty-icon" size={80} strokeWidth={1} />
                <h3>{t('medic.patients.noPatients')}</h3>
                <p>
                  {searchTerm
                    ? t('medic.patients.adjustSearch')
                    : t('medic.patients.emptyState')}
                </p>
              </div>
            ) : (
              filteredPatients.map((patient: Patient) => (
                <div
                  key={patient.idPatient}
                  className="patient-card"
                  onClick={() => handleViewPatient(patient.idPatient)}
                  onMouseDown={(e) => handleLongPressStart(patient.idPatient, e)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={(e) => handleLongPressStart(patient.idPatient, e)}
                  onTouchEnd={handleLongPressEnd}
                >
                  <div className="patient-card-header">
                    <div className="patient-avatar">
                      {getInitials(patient.name, patient.lname)}
                    </div>
                    <div className="patient-info">
                      <h3 className="patient-name">
                        {patient.name} {patient.lname}
                      </h3>
                      <div className="patient-meta">
                        {patient.bloodGroup && patient.bloodRh && (
                          <span className="blood-type">
                            {patient.bloodGroup}
                            {patient.bloodRh}
                          </span>
                        )}
                        {isRecentVisit(patient.lastAppointment) && (
                          <span className="status-badge recent">{t('medic.patients.statusRecent')}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="chevron-icon" size={20} />
                  </div>

                  <div className="patient-card-footer">
                    <div className="stat">
                      <Calendar size={16} className="stat-icon" />
                      <span className="stat-text">{formatDate(patient.lastAppointment)}</span>
                    </div>
                    <div className="stat">
                      <Activity size={16} className="stat-icon" />
                      <span className="stat-text">{patient.appointmentCount} {t('medic.patients.appointments')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="patient-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y, position: 'fixed', zIndex: 1000 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => unlinkFromPatient(contextMenu.patientId)}
            disabled={unlinking === contextMenu.patientId}
            className="context-menu-item danger"
          >
            <Trash2 size={16} />
            <span>{t('medic.patients.unlinkButton')}</span>
          </button>
        </div>
      )}

      {/* Patient Creation Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content create-patient-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('medic.createPatient.title')}</h2>
              <button className="btn-close-modal" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={formik.handleSubmit}>
                <div className="form-grid">
                  {/* Personal Information */}
                  <div className="form-group">
                    <label htmlFor="name">
                      <User size={16} />
                      {t('medic.createPatient.name')} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.namePlaceholder')}
                      className={formik.touched.name && formik.errors.name ? 'input-error' : ''}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <span className="error-text">{formik.errors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lname">
                      <User size={16} />
                      {t('medic.createPatient.lname')} *
                    </label>
                    <input
                      type="text"
                      id="lname"
                      name="lname"
                      value={formik.values.lname}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.lnamePlaceholder')}
                      className={formik.touched.lname && formik.errors.lname ? 'input-error' : ''}
                    />
                    {formik.touched.lname && formik.errors.lname && (
                      <span className="error-text">{formik.errors.lname}</span>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="form-group">
                    <label htmlFor="email">
                      <Mail size={16} />
                      {t('medic.createPatient.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.emailPlaceholder')}
                      className={formik.touched.email && formik.errors.email ? 'input-error' : ''}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <span className="error-text">{formik.errors.email}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">
                      {t('medic.createPatient.password')} *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.passwordPlaceholder')}
                      className={formik.touched.password && formik.errors.password ? 'input-error' : ''}
                    />
                    {formik.touched.password && formik.errors.password && (
                      <span className="error-text">{formik.errors.password}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      <Phone size={16} />
                      {t('medic.createPatient.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.phonePlaceholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="extraPhone">
                      <Phone size={16} />
                      {t('medic.createPatient.extraPhone')}
                    </label>
                    <input
                      type="tel"
                      id="extraPhone"
                      name="extraPhone"
                      value={formik.values.extraPhone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.extraPhonePlaceholder')}
                    />
                  </div>

                  {/* Personal Information */}
                  <div className="form-group">
                    <label htmlFor="biologicalSex">
                      <User size={16} />
                      {t('medic.createPatient.biologicalSex')}
                    </label>
                    <select
                      id="biologicalSex"
                      name="biologicalSex"
                      value={formik.values.biologicalSex}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="">{t('medic.createPatient.selectBiologicalSex')}</option>
                      <option value="M">{t('medic.createPatient.male')}</option>
                      <option value="F">{t('medic.createPatient.female')}</option>
                      <option value="O">{t('medic.createPatient.other')}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="birthDate">
                      <Calendar size={16} />
                      {t('medic.createPatient.birthDate')}
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formik.values.birthDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="birthPlace">
                      <MapPin size={16} />
                      {t('medic.createPatient.birthPlace')}
                    </label>
                    <input
                      type="text"
                      id="birthPlace"
                      name="birthPlace"
                      value={formik.values.birthPlace}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.birthPlacePlaceholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="residencePlace">
                      <Home size={16} />
                      {t('medic.createPatient.residencePlace')}
                    </label>
                    <input
                      type="text"
                      id="residencePlace"
                      name="residencePlace"
                      value={formik.values.residencePlace}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.residencePlacePlaceholder')}
                    />
                  </div>

                  {/* Address Information */}
                  <div className="form-group form-group-full">
                    <label htmlFor="streetAddress">
                      <MapPin size={16} />
                      {t('medic.createPatient.streetAddress')}
                    </label>
                    <input
                      type="text"
                      id="streetAddress"
                      name="streetAddress"
                      value={formik.values.streetAddress}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.streetAddressPlaceholder')}
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label htmlFor="neighborhood">
                      <MapPin size={16} />
                      {t('medic.createPatient.neighborhood')}
                    </label>
                    <input
                      type="text"
                      id="neighborhood"
                      name="neighborhood"
                      value={formik.values.neighborhood}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.neighborhoodPlaceholder')}
                    />
                  </div>

                  {/* Professional Information */}
                  <div className="form-group">
                    <label htmlFor="occupation">
                      <Briefcase size={16} />
                      {t('medic.createPatient.occupation')}
                    </label>
                    <input
                      type="text"
                      id="occupation"
                      name="occupation"
                      value={formik.values.occupation}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.occupationPlaceholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="education">
                      <GraduationCap size={16} />
                      {t('medic.createPatient.education')}
                    </label>
                    <select
                      id="education"
                      name="education"
                      value={formik.values.education}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="">{t('medic.createPatient.selectEducation')}</option>
                      <option value="none">{t('medic.createPatient.none')}</option>
                      <option value="elementary">{t('medic.createPatient.elementary')}</option>
                      <option value="middle">{t('medic.createPatient.middle')}</option>
                      <option value="high">{t('medic.createPatient.high')}</option>
                      <option value="university">{t('medic.createPatient.university')}</option>
                      <option value="postgraduate">{t('medic.createPatient.postgraduate')}</option>
                    </select>
                  </div>

                  {/* Insurance Information */}
                  <div className="form-group form-group-full">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        id="hasInsurance"
                        name="hasInsurance"
                        checked={formik.values.hasInsurance}
                        onChange={formik.handleChange}
                        style={{ width: 'auto', cursor: 'pointer' }}
                      />
                      <Shield size={16} />
                      {t('medic.createPatient.hasInsurance')}
                    </label>
                  </div>

                  {formik.values.hasInsurance && (
                    <div className="form-group form-group-full">
                      <label htmlFor="insuranceCompany">
                        <Shield size={16} />
                        {t('medic.createPatient.insuranceCompany')}
                      </label>
                      <input
                        type="text"
                        id="insuranceCompany"
                        name="insuranceCompany"
                        value={formik.values.insuranceCompany}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder={t('medic.createPatient.insuranceCompanyPlaceholder')}
                      />
                    </div>
                  )}

                  {/* Referral Information */}
                  <div className="form-group form-group-full">
                    <label htmlFor="referredBy">
                      <User size={16} />
                      {t('medic.createPatient.referredBy')}
                    </label>
                    <input
                      type="text"
                      id="referredBy"
                      name="referredBy"
                      value={formik.values.referredBy}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.referredByPlaceholder')}
                    />
                  </div>

                  {/* Record Number */}
                  <div className="form-group form-group-full">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="recordNumberManual"
                        name="recordNumberManual"
                        checked={formik.values.recordNumberManual}
                        onChange={formik.handleChange}
                        style={{ width: 'auto', cursor: 'pointer' }}
                      />
                      <FileText size={16} />
                      {formik.values.recordNumberManual 
                        ? t('medic.createPatient.recordNumberManual')
                        : t('medic.createPatient.recordNumberAuto')}
                    </label>
                    {formik.values.recordNumberManual && (
                      <input
                        type="text"
                        id="recordNumber"
                        name="recordNumber"
                        value={formik.values.recordNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder={t('medic.createPatient.recordNumberPlaceholder')}
                        style={{ marginTop: '0.5rem' }}
                      />
                    )}
                  </div>

                  {/* Physical Information */}
                  {/* <div className="form-group">
                    <label htmlFor="weight">
                      <Weight size={16} />
                      {t('medic.createPatient.weight')}
                    </label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      step="0.1"
                      value={formik.values.weight}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.weightPlaceholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="height">
                      <Ruler size={16} />
                      {t('medic.createPatient.height')}
                    </label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={formik.values.height}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('medic.createPatient.heightPlaceholder')}
                    />
                  </div> */}

                  {/* Blood Type */}
                  <div className="form-group">
                    <label htmlFor="bloodGroup">
                      <Droplet size={16} />
                      {t('medic.createPatient.bloodGroup')}
                    </label>
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      value={formik.values.bloodGroup}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="">{t('medic.createPatient.selectBloodGroup')}</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="bloodRh">
                      {t('medic.createPatient.bloodRh')}
                    </label>
                    <select
                      id="bloodRh"
                      name="bloodRh"
                      value={formik.values.bloodRh}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="">{t('medic.createPatient.selectBloodRh')}</option>
                      <option value="+">+</option>
                      <option value="-">-</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={handleCloseModal}
                  >
                    {t('medic.createPatient.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={createPatientMutation.isPending}
                  >
                    {createPatientMutation.isPending
                      ? t('medic.createPatient.creating')
                      : t('medic.createPatient.create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Link Existing Patient Modal */}
      {showLinkModal && (
        <div className="modal-overlay" onClick={handleCloseLinkModal}>
          <div className="modal-content link-patient-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('medic.linkPatient.title')}</h2>
              <button className="btn-close-modal" onClick={handleCloseLinkModal}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                {t('medic.linkPatient.description')}
              </p>

              <div className="search-box" style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder={t('medic.linkPatient.searchPlaceholder')}
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                <button
                  onClick={searchPatients}
                  disabled={searching}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: searching ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Search size={20} />
                  {searching ? t('medic.linkPatient.searching') : t('medic.linkPatient.search')}
                </button>
              </div>

              {Array.isArray(patientSearchResults) && patientSearchResults.length > 0 && (
                <div className="search-results" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {patientSearchResults.map((patient: any) => (
                    <div
                      key={patient.idPatient}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        flexShrink: 0
                      }}>
                        {patient.name?.charAt(0)}{patient.lname?.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: '#1a202c' }}>
                          {patient.name} {patient.lname}
                        </h4>
                        <span style={{ color: '#718096', fontSize: '0.9rem' }}>{patient.email}</span>
                        {patient.phone && (
                          <span style={{ color: '#718096', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                            • {patient.phone}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => linkToPatient(patient.email, patient.idPatient)}
                        disabled={linking === patient.idPatient}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#48bb78',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: linking === patient.idPatient ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          opacity: linking === patient.idPatient ? 0.6 : 1
                        }}
                      >
                        {linking === patient.idPatient ? (
                          t('medic.linkPatient.linking')
                        ) : (
                          <>
                            <UserPlus size={16} />
                            {t('medic.linkPatient.linkButton')}
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {patientSearchQuery && Array.isArray(patientSearchResults) && patientSearchResults.length === 0 && !searching && (
                <p style={{ textAlign: 'center', color: '#718096', padding: '2rem' }}>
                  {t('medic.linkPatient.noResults')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
