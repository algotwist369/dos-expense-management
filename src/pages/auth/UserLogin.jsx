import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const UserLogin = () => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { userLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !pin) {
      return setError("All fields are required");
    }

    try {
      setError("");
      setLoading(true);
      await userLogin(name, pin);
      navigate("/user-dashboard");
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        {/* Icon + Heading */}
        <div className="flex flex-col items-center mb-6">
          <h2 className="mt-4 text-2xl font-bold text-gray-800">
            User Login
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Access your personal dashboard
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
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN
            </label>
            <input
              type="password"
              placeholder="Enter your PIN"
              className="w-full px-4 py-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
