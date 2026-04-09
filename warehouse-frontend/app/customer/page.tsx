import CustomerPage from '@/src/customer/CustomerPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function CustomerRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['CUSTOMER']}>
      <CustomerPage />
    </AuthRedirect>
  );
}
