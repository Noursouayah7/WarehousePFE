const getApiUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return url.startsWith('http') ? url : `http://${url}`;
};

const API_URL = getApiUrl();

export interface UserProfile {
  id: number;
  email: string;
  name?: string;
  address?: string;
  phone?: string;
  cin: string;
  profilePicture?: string;
  roles: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
  profilePicture?: string;
  password?: string;
}

export class ProfileService {
  static async getProfile(token: string): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  }

  static async updateProfile(token: string, data: UpdateProfileDto): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return response.json();
  }
}
