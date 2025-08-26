import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaCheckCircle, FaExclamationCircle, FaSpinner, FaArrowLeft } from "react-icons/fa";

const CreateUser = () => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { createUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !pin || !confirmPin) {
      return setError("All fields are required");
    }

    if (pin !== confirmPin) {
      return setError("PINs do not match");
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);
      await createUser(name, pin);
      setSuccess("User created successfully");
      setName("");
      setPin("");
      setConfirmPin("");
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Simple go back in browser history
    window.history.back();
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-8 my-6">
      {/* Back button and heading */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
          aria-label="Go Back"
        >
          <FaArrowLeft />
          Back
        </button>
        <h2 className="text-3xl font-extrabold text-gray-900">Create New User</h2>
        <div className="w-12" /> {/* empty spacer for balanced layout */}
      </div>

      {error && (
        <div
          className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
          role="alert"
        >
          <FaExclamationCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          className="flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
          role="alert"
        >
          <FaCheckCircle className="mr-2" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <label
          htmlFor="name"
          className="block text-gray-700 font-semibold mb-2"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="User Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full mb-5 px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />

        <label
          htmlFor="pin"
          className="block text-gray-700 font-semibold mb-2"
        >
          PIN
        </label>
        <input
          id="pin"
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required
          className="w-full mb-5 px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />

        <label
          htmlFor="confirm-pin"
          className="block text-gray-700 font-semibold mb-2"
        >
          Confirm PIN
        </label>
        <input
          id="confirm-pin"
          type="password"
          placeholder="Confirm PIN"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          required
          className="w-full mb-8 px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition focus:ring-4 focus:ring-indigo-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading && <FaSpinner className="animate-spin" />}
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
