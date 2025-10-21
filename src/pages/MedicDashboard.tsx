import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { PatientCardSkeleton } from '../components/PatientCardSkeleton';
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  ChevronRight,
  LogOut,
  Stethoscope,
  AlertCircle,
  UserCircle
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
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:3000/medics/my-patients', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch patients');
  }

  const data = await response.json();
  return data.patients || [];
};

export const MedicDashboard = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: patients = [], isLoading, isError } = useQuery({
    queryKey: ['medic-patients'],
    queryFn: fetchPatients,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewPatient = (patientId: number) => {
    navigate(`/medic/patient/${patientId}`);
  };

  const filteredPatients = patients.filter((patient) => {
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
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <Stethoscope className="logo-icon" size={24} />
            <span>{t('common.appName')}</span>
          </div>

          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {getInitials(user?.name, user?.lname)}
              </div>
              <div className="user-details">
                <div className="user-name-row">
                  <span className="user-name">{user?.name}</span>
                  <span className="user-type-badge medic">
                    {t('common.medic')}
                  </span>
                </div>
                <span className="user-email">{user?.email}</span>
              </div>
            </div>

            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={18} />
              <span>{t('dashboard.logout')}</span>
            </button>
          </div>
        </div>
      </header>

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

          {/* Search Bar */}
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t('medic.patients.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
              filteredPatients.map((patient) => (
                <div
                  key={patient.idPatient}
                  className="patient-card"
                  onClick={() => handleViewPatient(patient.idPatient)}
                >
                  <div className="patient-card-header">
                    <div className="patient-avatar">
                      {getInitials(patient.name, patient.lname)}
                    </div>
                    <div className="patient-info">
                      <div className="patient-name-row">
                        <h3 className="patient-name">
                          {patient.name} {patient.lname}
                        </h3>
                        {isRecentVisit(patient.lastAppointment) && (
                          <span className="status-badge recent">{t('medic.patients.statusRecent')}</span>
                        )}
                      </div>
                      {patient.bloodGroup && patient.bloodRh && (
                        <span className="blood-type">
                          {patient.bloodGroup}
                          {patient.bloodRh}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="chevron-icon" size={20} />
                  </div>

                  <div className="patient-card-details">
                    {patient.email && (
                      <div className="detail-item">
                        <Mail size={16} className="detail-icon" />
                        <span className="detail-text">{patient.email}</span>
                      </div>
                    )}
                    {patient.phone && (
                      <div className="detail-item">
                        <Phone size={16} className="detail-icon" />
                        <span className="detail-text">{patient.phone}</span>
                      </div>
                    )}
                    {patient.address && (
                      <div className="detail-item">
                        <MapPin size={16} className="detail-icon" />
                        <span className="detail-text">{patient.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="patient-card-footer">
                    <div className="stat">
                      <Calendar size={16} className="stat-icon" />
                      <span className="stat-text">{t('medic.patients.lastVisit')} {formatDate(patient.lastAppointment)}</span>
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
    </div>
  );
};
