import AdminSectionLayout from '@/src/admin/AdminSectionLayout';
import { AuthRedirect } from '@/src/auth/AuthRedirect';
import PriceForecastWidget from '@/src/components/PriceForecastWidget';

export default function AdminPredictionDashboardPage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['ADMIN']}>
      <AdminSectionLayout
        title="Price planning"
        description="Olive oil forecast in TND per 1L bottle, scenario checks, and model status."
      >
        <PriceForecastWidget />
      </AdminSectionLayout>
    </AuthRedirect>
  );
}
