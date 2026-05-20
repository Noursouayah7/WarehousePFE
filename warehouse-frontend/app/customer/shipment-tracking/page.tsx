import ShipmentTrackingPage from '@/src/customer/ShipmentTrackingPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';
import CustomerSectionLayout from '@/src/customer/CustomerSectionLayout';

export default function ShipmentTrackingRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['CUSTOMER']}>
      <CustomerSectionLayout title="Shipment Tracking" description="Track your orders and shipments in real-time.">
        <ShipmentTrackingPage />
      </CustomerSectionLayout>
    </AuthRedirect>
  );
}
