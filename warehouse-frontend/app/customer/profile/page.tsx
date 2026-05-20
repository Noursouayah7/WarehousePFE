import { AuthRedirect } from '@/src/auth/AuthRedirect';
import { ProfilePage } from '@/src/components/profile/ProfilePage';
import CustomerSectionLayout from '@/src/customer/CustomerSectionLayout';

export default function CustomerProfilePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['CUSTOMER']}>
      <CustomerSectionLayout title="My Profile" description="Update your personal and delivery information.">
        <ProfilePage backLink="/customer/orders" roleLabel="CUSTOMER" roleBgColor="var(--role-customer)" />
      </CustomerSectionLayout>
    </AuthRedirect>
  );
}
