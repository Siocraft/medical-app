import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dashboard } from '../pages/Dashboard';
import { MedicDashboard } from '../pages/MedicDashboard';

export const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route medics to their dashboard
  if (user.type === 'medic') {
    return <MedicDashboard />;
  }

  // Route patients to the patient dashboard
  return <Dashboard />;
};
