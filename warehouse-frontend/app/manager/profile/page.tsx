import { ProfilePage } from '@/src/components/profile/ProfilePage';

export default function ManagerProfilePage() {
  return <ProfilePage backLink="/manager" roleLabel="MANAGER" roleBgColor="var(--role-manager)" />;
}
