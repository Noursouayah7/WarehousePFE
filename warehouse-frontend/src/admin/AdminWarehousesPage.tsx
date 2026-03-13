'use client';

import AdminSectionLayout from './AdminSectionLayout';
import AdminWarehousesDashbord from './WarehousesDashbord/AdminWarehousesDashbord';

export default function AdminWarehousesPage() {
  return (
    <AdminSectionLayout
      title="WAREHOUSES"
      description="Warehouse administration section"
    >
      <AdminWarehousesDashbord />
    </AdminSectionLayout>
  );
}
