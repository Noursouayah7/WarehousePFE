import ManagerProductsPage from '@/src/manager/ManagerProductsPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function ManagerProductsRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['MANAGER']}>
      <ManagerProductsPage />
    </AuthRedirect>
  );
}
