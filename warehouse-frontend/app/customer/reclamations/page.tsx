import ReclamationsPage from '@/src/customer/ReclamationsPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';
import CustomerSectionLayout from '@/src/customer/CustomerSectionLayout';

export default function ReclamationsRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['CUSTOMER']}>
      <CustomerSectionLayout title="Reclamations" description="Raise and track customer complaints.">
        <ReclamationsPage />
      </CustomerSectionLayout>
    </AuthRedirect>
  );
}
