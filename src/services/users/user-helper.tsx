import { User, UserRole } from "@/types/user-type";

export const groupToRoleMap: Record<string, UserRole> = {
  AdminGroup: UserRole.ADMIN,
  UsersDownload: UserRole.DOWNLOADER,
  Users: UserRole.USER,
};

export function getUserRole(user: User): UserRole {
  for (const group of user.groups) {
    if (groupToRoleMap[group]) {
      return groupToRoleMap[group];
    }
  }
  return UserRole.USER;
}

export const hasRole = (user: User | null, role: UserRole): boolean => {
  if (!user || !Array.isArray(user.groups)) return false;

  return user.groups.includes(role);
};
