export interface AuthResponse {
  accessToken: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
