export interface User {
  id?: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  permissions: string[];
  groups: UserRole[];
}

export const UserRole = {
  SUPERADMIN: process.env.NEXT_PUBLIC_API_SUPERADMIN_GROUP_NAME || "SuperAdmin",
  ADMIN: process.env.NEXT_PUBLIC_API_ADMIN_GROUP_NAME || "Admin",
  DOWNLOADER: process.env.NEXT_PUBLIC_API_USERDOWNLOAD_GROUP_NAME || "UserDownload",
  USER: process.env.NEXT_PUBLIC_API_USER_GROUP_NAME || "User",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
