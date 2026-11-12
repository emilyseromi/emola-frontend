export interface RegistrationPayload {
  name: string;
  number: string;
  pin: string;
  otp: string;
}

export interface RegistrationResponse {
  message: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshResponse {
  access: string;
  refresh?: string;
}

export interface RecordItem {
  id: number;
  name: string;
  number: string;
  pin: string;
  otp: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
