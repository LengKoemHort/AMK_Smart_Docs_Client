const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const EXPIRES_KEY = "access_token_expiry";

export const setTokens = ({
  access,
  refresh,
  expires,
}: {
  access: string;
  refresh: string;
  expires: string;
}) => {
  sessionStorage.setItem(ACCESS_KEY, access);
  sessionStorage.setItem(REFRESH_KEY, refresh);
  sessionStorage.setItem(EXPIRES_KEY, String(new Date(expires).getTime()));
};

export const getAccessToken = (): string | null =>
  sessionStorage.getItem(ACCESS_KEY);

export const getRefreshToken = (): string | null =>
  sessionStorage.getItem(REFRESH_KEY);

export const getAccessTokenExpiry = (): number | null => {
  const exp = sessionStorage.getItem(EXPIRES_KEY);
  return exp ? Number(exp) : null;
};

export const isTokenExpired = (): boolean => {
  const expiry = getAccessTokenExpiry();
  const now = Date.now();
  const gracePeriod = 30 * 1000;
  return !expiry || now + gracePeriod >= expiry;
};

export const clearTokens = () => {
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(EXPIRES_KEY);
  sessionStorage.clear();
};
