'use client';

import AdminSectionLayout from './AdminSectionLayout';
import AdminProductsDashbord from './ProductsDashbord/AdminProductsDashbord';

export default function AdminProductsPage() {
  return (
    <AdminSectionLayout
      title="PRODUCTS"
      description="Products administration section"
    >
      <AdminProductsDashbord />
    </AdminSectionLayout>
  );
}
