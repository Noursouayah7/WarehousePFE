import { AuthRedirect } from '@/src/auth/AuthRedirect';
import AssistantPage from '@/src/assistant/AssistantPage';

export default function AssistantRoutePage() {
  return (
    <AuthRedirect mode="protected" allowedRoles={['ADMIN', 'MANAGER']}>
      <AssistantPage />
    </AuthRedirect>
  );
}