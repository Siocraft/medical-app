import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Search, UserPlus, Plus, X, Trash2 } from 'lucide-react';
import api from '../services/api';
import type { Doctor } from '../types';
import './DoctorSection.css';

interface DoctorSectionProps {
  doctors: Doctor[];
  onDoctorLinked: () => void;
}

export const DoctorSection: React.FC<DoctorSectionProps> = ({ doctors, onDoctorLinked }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Doctor[]>([]);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState<number | null>(null);
  const [unlinking, setUnlinking] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ doctorId: number; x: number; y: number } | null>(null);
  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const justOpenedMenu = React.useRef<boolean>(false);

  const searchDoctors = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await api.get(`/medics/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching doctors:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const linkToDoctor = async (doctorEmail: string, doctorId: number) => {
    try {
      setLinking(doctorId);
      await api.post('/patients/me/link-doctor', { doctorEmail });
      alert(t('dashboard.doctor.linkSuccess'));
      setSearchQuery('');
      setSearchResults([]);
      setShowSearch(false);
      onDoctorLinked();
    } catch (error: any) {
      console.error('Error linking to doctor:', error);
      alert(error.response?.data?.message || t('dashboard.doctor.linkError'));
    } finally {
      setLinking(null);
    }
  };

  const unlinkFromDoctor = async (medicId: number) => {
    if (!window.confirm(t('dashboard.doctor.unlinkConfirm'))) {
      return;
    }

    try {
      setUnlinking(medicId);
      await api.delete(`/patients/me/unlink-doctor/${medicId}`);
      alert(t('dashboard.doctor.unlinkSuccess'));
      setContextMenu(null);
      onDoctorLinked();
    } catch (error: any) {
      console.error('Error unlinking from doctor:', error);
      alert(error.response?.data?.message || t('dashboard.doctor.unlinkError'));
    } finally {
      setUnlinking(null);
    }
  };

  const handleLongPressStart = (doctorId: number, event: React.MouseEvent | React.TouchEvent) => {
    // Capture the rect before setTimeout to avoid React event pooling issues
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    longPressTimer.current = setTimeout(() => {
      justOpenedMenu.current = true;
      setContextMenu({
        doctorId,
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
  React.useEffect(() => {
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

  const hasDoctors = doctors && doctors.length > 0;

  return (
    <div className="doctor-section">
      <div className="doctor-section-header">
        <h2 className="patient-dashboard-section-title">
          <User size={24} />
          {t('dashboard.patient.myDoctor')}
        </h2>
        {hasDoctors && (
          <button
            className="add-doctor-button"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? (
              <>
                <X size={18} />
                {t('dashboard.doctor.cancelAdd')}
              </>
            ) : (
              <>
                <Plus size={18} />
                {t('dashboard.doctor.addDoctor')}
              </>
            )}
          </button>
        )}
      </div>

      {hasDoctors && (
        <div className="doctors-list">
          {doctors.map((doctor) => (
            <div
              key={doctor.idMedic}
              className="doctor-info-card"
              onMouseDown={(e) => handleLongPressStart(doctor.idMedic, e)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onTouchStart={(e) => handleLongPressStart(doctor.idMedic, e)}
              onTouchEnd={handleLongPressEnd}
            >
              <div className="doctor-avatar">
                {doctor.name?.charAt(0)}{doctor.lname?.charAt(0)}
              </div>
              <div className="doctor-details">
                <h3>{doctor.name} {doctor.lname}</h3>
                <div className="doctor-contact">
                  <div className="doctor-contact-item">
                    <Mail size={16} />
                    <span>{doctor.email}</span>
                  </div>
                  {doctor.whatsapp && (
                    <div className="doctor-contact-item">
                      <Phone size={16} />
                      <span>{doctor.whatsapp}</span>
                    </div>
                  )}
                </div>
                {doctor.about && (
                  <p className="doctor-about">{doctor.about}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="doctor-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => unlinkFromDoctor(contextMenu.doctorId)}
            disabled={unlinking === contextMenu.doctorId}
            className="context-menu-item danger"
          >
            <Trash2 size={16} />
            <span>{t('dashboard.doctor.unlinkButton')}</span>
          </button>
        </div>
      )}

      {(showSearch || !hasDoctors) && (
        <div className="doctor-search-section">
          {!hasDoctors && (
            <p className="no-doctor-message">{t('dashboard.doctor.noDoctor')}</p>
          )}
          <h3>{t('dashboard.doctor.searchDoctor')}</h3>

          <div className="search-box">
            <input
              type="text"
              placeholder={t('dashboard.doctor.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchDoctors()}
            />
            <button onClick={searchDoctors} disabled={searching}>
              <Search size={20} />
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((doc) => (
                <div key={doc.idMedic} className="doctor-result-card">
                  <div className="doctor-result-avatar">
                    {doc.name?.charAt(0)}{doc.lname?.charAt(0)}
                  </div>
                  <div className="doctor-result-info">
                    <h4>{doc.name} {doc.lname}</h4>
                    <span className="doctor-result-email">{doc.email}</span>
                  </div>
                  <button
                    onClick={() => linkToDoctor(doc.email, doc.idMedic)}
                    disabled={linking === doc.idMedic}
                    className="link-button"
                  >
                    {linking === doc.idMedic ? (
                      t('dashboard.doctor.linking')
                    ) : (
                      <>
                        <UserPlus size={16} />
                        {t('dashboard.doctor.linkButton')}
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !searching && (
            <p className="no-results">{t('dashboard.doctor.noResults')}</p>
          )}
        </div>
      )}
    </div>
  );
};
