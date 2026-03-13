import AdminWarehousesPage from '@/src/admin/AdminWarehousesPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function AdminWarehousesRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['ADMIN']}>
      <AdminWarehousesPage />
    </AuthRedirect>
  );
}
