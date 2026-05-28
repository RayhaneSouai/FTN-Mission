export interface AdminUserCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  birthDate?: string | null;
  gender?: string | null;
  niveau?: string | null;
  discipline?: string | null;
  anciennete?: number | null;
  clubId?: number | null; // Added clubId field for associating user with a club
}

export interface AdminUserCreateResponse {
  user: Record<string, unknown>;
  welcomeEmailSent: boolean;
  message: string;
}
