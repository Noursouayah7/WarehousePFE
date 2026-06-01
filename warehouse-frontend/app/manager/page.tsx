import ManagerSectionLayout from '@/src/manager/ManagerSectionLayout';
import ManagerPageContent from '@/src/manager/ManagerDashboardPage';

export default function ManagerRoutePage() {
  return (
    <ManagerSectionLayout
      title="Manager panel"
      description="Orders and inbound shipments operations"
      showHero={false}
    >
      <ManagerPageContent />
    </ManagerSectionLayout>
  );
}