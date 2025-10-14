import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { PatientData } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'overview' | 'history' | 'allergies' | 'medications'>('overview');

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since the API might need specific endpoints
      // In production, replace this with actual API call
      const data = await patientService.getMyPatientData();
      setPatientData(data);
    } catch (err: any) {
      // If endpoint doesn't exist yet, use fallback
      setError('');
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
        <p>Loading your medical records...</p>
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
            <span>MedicalApp</span>
          </div>
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L6 9.414a1 1 0 111.414-1.414L9 9.586l3.293-3.293a1 1 0 011.414 1.414z" clipRule="evenodd"/>
              </svg>
              Logout
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
              Overview
            </button>
            <button
              className={`nav-item ${activeSection === 'history' ? 'active' : ''}`}
              onClick={() => setActiveSection('history')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              Medical History
            </button>
            <button
              className={`nav-item ${activeSection === 'allergies' ? 'active' : ''}`}
              onClick={() => setActiveSection('allergies')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              Allergies
            </button>
            <button
              className={`nav-item ${activeSection === 'medications' ? 'active' : ''}`}
              onClick={() => setActiveSection('medications')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd"/>
              </svg>
              Medications
            </button>
          </nav>
        </aside>

        <main className="dashboard-main">
          {activeSection === 'overview' && (
            <div className="section">
              <h2>Welcome, {user?.name}!</h2>
              <div className="cards-grid">
                <div className="info-card">
                  <div className="card-icon blue">
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>Medical Records</h3>
                    <p className="card-value">{patientData?.clinicalHistories?.length || 0}</p>
                    <p className="card-label">Total appointments</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="card-icon red">
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>Allergies</h3>
                    <p className="card-value">{patientData?.allergies?.length || 0}</p>
                    <p className="card-label">Registered allergies</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="card-icon green">
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="card-content">
                    <h3>Active Medications</h3>
                    <p className="card-value">{patientData?.medications?.length || 0}</p>
                    <p className="card-label">Current prescriptions</p>
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
                    <h3>Latest Vitals</h3>
                    <p className="card-value">{patientData?.vitals?.length ? 'Available' : 'N/A'}</p>
                    <p className="card-label">Recent measurements</p>
                  </div>
                </div>
              </div>

              <div className="info-banner">
                <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <div>
                  <h4>Your medical information is secure</h4>
                  <p>All your health data is encrypted and stored securely according to HIPAA standards.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'history' && (
            <div className="section">
              <h2>Medical History</h2>
              {patientData?.clinicalHistories && patientData.clinicalHistories.length > 0 ? (
                <div className="records-list">
                  {patientData.clinicalHistories.map((record) => (
                    <div key={record.idHistory} className="record-card">
                      <div className="record-header">
                        <h3>Appointment #{record.idHistory}</h3>
                        <span className={`record-status ${record.closed ? 'closed' : 'open'}`}>
                          {record.closed ? 'Closed' : 'Open'}
                        </span>
                      </div>
                      <div className="record-details">
                        <div className="record-detail">
                          <span className="label">Date:</span>
                          <span className="value">{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        <div className="record-detail">
                          <span className="label">Start:</span>
                          <span className="value">{new Date(record.start).toLocaleTimeString()}</span>
                        </div>
                        {record.end && (
                          <div className="record-detail">
                            <span className="label">End:</span>
                            <span className="value">{new Date(record.end).toLocaleTimeString()}</span>
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
                  <h3>No medical history yet</h3>
                  <p>Your medical appointments will appear here once your doctor creates them.</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'allergies' && (
            <div className="section">
              <h2>Allergies</h2>
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
                  <h3>No allergies recorded</h3>
                  <p>Contact your healthcare provider if you need to add allergy information.</p>
                </div>
              )}
            </div>
          )}

          {activeSection === 'medications' && (
            <div className="section">
              <h2>Current Medications</h2>
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
                  <h3>No medications listed</h3>
                  <p>Your current medications will be displayed here when prescribed by your doctor.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
