import AdminSectionLayout from '@/src/admin/AdminSectionLayout';
import { AuthRedirect } from '@/src/auth/AuthRedirect';
import BiDashboardPanel from '@/src/bi/BiDashboardPanel';

export default function AdminRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['ADMIN']}>
      <AdminSectionLayout
        title="Admin's dashboard"
        description="Global operational overview across inventory, warehouses, users, orders, shipments, and support."
      >
        <BiDashboardPanel role="ADMIN" />
      </AdminSectionLayout>
    </AuthRedirect>
  );
}
