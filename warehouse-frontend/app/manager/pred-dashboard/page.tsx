import ManagerSectionLayout from '@/src/manager/ManagerSectionLayout';
import { AuthRedirect } from '@/src/auth/AuthRedirect';
import PriceForecastWidget from '@/src/components/PriceForecastWidget';

export default function ManagerPredictionDashboardPage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['MANAGER']}>
      <ManagerSectionLayout
        title="Prediction dashboard"
        description="Forecast price trends and run simulations for manager planning."
        showHero={false}
      >
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <p className="text-sm text-[var(--muted-foreground)]">
              Use this page to inspect the next-period price forecast and test what-if scenarios.
            </p>
          </div>
          <PriceForecastWidget />
        </div>
      </ManagerSectionLayout>
    </AuthRedirect>
  );
}
