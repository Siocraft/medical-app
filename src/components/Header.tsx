import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Stethoscope, LogOut } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Header = ({ showBackButton, onBack }: HeaderProps) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getInitials = (name?: string, lname?: string) => {
    const firstInitial = name?.charAt(0) || '';
    const lastInitial = lname?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="app-header">
      <div className="header-content">
        {showBackButton && onBack ? (
          <button className="btn-back-header" onClick={onBack}>
            <span>←</span>
            <span>{t('medic.patientDetail.back')}</span>
          </button>
        ) : (
          <div className="logo">
            <Stethoscope className="logo-icon" size={24} />
            <span className="logo-text">{t('common.appName')}</span>
          </div>
        )}

        <div className="user-menu" ref={dropdownRef}>
          <button
            className="user-avatar-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="User menu"
          >
            <div className="user-avatar">
              {getInitials(user?.name, user?.lname)}
            </div>
          </button>

          {isDropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {getInitials(user?.name, user?.lname)}
                </div>
                <div className="dropdown-user-info">
                  <div className="dropdown-name-row">
                    <span className="dropdown-name">{user?.name} {user?.lname}</span>
                    <span className={`user-type-badge ${user?.type}`}>
                      {user?.type === 'medic' ? t('common.medic') : t('common.patient')}
                    </span>
                  </div>
                  <span className="dropdown-email">{user?.email}</span>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <LogOut size={18} />
                <span>{t('dashboard.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
