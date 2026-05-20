'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProfileForm } from '@/src/components/profile/ProfileForm';
import { ProfileService, UserProfile } from '@/src/services/profileService';
import { useAuth } from '@/src/auth/AuthProvider';

interface ProfilePageProps {
  backLink: string;
  roleLabel: string;
  roleBgColor: string;
}

export function ProfilePage({ backLink, roleLabel, roleBgColor }: ProfilePageProps) {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await ProfileService.getProfile(token);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, router]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-[var(--foreground)]">
        <div className="flex min-h-[40vh] items-center justify-center px-6 py-20">
          <div className="rounded-2xl border border-[var(--border)] bg-white px-6 py-5 shadow-sm">
            <p className="text-sm text-[var(--muted-foreground)]">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-[var(--foreground)]">
        <div className="flex min-h-[40vh] items-center justify-center px-6 py-20">
          <div className="max-w-md rounded-2xl border border-[var(--border)] bg-white p-8 text-center shadow-sm">
            <p className="mb-4 text-sm text-[var(--color-error)]">{error || 'Failed to load profile'}</p>
            <Link
              href={backLink}
              className="inline-flex rounded-md border border-[var(--input)] bg-white px-4 py-2 text-xs font-medium text-[#6b705c] transition-colors hover:border-[var(--border)] hover:text-[#344e41]"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-[var(--foreground)]">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My profile</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Update your personal information and keep delivery details current.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={backLink} className="rounded-md border border-[var(--input)] bg-white px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]">
            Back
          </Link>
          <span className="rounded-full px-3 py-1 text-[11px] font-semibold text-black" style={{ backgroundColor: roleBgColor }}>
            {roleLabel}
          </span>
          <button
            onClick={logout}
            className="rounded-md border border-[var(--input)] bg-white px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <ProfileForm profile={profile} token={token ?? ''} onSuccess={handleProfileUpdate} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Profile snapshot</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold text-black" style={{ backgroundColor: roleBgColor }}>
                {roleLabel.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{profile.name || 'Unnamed user'}</h2>
                <p className="text-sm text-[var(--muted-foreground)]">{profile.email}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm">
              {[
                ['User ID', String(profile.id)],
                ['Role', profile.roles],
                ['CIN', profile.cin],
                ['Phone', profile.phone || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-lg bg-[#f7f7f5] px-4 py-3">
                  <span className="text-[var(--muted-foreground)]">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm">
            <h2 className="text-sm font-semibold">Timeline</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-[#f7f7f5] px-4 py-3">
                <span className="text-[var(--muted-foreground)]">Member since</span>
                <span className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#f7f7f5] px-4 py-3">
                <span className="text-[var(--muted-foreground)]">Last updated</span>
                <span className="font-medium">{new Date(profile.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
