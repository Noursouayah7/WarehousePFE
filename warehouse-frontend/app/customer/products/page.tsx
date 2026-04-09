import CustomerPage from '@/src/customer/CustomerDashboard/CustomerPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function CustomerProductsRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['CUSTOMER']}>
      <CustomerPage />
    </AuthRedirect>
  );
}
