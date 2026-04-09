import CustomerPage from '@/src/customer/CustomerDashboard/CustomerPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function CustomerOrdersRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['CUSTOMER']}>
      <CustomerPage />
    </AuthRedirect>
  );
}
