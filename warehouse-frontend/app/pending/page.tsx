import PendingPage from '@/src/common/PendingPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function PendingRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['PENDING']} allowMissingRole>
      <PendingPage />
    </AuthRedirect>
  );
}
