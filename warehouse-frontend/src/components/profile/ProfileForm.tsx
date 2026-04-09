'use client';

import { useState } from 'react';
import { UserProfile, UpdateProfileDto, ProfileService } from '@/src/services/profileService';

interface ProfileFormProps {
  profile: UserProfile;
  token: string;
  onSuccess?: (profile: UserProfile) => void;
  onError?: (error: string) => void;
}

export function ProfileForm({ profile, token, onSuccess, onError }: ProfileFormProps) {
  const [formData, setFormData] = useState<UpdateProfileDto>({
    name: profile.name || '',
    email: profile.email || '',
    address: profile.address || '',
    phone: profile.phone || '',
    profilePicture: profile.profilePicture || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(profile.profilePicture || null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        setFormData(prev => ({
          ...prev,
          profilePicture: base64,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedProfile = await ProfileService.updateProfile(token, formData);
      setSuccess(true);
      if (onSuccess) {
        onSuccess(updatedProfile);
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {success && (
        <div className="rounded-xl bg-[var(--tint-success)] px-4 py-3 text-sm text-[var(--color-success)]">
          Profile updated successfully.
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-[var(--tint-error)] px-4 py-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <label className="text-xs font-medium text-[var(--muted-foreground)]">Profile picture</label>
        <div className="flex flex-wrap items-center gap-4">
          {previewImage && (
            <img
              src={previewImage}
              alt="Profile preview"
              className="h-20 w-20 rounded-xl border border-[var(--border)] object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-xs text-[var(--muted-foreground)] file:mr-4 file:rounded-md file:border file:border-[var(--input)] file:bg-white file:px-3 file:py-2 file:text-xs file:font-medium file:text-[var(--foreground)]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-xs font-medium text-[var(--muted-foreground)]">Full name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="John Doe"
          className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94938d] focus:border-[var(--ring)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-xs font-medium text-[var(--muted-foreground)]">Email address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          placeholder="user@warehouse.com"
          className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94938d] focus:border-[var(--ring)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-xs font-medium text-[var(--muted-foreground)]">Phone number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
          className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94938d] focus:border-[var(--ring)]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="address" className="text-xs font-medium text-[var(--muted-foreground)]">Address</label>
        <textarea
          id="address"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
          placeholder="123 Warehouse St, City, Country"
          rows={3}
          className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94938d] focus:border-[var(--ring)]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-xl bg-[var(--role-admin)] px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#e6ddd1] disabled:text-[#8b857a]"
      >
        {loading ? 'Updating...' : 'Update profile'}
      </button>
    </form>
  );
}
