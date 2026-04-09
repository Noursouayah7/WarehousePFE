'use client';

import AdminSectionLayout from './AdminSectionLayout';
import AdminProductsDashbord from './ProductsDashbord/AdminProductsDashbord';

export default function AdminProductsPage() {
  return (
    <AdminSectionLayout
      title="Products"
      description="Create, update, and monitor catalog inventory."
    >
      <AdminProductsDashbord />
    </AdminSectionLayout>
  );
}
