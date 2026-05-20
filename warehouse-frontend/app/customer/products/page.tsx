import CustomerPage from '@/src/customer/CustomerDashboard/CustomerPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';
import CustomerSectionLayout from '@/src/customer/CustomerSectionLayout';

export default function CustomerProductsRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['CUSTOMER']}>
      <CustomerSectionLayout title="Customer Workspace" description="Browse products, place requests, and track order progress.">
        <CustomerPage />
      </CustomerSectionLayout>
    </AuthRedirect>
  );
}
