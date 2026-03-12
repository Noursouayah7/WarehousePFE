import ManagerPage from "@/src/manager/ManagerDashboardPage";
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function ManagerRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['MANAGER']}>
      <ManagerPage />
    </AuthRedirect>
  );
}