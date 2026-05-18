'use client';

import ManagerSectionLayout from './ManagerSectionLayout';
import AdminProductsDashbord from '@/src/admin/ProductsDashbord/AdminProductsDashbord';

export default function ManagerProductsPage() {
  return (
    <ManagerSectionLayout
      title="Products"
      description="Create, update, and remove products with the same operational controls as admin."
    >
      <AdminProductsDashbord />
    </ManagerSectionLayout>
  );
}
