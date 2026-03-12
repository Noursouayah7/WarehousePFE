import RegisterPage from '@/src/auth/RegisterPage';
import { AuthRedirect } from '@/src/auth/AuthRedirect';

export default function RegisterRoutePage() {
  return (
    <AuthRedirect mode="public-only">
      <RegisterPage />
    </AuthRedirect>
  );
}
