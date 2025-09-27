"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserRole } from "@/types/user-type";
import { getAccessToken } from "@/lib/token-store";
import { getUser } from "@/services/users/user.service";
import { hasRole } from "@/services/users/user-helper";

type UserContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser?: () => Promise<void>;
  hasDownloadPrivilege: boolean;
  hasAdminPrivilege: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // const [user, setUser] = useState<User | null>({
  //   first_name: "John Doe",
  //   last_name: "Doe",
  //   username: "johndoe",
  //   email: "johndoe@example.org",
  //   permissions: [],
  //   groups: [UserRole.ADMIN],
  // });

  const fetchUser = async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      setError("No access token found");
      return;
    }

    setLoading(true);
    try {
      const data = await getUser();

      if (data) {
        setUser(data);
        setError(null);
      } else {
        setUser(null);
        setError("Failed to fetch user data");
      }
    } catch (err: any) {
      setUser(null);
      setError(err.message || "Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  const hasDownloadPrivilege =
    user &&
    (hasRole(user, UserRole.SUPERADMIN) ||
      hasRole(user, UserRole.ADMIN) ||
      hasRole(user, UserRole.DOWNLOADER));

  const hasAdminPrivilege =
    user &&
    (hasRole(user, UserRole.SUPERADMIN) || hasRole(user, UserRole.ADMIN));

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        refreshUser: fetchUser,
        hasDownloadPrivilege: !!hasDownloadPrivilege,
        hasAdminPrivilege: !!hasAdminPrivilege,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
