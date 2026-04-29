import { AuthRedirect } from '@/src/auth/AuthRedirect';
import WorkspaceShell from '@/src/common/WorkspaceShell';
import { SupportTicketsBoard } from '@/src/supportTickets/SupportTicketsBoard';

export default function TechnicienTicketsRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['TECHNICIEN']}>
      <WorkspaceShell
        title="Technician tickets"
        description="Create incident tickets for machines, products, delays, or alerts."
        roleLabel="Technicien"
        roleColor="var(--role-technicien)"
        profileHref="/technicien/profile"
        navGroups={[
          {
            label: 'General',
            items: [
              { label: 'Dashboard', href: '/technicien', icon: 'dashboard' as const },
              { label: 'Support tickets', href: '/technicien/tickets', icon: 'users' as const },
            ],
          },
        ]}
      >
        <SupportTicketsBoard canCreate canUpdate={false} />
      </WorkspaceShell>
    </AuthRedirect>
  );
}