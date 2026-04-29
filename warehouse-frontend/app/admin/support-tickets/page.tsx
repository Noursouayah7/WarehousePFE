import { AuthRedirect } from '@/src/auth/AuthRedirect';
import AdminSectionLayout from '@/src/admin/AdminSectionLayout';
import { SupportTicketsBoard } from '@/src/supportTickets/SupportTicketsBoard';

export default function AdminSupportTicketsRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['ADMIN']}>
      <AdminSectionLayout title="Support tickets" description="Review incidents raised by technicians and operational alerts.">
        <SupportTicketsBoard canCreate={false} canUpdate />
      </AdminSectionLayout>
    </AuthRedirect>
  );
}