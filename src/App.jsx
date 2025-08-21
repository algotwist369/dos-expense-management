import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import StatsCard from './components/StatsCard';
import Breadcrumb from './components/Breadcrumb';
import Footer from './components/Footer';
import { FaUsers, FaMapMarkedAlt } from 'react-icons/fa';

// Auth Pages
import AdminRegister from './pages/auth/AdminRegister';
import AdminLogin from './pages/auth/AdminLogin';
import UserLogin from './pages/auth/UserLogin';
import RegionForm from './components/expense/RegionForm';
import ExpenseForm from './components/expense/ExpenseForm';
import ExpensesTable from './components/ExpensesTable';
import CreateUser from './components/auth/CreateUser';
import APITest from './components/APITest';
import APIDebug from './components/APIDebug';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingSpinner size="lg" text="Authenticating..." />;

  if (!currentUser) {
    return <Navigate to="/admin-login" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Placeholder dashboard components
const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <div className="p-6">
        <div className="max-w-[99rem] mx-auto">
          <div className="mb-6">
            <Breadcrumb />
          </div>
    
          {/* Action Buttons */}
          <div className="hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => navigate("/region-form")}
              className="bg-blue-600 text-white px-8 py-6 rounded-2xl shadow-xl flex items-center justify-center space-x-3 border border-blue-500"
            >
              {/* Icon */}
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FaMapMarkedAlt className="w-5 h-5 text-white" />
              </div>
              
              {/* Text */}
              <div className="text-left">
                <span className="text-lg font-bold block">Add Region</span>
                <span className="text-sm text-blue-100 opacity-80">Manage locations</span>
              </div>
              
              {/* Arrow */}
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => navigate("/add-user")}
              className="bg-green-600 text-white px-8 py-6 rounded-2xl shadow-xl flex items-center justify-center space-x-3 border border-green-500"
            >
              {/* Icon */}
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FaUsers className="w-5 h-5 text-white" />
              </div>
              
              {/* Text */}
              <div className="text-left">
                <span className="text-lg font-bold block">Add User</span>
                <span className="text-sm text-green-100 opacity-80">Create account</span>
              </div>
              
              {/* Arrow */}
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          {/* Expenses Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
            <ExpensesTable />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};


const UserDashboard = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <Header />
    <div className="p-4">
      <ExpenseForm />
    </div>
    <Footer />
  </div>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/user-login" />} />
            <Route path="/register-admin" element={<AdminRegister />} />
            <Route path="/ad-lgn" element={<AdminLogin />} />
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/region-form" element={<RegionForm />} />
            <Route path="/add-user" element={<CreateUser />} />
            <Route path="/api-test" element={<APITest />} />
            <Route path="/api-debug" element={<APIDebug />} />

            {/* Protected routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;