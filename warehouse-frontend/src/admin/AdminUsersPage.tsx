'use client';

import AdminSectionLayout from './AdminSectionLayout';
import AdminUsersDashbord from './UsersDashbord/AdminUsersDashbord';

export default function AdminUsersPage() {
  return (
    <AdminSectionLayout
      title="Users"
      description="Manage users, assign roles, and review account details."
    >
      <AdminUsersDashbord />
    </AdminSectionLayout>
  );
}
