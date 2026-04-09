import ManagerShipmentsPage from '@/src/manager/ManagerShipmentsPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function ManagerShipmentsRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['MANAGER']}>
      <ManagerShipmentsPage />
    </AuthRedirect>
  );
}
