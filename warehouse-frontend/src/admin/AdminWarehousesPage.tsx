'use client';

import AdminSectionLayout from './AdminSectionLayout';
import AdminWarehousesDashbord from './WarehousesDashbord/AdminWarehousesDashbord';

export default function AdminWarehousesPage() {
  return (
    <AdminSectionLayout
      title="Warehouses"
      description="Manage warehouse records, blocs, and capacities."
    >
      <AdminWarehousesDashbord />
    </AdminSectionLayout>
  );
}
