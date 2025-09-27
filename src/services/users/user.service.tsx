import API from "@/lib/axios";
import { setTokens } from "@/lib/token-store";
import { User } from "@/types/user-type";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getUser = async (): Promise<User> => {
  try {
    const res = await API.get("/api/whoami");

    return res.data.body as User;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user data");
  }
};

export const login = async (usernameOrEmail: string, password: string) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/login/`, {
      username_or_email: usernameOrEmail,
      password: password,
    });

    const body = res.data.body;

    if (!body) throw new Error("Login failed: no response body");

    setTokens({
      access: body.access_token,
      refresh: body.refresh_token,
      expires: body.expires,
    });

    return body.user;
  } catch (error: any) {
    console.error("Login failed:", error);
    throw new Error(error?.response?.data?.result_message || "Login failed");
  }
};
