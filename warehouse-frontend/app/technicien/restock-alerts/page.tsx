import TechnicienPage from '@/src/technicien/TechnicienDashboardPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function TechnicienRestockAlertsRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['TECHNICIEN']}>
      <TechnicienPage />
    </AuthRedirect>
  );
}