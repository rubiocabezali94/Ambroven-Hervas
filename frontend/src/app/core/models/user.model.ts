import { UserRole } from './enums';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firebase_uid: string | null;
  avatar_url: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}
