import AdminPage from "@/src/admin/AdminDashboardPage";
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function AdminRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['ADMIN']}>
      <AdminPage />
    </AuthRedirect>
  );
}