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
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm tracking-[0.2em]">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="mb-4 text-sm tracking-[0.2em]">⚠ {error || 'FAILED TO LOAD PROFILE'}</p>
            <Link
              href={backLink}
              className="border border-[#2a2a2a] inline-block px-4 py-2 text-xs tracking-[0.15em] text-[#555] transition-colors hover:border-[#3a3a3a] hover:text-[#888]"
            >
              BACK
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Bar */}
      <div className="border-b border-[#1a1a1a] px-10 py-4">
        <div className="flex items-center justify-between">
          <Link
            href={backLink}
            className="text-xs tracking-[0.15em] text-[#555] transition-colors hover:text-[#888]"
          >
            ← BACK
          </Link>
          <span className={`px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-[#0a0a0a]`}
            style={{ backgroundColor: roleBgColor }}>
            {roleLabel}
          </span>
          <button
            onClick={logout}
            className="cursor-pointer border border-[#2a2a2a] bg-transparent px-4 py-1.5 text-[11px] tracking-[0.15em] text-[#555] transition-colors hover:border-[#3a3a3a] hover:text-[#888]"
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="mb-2 text-2xl font-bold tracking-[0.05em]">MY PROFILE</h1>
          <p className="text-xs tracking-[0.2em] text-[#555]">UPDATE YOUR PERSONAL INFORMATION</p>
        </div>

        {/* Profile Form */}
        <div className="border border-[#1a1a1a] bg-[#111] p-8">
          <ProfileForm
            profile={profile}
            token={token}
            onSuccess={handleProfileUpdate}
          />
        </div>

        {/* User Info Display */}
        <div className="mt-8 border border-[#1a1a1a] bg-[#111] p-8">
          <h2 className="mb-6 text-sm font-bold tracking-[0.2em]">ACCOUNT DETAILS</h2>
          <div className="grid gap-4 text-xs tracking-[0.05em]">
            <div className="flex justify-between border-b border-[#1a1a1a] pb-3">
              <span className="text-[#555]">USER ID:</span>
              <span className="text-white">{profile.id}</span>
            </div>
            <div className="flex justify-between border-b border-[#1a1a1a] pb-3">
              <span className="text-[#555]">ROLE:</span>
              <span className="text-white">{profile.roles}</span>
            </div>
            <div className="flex justify-between border-b border-[#1a1a1a] pb-3">
              <span className="text-[#555]">CIN:</span>
              <span className="text-white">{profile.cin}</span>
            </div>
            <div className="flex justify-between border-b border-[#1a1a1a] pb-3">
              <span className="text-[#555]">MEMBER SINCE:</span>
              <span className="text-white">{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#555]">LAST UPDATED:</span>
              <span className="text-white">{new Date(profile.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
