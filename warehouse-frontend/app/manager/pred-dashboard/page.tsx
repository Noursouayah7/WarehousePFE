import ManagerSectionLayout from '@/src/manager/ManagerSectionLayout';
import { AuthRedirect } from '@/src/auth/AuthRedirect';
import PriceForecastWidget from '@/src/components/PriceForecastWidget';

export default function ManagerPredictionDashboardPage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['MANAGER']}>
      <ManagerSectionLayout
        title="Price planning"
        description="Olive oil forecast in TND per 1L bottle, scenario checks, and model status."
        showHero={false}
      >
        <PriceForecastWidget />
      </ManagerSectionLayout>
    </AuthRedirect>
  );
}
