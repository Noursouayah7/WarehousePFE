import AdminUsersPage from '@/src/admin/AdminUsersPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function AdminUsersRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['ADMIN']}>
      <AdminUsersPage />
    </AuthRedirect>
  );
}
