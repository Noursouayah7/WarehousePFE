import AdminProductsPage from '@/src/admin/AdminProductsPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function AdminProductsRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['ADMIN']}>
      <AdminProductsPage />
    </AuthRedirect>
  );
}
