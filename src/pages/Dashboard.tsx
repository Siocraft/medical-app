import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { patientService } from '../services/patientService';
import { Header } from '../components/Header';
import type { PatientData, Allergy, Vital, Lab, Vaccine, PathologicalRecord, Contact, PatientFile } from '../types';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
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
  Ruler
} from 'lucide-react';
import './Dashboard.css';
import './PatientDetail.css';

export const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('dashboard.loading')}</p>
      </div>
    );
  }

  const patient = patientData?.patient;
  const allergies = patientData?.allergies || [];
  const vitals = patientData?.vitals || [];
  const labs = patientData?.labs || [];
  const vaccines = patientData?.vaccines || [];
  const pathologicalRecords = patientData?.pathologicalRecords || [];
  const contacts = patientData?.contacts || [];
  const lifestyle = patientData?.lifestyle;
  const insurance = patientData?.insurance;
  const profession = patientData?.profession;
  const religion = patientData?.religion;
  const documentType = patientData?.documentType;
  const files = patientData?.files || [];
  const appointments = patientData?.clinicalHistories || [];

  return (
    <div className="dashboard">
      <Header />

      <div className="patient-dashboard-container">
        {/* Patient Header */}
        <div className="patient-dashboard-header">
          <div className="patient-dashboard-header-content">
            <div className="patient-dashboard-avatar">
              {patient?.name?.charAt(0)}{patient?.lname?.charAt(0)}
            </div>
            <div className="patient-dashboard-info">
              <h1>{patient?.name} {patient?.lname}</h1>
              <div className="patient-dashboard-contact">
                {patient?.email && (
                  <div className="patient-dashboard-contact-item">
                    <Mail size={16} />
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient?.phone && (
                  <div className="patient-dashboard-contact-item">
                    <Phone size={16} />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient?.address && (
                  <div className="patient-dashboard-contact-item">
                    <MapPin size={16} />
                    <span>{patient.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* My Information Section */}
        <h2 className="patient-dashboard-section-title">{t('dashboard.patient.myInformation')}</h2>

        {/* Demographics & Physical Info Grid */}
        <div className="info-sections-grid">
          {/* Demographics Panel */}
          <div className="info-section">
            <h3 className="section-title">
              <User size={20} />
              {t('patientDetail.demographics')}
            </h3>
            <div className="section-content">
              {patient?.civilStatus && (
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
              {documentType && (
                <div className="info-row">
                  <span className="info-row-label">{t('patientDetail.documentType')}</span>
                  <span className="info-row-value">{documentType.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Physical Info */}
          <div className="info-section">
            <h3 className="section-title">
              <Activity size={20} />
              {t('patientDetail.physicalInfo')}
            </h3>
            <div className="section-content">
              {patient?.weight && (
                <div className="info-row">
                  <span className="info-row-label">
                    <Weight size={16} />
                    {t('patientDetail.weight')}
                  </span>
                  <span className="info-row-value">{patient.weight} kg</span>
                </div>
              )}
              {patient?.height && (
                <div className="info-row">
                  <span className="info-row-label">
                    <Ruler size={16} />
                    {t('patientDetail.height')}
                  </span>
                  <span className="info-row-value">{patient.height} cm</span>
                </div>
              )}
              {patient?.bloodGroup && patient?.bloodRh && (
                <div className="info-row">
                  <span className="info-row-label">{t('patientDetail.bloodType')}</span>
                  <span className="info-row-value blood-type-badge">{patient.bloodGroup}{patient.bloodRh}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Insurance Info */}
        {insurance && (
          <div className="info-section">
            <h3 className="section-title">
              <ShieldAlert size={20} />
              {t('patientDetail.insurance')}
            </h3>
            <div className="section-content">
              {insurance.name && (
                <div className="info-row">
                  <span className="info-row-label">{t('patientDetail.insuranceName')}</span>
                  <span className="info-row-value">{insurance.name}</span>
                </div>
              )}
              {insurance.provider && (
                <div className="info-row">
                  <span className="info-row-label">{t('patientDetail.provider')}</span>
                  <span className="info-row-value">{insurance.provider}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Appointments Section */}
        <h2 className="patient-dashboard-section-title">{t('dashboard.patient.myAppointments')}</h2>

        {appointments.length > 0 ? (
          <div className="appointments-list">
            {appointments.map((appointment: any) => (
              <div key={appointment.idHistory} className="appointment-card">
                <div className="appointment-header">
                  <div className="appointment-date">
                    <Calendar size={20} />
                    <div>
                      <h4>{new Date(appointment.date).toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                      <p className="appointment-time">{new Date(appointment.start).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <span className={`appointment-status ${appointment.closed ? 'closed' : 'open'}`}>
                    {appointment.closed ? t('patientDetail.statusClosed') : t('patientDetail.statusOpen')}
                  </span>
                </div>
                {appointment.motive && (
                  <div className="appointment-detail">
                    <h5>{t('patientDetail.reason')}</h5>
                    <p>{appointment.motive}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-section">
            <Calendar size={48} />
            <h3>{t('patientDetail.noAppointments')}</h3>
          </div>
        )}

        {/* My Health Section */}
        <h2 className="patient-dashboard-section-title">{t('dashboard.patient.myHealth')}</h2>

        {/* Allergies Section */}
        {allergies.length > 0 && (
          <div className="info-section">
            <h3 className="section-title">
              <AlertTriangle size={20} />
              {t('patientDetail.allergies')} ({allergies.length})
            </h3>
            <div className="section-content">
              <div className="allergies-list">
                {allergies.map((allergy: Allergy) => (
                  <div key={allergy.idPatientAllergy} className="allergy-item">
                    <div className="allergy-header">
                      <span className="allergy-name">{allergy.allergyName || allergy.name || 'Unknown'}</span>
                      {allergy.severity && <span className={`severity-badge ${allergy.severity.toLowerCase()}`}>{allergy.severity}</span>}
                    </div>
                    {allergy.reaction && <p className="allergy-reaction">{allergy.reaction}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pathological Records */}
        {pathologicalRecords.length > 0 && (
          <div className="info-section">
            <h3 className="section-title">
              <FileText size={20} />
              {t('patientDetail.pathologicalRecords')} ({pathologicalRecords.length})
            </h3>
            <div className="section-content">
              <div className="pathological-list">
                {pathologicalRecords.map((record: PathologicalRecord) => (
                  <div key={record.idRecord} className="pathological-item">
                    <div className="pathological-header">
                      <span className="pathological-name">{record.condition || 'Unknown'}</span>
                      {record.status && <span className={`status-badge ${record.status.toLowerCase()}`}>{record.status}</span>}
                    </div>
                    {record.notes && <p className="pathological-notes">{record.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vitals Timeline */}
        {vitals.length > 0 && (
          <div className="info-section">
            <h3 className="section-title">
              <Activity size={20} />
              {t('patientDetail.vitals')} ({vitals.length})
            </h3>
            <div className="section-content">
              <div className="vitals-timeline">
                {vitals.slice(0, 5).map((vital: Vital) => (
                  <div key={vital.idVital} className="vital-entry">
                    <div className="vital-date">{new Date(vital.date).toLocaleDateString(i18n.language)}</div>
                    <div className="vital-metrics">
                      {vital.systolic && vital.diastolic && (
                        <div className="vital-metric">
                          <Heart size={16} />
                          <span>{vital.systolic}/{vital.diastolic} mmHg</span>
                        </div>
                      )}
                      {vital.heartRate && (
                        <div className="vital-metric">
                          <Activity size={16} />
                          <span>{vital.heartRate} bpm</span>
                        </div>
                      )}
                      {vital.temperature && (
                        <div className="vital-metric">
                          <span>{vital.temperature}°C</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lab Results */}
        {labs.length > 0 && (
          <div className="info-section">
            <h3 className="section-title">
              <Beaker size={20} />
              {t('patientDetail.labResults')} ({labs.length})
            </h3>
            <div className="section-content">
              <div className="labs-list">
                {labs.slice(0, 10).map((lab: Lab) => (
                  <div key={lab.idLabs} className="lab-item">
                    <div className="lab-date">{new Date(lab.date).toLocaleDateString(i18n.language)}</div>
                    <div className="lab-details">
                      <span className="lab-name">{lab.testName || `Lab Test #${lab.idContent}`}</span>
                      <span className="lab-result">{lab.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vaccinations */}
        {vaccines.length > 0 && (
          <div className="info-section">
            <h3 className="section-title">
              <Syringe size={20} />
              {t('patientDetail.vaccinations')} ({vaccines.length})
            </h3>
            <div className="section-content">
              <div className="vaccines-list">
                {vaccines.map((vaccine: Vaccine) => (
                  <div key={vaccine.idVaccine} className="vaccine-item">
                    <div className="vaccine-date">{new Date(vaccine.date).toLocaleDateString(i18n.language)}</div>
                    <div className="vaccine-details">
                      <span className="vaccine-name">{vaccine.vaccineName || 'Vaccine'}</span>
                      {vaccine.dose && <span className="vaccine-dose">Dose: {vaccine.dose}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lifestyle Information */}
        {lifestyle && (lifestyle.alcohol || lifestyle.tobacco || lifestyle.drugs || lifestyle.physicalActivity) && (
          <div className="info-section">
            <h3 className="section-title">
              <Dumbbell size={20} />
              {t('patientDetail.lifestyle')}
            </h3>
            <div className="section-content">
              <div className="lifestyle-grid">
                {lifestyle.alcohol && (
                  <div className="lifestyle-item">
                    <div className="lifestyle-icon alcohol">
                      <Wine size={20} />
                    </div>
                    <div className="lifestyle-details">
                      <h5>{t('patientDetail.alcohol')}</h5>
                      <p>{lifestyle.alcohol.frequency || 'Not specified'}</p>
                      {lifestyle.alcohol.quantity && <span className="lifestyle-note">{lifestyle.alcohol.quantity}</span>}
                    </div>
                  </div>
                )}
                {lifestyle.tobacco && (
                  <div className="lifestyle-item">
                    <div className="lifestyle-icon tobacco">
                      <Cigarette size={20} />
                    </div>
                    <div className="lifestyle-details">
                      <h5>{t('patientDetail.tobacco')}</h5>
                      <p>{lifestyle.tobacco.frequency || 'Not specified'}</p>
                      {lifestyle.tobacco.yearsUsing && <span className="lifestyle-note">{lifestyle.tobacco.yearsUsing} years</span>}
                    </div>
                  </div>
                )}
                {lifestyle.drugs && (
                  <div className="lifestyle-item">
                    <div className="lifestyle-icon drugs">
                      <Pill size={20} />
                    </div>
                    <div className="lifestyle-details">
                      <h5>{t('patientDetail.drugs')}</h5>
                      <p>{lifestyle.drugs.type || 'Not specified'}</p>
                      {lifestyle.drugs.frequency && <span className="lifestyle-note">{lifestyle.drugs.frequency}</span>}
                    </div>
                  </div>
                )}
                {lifestyle.physicalActivity && (
                  <div className="lifestyle-item">
                    <div className="lifestyle-icon physical">
                      <Dumbbell size={20} />
                    </div>
                    <div className="lifestyle-details">
                      <h5>{t('patientDetail.physicalActivity')}</h5>
                      <p>{lifestyle.physicalActivity.frequency || 'Not specified'}</p>
                      {lifestyle.physicalActivity.type && <span className="lifestyle-note">{lifestyle.physicalActivity.type}</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        {contacts.length > 0 && (
          <div className="info-section">
            <h3 className="section-title">
              <Users size={20} />
              {t('patientDetail.emergencyContacts')} ({contacts.length})
            </h3>
            <div className="section-content">
              <div className="contacts-list">
                {contacts.map((contact: Contact) => (
                  <div key={contact.idContact} className="contact-item">
                    <div className="contact-header">
                      <User size={18} />
                      <div>
                        <h5 className="contact-name">{contact.name || 'Unknown'}</h5>
                        {contact.relationship && <span className="contact-relationship">{contact.relationship}</span>}
                      </div>
                    </div>
                    <div className="contact-details">
                      {contact.phone && (
                        <div className="contact-detail-item">
                          <Phone size={14} />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div className="contact-detail-item">
                          <Mail size={14} />
                          <span>{contact.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documents/Files */}
        {files.length > 0 && (
          <div className="info-section">
            <h3 className="section-title">
              <File size={20} />
              {t('patientDetail.documents')} ({files.length})
            </h3>
            <div className="section-content">
              <div className="files-list">
                {files.map((file: PatientFile) => (
                  <div key={file.idFile} className="file-item">
                    <File size={18} />
                    <div className="file-details">
                      <span className="file-name">{file.name || 'Document'}</span>
                      {file.date && <span className="file-date">{new Date(file.date).toLocaleDateString(i18n.language)}</span>}
                      <span className="file-type">{file.mainType}</span>
                    </div>
                    <div className="file-code-small">
                      <span className="file-code-value">{file.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
