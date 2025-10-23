import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSelector } from '../components/LanguageSelector';
import './Register.css';

export const Register: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'medic' | 'patient'>('patient');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Mi Medicina | Registrarse';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.register.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.register.passwordLength'));
      return;
    }

    setLoading(true);

    try {
      const registrationData: any = { name, lname, email, password, type: userType };

      // Add doctor email only if user is a patient and doctorEmail is provided
      if (userType === 'patient' && doctorEmail.trim()) {
        registrationData.doctorEmail = doctorEmail;
      }

      await register(registrationData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.register.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <LanguageSelector />
      <div className="register-card">
        <div className="register-header">
          <div className="logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM32 26H26V32C26 33.1 25.1 34 24 34C22.9 34 22 33.1 22 32V26H16C14.9 26 14 25.1 14 24C14 22.9 14.9 22 16 22H22V16C22 14.9 22.9 14 24 14C25.1 14 26 14.9 26 16V22H32C33.1 22 34 22.9 34 24C34 25.1 33.1 26 32 26Z" fill="#0066CC"/>
            </svg>
          </div>
          <h1>{t('auth.register.title')}</h1>
          <p>{t('auth.register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">{t('auth.register.name')}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.register.namePlaceholder')}
              required
              autoComplete="given-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lname">{t('auth.register.lname')}</label>
            <input
              id="lname"
              type="text"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
              placeholder={t('auth.register.lnamePlaceholder')}
              required
              autoComplete="family-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="userType">{t('auth.register.userType')}</label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value as 'medic' | 'patient')}
              required
            >
              <option value="patient">{t('auth.register.patient')}</option>
              <option value="medic">{t('auth.register.doctor')}</option>
            </select>
          </div>

          {userType === 'patient' && (
            <div className="form-group">
              <label htmlFor="doctorEmail">{t('auth.register.doctorEmail')}</label>
              <input
                id="doctorEmail"
                type="email"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                placeholder={t('auth.register.doctorEmailPlaceholder')}
                autoComplete="email"
              />
              <small className="form-hint">{t('auth.register.doctorEmailHint')}</small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">{t('auth.register.email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.register.emailPlaceholder')}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.register.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.register.passwordPlaceholder')}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.register.passwordPlaceholder')}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('auth.register.creatingAccount') : t('auth.register.createAccount')}
          </button>
        </form>

        <div className="register-footer">
          <p>
            {t('auth.register.hasAccount')} <Link to="/login">{t('auth.register.signIn')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
