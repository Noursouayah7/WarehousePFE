import { AuthRedirect } from '@/src/auth/AuthRedirect';
import ManagerSectionLayout from '@/src/manager/ManagerSectionLayout';
import { SupportTicketsBoard } from '@/src/supportTickets/SupportTicketsBoard';

export default function ManagerSupportTicketsRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['MANAGER']}>
      <ManagerSectionLayout title="Support tickets" description="Track technician incidents and operational alerts." showHero={false}>
        <SupportTicketsBoard canCreate={false} canUpdate />
      </ManagerSectionLayout>
    </AuthRedirect>
  );
}