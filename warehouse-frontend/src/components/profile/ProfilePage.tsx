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
      <div className="min-h-screen bg-[#f5f1e8] text-[#344e41]">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[var(--muted-foreground)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] text-[#344e41]">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="mb-4 text-sm">{error || 'Failed to load profile'}</p>
            <Link
              href={backLink}
              className="inline-block rounded-md border border-[var(--input)] bg-white px-4 py-2 text-xs font-medium text-[#6b705c] transition-colors hover:border-[var(--border)] hover:text-[#6b705c]"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#344e41]">
      {/* Top Bar */}
      <div className="border-b border-[#a3b18a] px-10 py-4">
        <div className="flex items-center justify-between">
          <Link
            href={backLink}
            className="text-xs font-medium text-[#6b705c] transition-colors hover:text-[#6b705c]"
          >
            ← Back
          </Link>
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold text-black`}
            style={{ backgroundColor: roleBgColor }}>
            {roleLabel}
          </span>
          <button
            onClick={logout}
            className="cursor-pointer rounded-md border border-[var(--input)] bg-white px-4 py-1.5 text-xs font-medium text-[#6b705c] transition-colors hover:border-[var(--border)] hover:text-[#6b705c]"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">My profile</h1>
          <p className="text-sm text-[#6b705c]">Update your personal information</p>
        </div>

        {/* Profile Form */}
        <div className="rounded-xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <ProfileForm
            profile={profile}
            token={token ?? ''}
            onSuccess={handleProfileUpdate}
          />
        </div>

        {/* User Info Display */}
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-sm font-semibold">Account details</h2>
          <div className="grid gap-4 text-xs">
            <div className="flex justify-between border-b border-[#a3b18a] pb-3">
              <span className="text-[#6b705c]">User ID:</span>
              <span className="text-[#344e41]">{profile.id}</span>
            </div>
            <div className="flex justify-between border-b border-[#a3b18a] pb-3">
              <span className="text-[#6b705c]">Role:</span>
              <span className="text-[#344e41]">{profile.roles}</span>
            </div>
            <div className="flex justify-between border-b border-[#a3b18a] pb-3">
              <span className="text-[#6b705c]">CIN:</span>
              <span className="text-[#344e41]">{profile.cin}</span>
            </div>
            <div className="flex justify-between border-b border-[#a3b18a] pb-3">
              <span className="text-[#6b705c]">Member since:</span>
              <span className="text-[#344e41]">{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b705c]">Last updated:</span>
              <span className="text-[#344e41]">{new Date(profile.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
