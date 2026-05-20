import { AuthRedirect } from '@/src/auth/AuthRedirect';
import ManagerSectionLayout from '@/src/manager/ManagerSectionLayout';
import { ReclamationsBoard } from '@/src/reclamations/ReclamationsBoard';

export default function ManagerReclamationsRoutePage() {
	return (
		<AuthRedirect mode="protected" allowedRoles={['MANAGER']}>
			<ManagerSectionLayout title="Reclamations" description="Track customer complaints and manage resolutions from the manager dashboard.">
				<ReclamationsBoard />
			</ManagerSectionLayout>
		</AuthRedirect>
	);
}