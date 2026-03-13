'use client';

import AdminSectionLayout from './AdminSectionLayout';
import AdminUsersDashbord from './UsersDashbord/AdminUsersDashbord';

export default function AdminUsersPage() {
  return (
    <AdminSectionLayout
      title="ADMIN PANEL"
      description="Manage users, assign roles, and review details"
    >
      <AdminUsersDashbord />
    </AdminSectionLayout>
  );
}
