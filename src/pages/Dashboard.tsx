import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { LanguageSelector } from '../components/LanguageSelector';
import type { PatientData } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'history' | 'allergies' | 'medications'>('overview');

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      console.log('[TEMPORARY] Fetching patient data...');
      const data = await patientService.getMyPatientData();
      console.log('[TEMPORARY] Received patient data:', data);
      setPatientData(data);
    } catch (err: any) {
      console.error('[TEMPORARY] Error fetching patient data:', err);
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('dashboard.loading')}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM32 26H26V32C26 33.1 25.1 34 24 34C22.9 34 22 33.1 22 32V26H16C14.9 26 14 25.1 14 24C14 22.9 14.9 22 16 22H22V16C22 14.9 22.9 14 24 14C25.1 14 26 14.9 26 16V22H32C33.1 22 34 22.9 34 24C34 25.1 33.1 26 32 26Z" fill="white"/>
            </svg>
            <span>{t('common.appName')}</span>
          </div>
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <div className="user-name-row">
                  <span className="user-name">{user?.name}</span>
                  <span className={`user-type-badge ${user?.type === 'medic' ? 'medic' : 'patient'}`}>
                    {user?.type === 'medic' ? t('common.medic') : t('common.patient')}
                  </span>
                </div>
                <span className="user-email">{user?.email}</span>
              </div>
            </div>
            <LanguageSelector />
            <button onClick={handleLogout} className="btn-logout">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L6 9.414a1 1 0 111.414-1.414L9 9.586l3.293-3.293a1 1 0 011.414 1.414z" clipRule="evenodd"/>
              </svg>
              {t('dashboard.logout')}
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              {t('dashboard.nav.overview')}
            </button>
            <button
              className={`nav-item ${activeSection === 'history' ? 'active' : ''}`}
              onClick={() => setActiveSection('history')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              {t('dashboard.nav.history')}
            </button>
            <button
              className={`nav-item ${activeSection === 'allergies' ? 'active' : ''}`}
              onClick={() => setActiveSection('allergies')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {t('dashboard.nav.allergies')}
            </button>
            <button
              className={`nav-item ${activeSection === 'medications' ? 'active' : ''}`}
              onClick={() => setActiveSection('medications')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd"/>
              </svg>
              {t('dashboard.nav.medications')}
            </button>
          </nav>
        </aside>

        <main className="dashboard-main">
          {activeSection === 'overview' && (
            <div className="section">
              <h2>{t('dashboard.welcome', { name: user?.name })}</h2>
              <div className="cards-grid">
                <div className="info-card">
                  <div className="card-icon blue">
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>{t('dashboard.overview.medicalRecords')}</h3>
                    <p className="card-value">{patientData?.clinicalHistories?.length || 0}</p>
                    <p className="card-label">{t('dashboard.overview.totalAppointments')}</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="card-icon red">
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>{t('dashboard.overview.allergies')}</h3>
                    <p className="card-value">{patientData?.allergies?.length || 0}</p>
                    <p className="card-label">{t('dashboard.overview.registeredAllergies')}</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="card-icon green">
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>{t('dashboard.overview.activeMedications')}</h3>
                    <p className="card-value">{patientData?.medications?.length || 0}</p>
                    <p className="card-label">{t('dashboard.overview.currentPrescriptions')}</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="card-icon purple">
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>{t('dashboard.overview.latestVitals')}</h3>
                    <p className="card-value">{patientData?.vitals?.length ? t('dashboard.overview.available') : t('dashboard.overview.na')}</p>
                    <p className="card-label">{t('dashboard.overview.recentMeasurements')}</p>
                  </div>
                </div>
              </div>

              <div className="info-banner">
                <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <div>
                  <h4>{t('dashboard.overview.securityBanner.title')}</h4>
                  <p>{t('dashboard.overview.securityBanner.description')}</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'history' && (
            <div className="section">
              <h2>{t('dashboard.history.title')}</h2>
              {patientData?.clinicalHistories && patientData.clinicalHistories.length > 0 ? (
                <div className="records-list">
                  {patientData.clinicalHistories.map((record: any) => (
                    <div key={record.idHistory} className="record-card">
                      <div className="record-header">
                        <div className="record-title-section">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="record-icon">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                          </svg>
                          <div>
                            <h3>{new Date(record.date).toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                            <p className="record-time">{new Date(record.start).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <span className={`record-status ${record.closed ? 'closed' : 'open'}`}>
                          {record.closed ? t('dashboard.history.statusClosed') : t('dashboard.history.statusOpen')}
                        </span>
                      </div>

                      <div className="record-details">
                        {record.diagnosis && record.diagnosis.length > 0 && (
                          <div className="record-section">
                            <h4>
                              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                              </svg>
                              Diagnósticos
                            </h4>
                            <span className="badge">{record.diagnosis.length} diagnóstico(s)</span>
                          </div>
                        )}

                        {record.medications && record.medications.length > 0 && (
                          <div className="record-section">
                            <h4>
                              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1z" clipRule="evenodd"/>
                              </svg>
                              Medicamentos
                            </h4>
                            <div className="medications-list">
                              {record.medications.slice(0, 3).map((med: any, idx: number) => (
                                <span key={idx} className="medication-tag">{med.productName || med.productVmpName}</span>
                              ))}
                              {record.medications.length > 3 && (
                                <span className="badge">+{record.medications.length - 3} más</span>
                              )}
                            </div>
                          </div>
                        )}

                        {record.notes && record.notes.length > 0 && record.notes[0].content && (
                          <div className="record-section">
                            <h4>
                              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                              </svg>
                              Notas clínicas
                            </h4>
                            <p className="clinical-note">{record.notes[0].content.substring(0, 150)}{record.notes[0].content.length > 150 ? '...' : ''}</p>
                          </div>
                        )}

                        {(!record.diagnosis || record.diagnosis.length === 0) &&
                         (!record.medications || record.medications.length === 0) &&
                         (!record.notes || record.notes.length === 0 || !record.notes[0].content) && (
                          <div className="record-section">
                            <p className="no-details">Sin detalles adicionales registrados</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                  <h3>{t('dashboard.history.empty.title')}</h3>
                  <p>{t('dashboard.history.empty.description')}</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'allergies' && (
            <div className="section">
              <h2>{t('dashboard.allergies.title')}</h2>
              {patientData?.allergies && patientData.allergies.length > 0 ? (
                <div className="list-items">
                  {patientData.allergies.map((allergy, index) => (
                    <div key={index} className="list-item">
                      <div className="item-icon red">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <span>{allergy}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <h3>{t('dashboard.allergies.empty.title')}</h3>
                  <p>{t('dashboard.allergies.empty.description')}</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'medications' && (
            <div className="section">
              <h2>{t('dashboard.medications.title')}</h2>
              {patientData?.medications && patientData.medications.length > 0 ? (
                <div className="list-items">
                  {patientData.medications.map((medication, index) => (
                    <div key={index} className="list-item">
                      <div className="item-icon green">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <span>{medication}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                  <h3>{t('dashboard.medications.empty.title')}</h3>
                  <p>{t('dashboard.medications.empty.description')}</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
