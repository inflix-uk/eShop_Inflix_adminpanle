import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Auth";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function SuperadminLogin() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${API_BASE_URL}superadmin/login`, { email, password }, { withCredentials: true });

      if (response?.data?.status !== 201) {
        toast.error(response?.data?.message || "Login failed.");
        return;
      }

      const user = response?.data?.user;
      auth.login(user);
      toast.success("Superadmin login successful.");
      navigate("/admin/superadmin/dashboard", { replace: true });
    } catch (error) {
      toast.error("Unable to login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Superadmin Login</h1>
        <p className="text-sm text-gray-500 text-center mt-2">
          Separate portal access for superadmin users.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="superadmin-email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="superadmin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="superadmin@example.com"
            />
          </div>

          <div>
            <label htmlFor="superadmin-password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="superadmin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white font-semibold py-2 rounded-md hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
