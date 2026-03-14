import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Mail, Lock, AlertCircle } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth.api";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: ({ data }) => {
      const { user, accessToken, refreshToken } = data.data;
      login(user, accessToken, refreshToken);
      navigate("/", { replace: true });
    },
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(form);
  };

  const errorMessage =
    error?.response?.data?.message || error?.message || null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-4 ">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-900 text-white text-xl font-semibold mb-2">
            ERP
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Sign in to your ERP account
          </p>
        </div>

        {/* Card */}
        <div className=" rounded-xl border shadow-sm md:p-10 p-4">

          {/* Error */}
          {errorMessage && (
            <div className="mb-5 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <AlertCircle size={16}  />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="md:space-y-10 space-y-4">

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="admin@company.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-md border-gray-300
                  focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-md border-gray-300
                  focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-md
              hover:bg-gray-800 transition disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} ERP System
        </p>

      </div>
    </div>
  );
};

export default Login;