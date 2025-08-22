import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const AdminRegister = () => {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { registerAdmin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !phone || !password) {
            return setError("All fields are required");
        }

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setError("");
            setLoading(true);
            await registerAdmin(email, phone, password);
            navigate("/ad-lgn");
        } catch (err) {
            setError(err.message || "Failed to register");
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
                        Admin Registration
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Create an account to manage the dashboard
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
                            Email address
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone number
                        </label>
                        <input
                            type="tel"
                            placeholder="Enter your phone"
                            className="w-full px-4 py-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            placeholder="Re-enter your password"
                            className="w-full px-4 py-2 border rounded-lg text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-200 disabled:opacity-50"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>

                    {/* Link */}
                    <div className="text-center text-sm text-gray-600">
                        <Link
                            to="/ad-lgn"
                            className="hover:text-green-600 transition"
                        >
                            Already have an account? Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminRegister;
