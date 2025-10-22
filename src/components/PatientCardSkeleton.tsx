import './PatientCardSkeleton.css';

export const PatientCardSkeleton = () => {
  return (
    <div className="patient-card skeleton-card">
      <div className="patient-card-header">
        <div className="skeleton skeleton-avatar"></div>
        <div className="patient-info">
          <div className="skeleton skeleton-name"></div>
          <div className="patient-meta">
            <div className="skeleton skeleton-badge"></div>
          </div>
        </div>
        <div className="skeleton skeleton-chevron"></div>
      </div>

      <div className="patient-card-footer">
        <div className="stat">
          <div className="skeleton skeleton-icon"></div>
          <div className="skeleton skeleton-stat-text"></div>
        </div>
        <div className="stat">
          <div className="skeleton skeleton-icon"></div>
          <div className="skeleton skeleton-stat-text"></div>
        </div>
      </div>
    </div>
  );
};
