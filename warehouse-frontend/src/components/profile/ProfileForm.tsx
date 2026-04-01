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
      {/* Success Message */}
      {success && (
        <div className="border border-[#2f5f2f] bg-[#0f1f0f] px-4 py-3 text-xs tracking-[0.05em] text-[#7be37b]">
          ✓ PROFILE UPDATED SUCCESSFULLY
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="border border-[#5a1a1a] bg-[#1a0a0a] px-4 py-3 text-xs tracking-[0.05em] text-[#ff6b6b]">
          ⚠ {error.toUpperCase()}
        </div>
      )}

      {/* Profile Picture */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] tracking-[0.2em] text-[#555]">PROFILE PICTURE</label>
        <div className="flex items-center gap-4">
          {previewImage && (
            <img
              src={previewImage}
              alt="Profile preview"
              className="h-20 w-20 border border-[#2a2a2a] object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-xs text-[#555] file:border file:border-[#2a2a2a] file:bg-[#111] file:px-3 file:py-1.5 file:text-[11px] file:tracking-[0.1em] file:text-white"
          />
        </div>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-[11px] tracking-[0.2em] text-[#555]">
          FULL NAME
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="John Doe"
          className="border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#666] focus:border-[#f0c040]"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[11px] tracking-[0.2em] text-[#555]">
          EMAIL ADDRESS
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          placeholder="user@warehouse.com"
          className="border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#666] focus:border-[#f0c040]"
        />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-[11px] tracking-[0.2em] text-[#555]">
          PHONE NUMBER
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
          className="border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#666] focus:border-[#f0c040]"
        />
      </div>

      {/* Address */}
      <div className="flex flex-col gap-2">
        <label htmlFor="address" className="text-[11px] tracking-[0.2em] text-[#555]">
          ADDRESS
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
          placeholder="123 Warehouse St, City, Country"
          rows={3}
          className="border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#666] focus:border-[#f0c040]"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 border-0 px-3.5 py-3 text-xs font-bold tracking-[0.25em] transition-colors disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-[#555] bg-[#f0c040] text-[#0a0a0a] hover:bg-[#e6b93a]"
      >
        {loading ? 'UPDATING...' : 'UPDATE PROFILE →'}
      </button>
    </form>
  );
}
