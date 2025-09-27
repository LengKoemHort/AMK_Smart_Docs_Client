"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setTokens } from "@/lib/token-store";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null); // Removed setError as it's unused

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/login/`, {
        username_or_email: usernameOrEmail,
        password: password,
      });

      const { access_token, refresh_token, expires } = res.data.body;
      setTokens({ access: access_token, refresh: refresh_token, expires });

      router.push("/c");
    } catch (error: unknown) {
      alert(`Login failed, Please Try Again!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 w-full">
      <div className="card w-full max-w-md shadow-2xl bg-base-100 p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        {error && <p className="text-red-600 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-2">
          <InputField
            label="Username"
            type="text"
            placeholder="Enter username or email"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
          />

          <InputField
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn bg-primary w-full rounded-md text-white"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const InputField = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  required = false,
}: InputFieldProps) => (
  <div className="form-control grid grid-cols-4 items-center gap-2">
    <label className="label col-span-1">
      <span className="label-text">{label}</span>
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className="input input-bordered col-span-3"
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
);
