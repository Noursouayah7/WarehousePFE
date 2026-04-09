import { ProfilePage } from '@/src/components/profile/ProfilePage';

export default function CustomerProfilePage() {
  return <ProfilePage backLink="/customer" roleLabel="CUSTOMER" roleBgColor="var(--role-customer)" />;
}
