import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const AdminLogin = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailOrPhone || !password) {
      return setError("All fields are required");
    }

    try {
      setError("");
      setLoading(true);
      await adminLogin(emailOrPhone, password);
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        {/* Logo / Icon */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="mt-4 text-2xl font-bold text-gray-800">
            Admin Login
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email or Phone
            </label>
            <input
              type="text"
              placeholder="Enter your email or phone"
              className="w-full px-4 py-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Links */}
          <div className="text-center text-sm text-gray-600 space-y-1">
            <Link
              to="/register-admin"
              className="block hover:text-indigo-600 transition"
            >
              Don&apos;t have an account? Register
            </Link>
            <Link
              to="/user-login"
              className="block hover:text-indigo-600 transition"
            >
              Login as User
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
