import ManagerWarehousesPage from '@/src/manager/ManagerWarehousesPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function ManagerWarehousesRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['MANAGER']}>
      <ManagerWarehousesPage />
    </AuthRedirect>
  );
}
