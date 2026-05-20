import { AuthRedirect } from '@/src/auth/AuthRedirect';
import AdminSectionLayout from '@/src/admin/AdminSectionLayout';
import { ReclamationsBoard } from '@/src/reclamations/ReclamationsBoard';

export default function AdminReclamationsRoutePage() {
	return (
		<AuthRedirect mode="protected" allowedRoles={['ADMIN']}>
			<AdminSectionLayout title="Reclamations" description="Review customer complaints and resolve them from the admin dashboard.">
				<ReclamationsBoard />
			</AdminSectionLayout>
		</AuthRedirect>
	);
}