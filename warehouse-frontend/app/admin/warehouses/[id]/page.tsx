import AdminSectionLayout from '@/src/admin/AdminSectionLayout';
import AdminWarehouseBlocsDashbord from '@/src/admin/WarehousesDashbord/AdminWarehouseBlocsDashbord';
import { AuthRedirect } from '@/src/auth/AuthRedirect';
import { redirect } from 'next/navigation';

type AdminWarehouseDetailsRoutePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminWarehouseDetailsRoutePage({ params }: AdminWarehouseDetailsRoutePageProps) {
  const { id } = await params;
  const warehouseId = Number(id);

  if (Number.isNaN(warehouseId) || warehouseId <= 0) {
    redirect('/admin/warehouses');
  }

  return (
    <AuthRedirect mode="protected" allowedRoles={['ADMIN']}>
      <AdminSectionLayout
        title={`WAREHOUSE ${warehouseId}`}
        description="Manage blocs included in this warehouse"
      >
        <AdminWarehouseBlocsDashbord warehouseId={warehouseId} />
      </AdminSectionLayout>
    </AuthRedirect>
  );
}