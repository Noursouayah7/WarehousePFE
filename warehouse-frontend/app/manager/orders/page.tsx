import ManagerOrdersPage from '@/src/manager/ManagerOrdersPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function ManagerOrdersRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['MANAGER']}>
      <ManagerOrdersPage />
    </AuthRedirect>
  );
}
