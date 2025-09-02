import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';

// Auth Pages
import AdminRegister from './pages/auth/AdminRegister';
import AdminLogin from './pages/auth/AdminLogin';
import UserLogin from './pages/auth/UserLogin';
import RegionForm from './components/expense/RegionForm';
import ExpenseForm from './components/expense/ExpenseForm';
import ExpensesTable from './components/expensesData/ExpensesTable';
import CreateUser from './components/auth/CreateUser';
import APITest from './components/APITest';
import APIDebug from './components/APIDebug';
import SocialMedia from './socialMedia/SocialMedia';
import PdfUploader from './googleAds/components/PdfUploader';
import InvoiceDetail from './googleAds/components/InvoiceDetail';
import GoogleAdsInvoices from './googleAds/components/GoogleAdsInvoices';
import MetaAdsInvoices from './googleAds/components/MetaAdsInvoices';
import BulkDownloadManager from './googleAds/components/BulkDownloadManager';
import BulkDeleteManager from './googleAds/components/BulkDeleteManager';

import JustdialData from './justdial/JustdialData';
import AddJD from './justdial/component/AddJD';
import UpdateJD from './justdial/component/UpdateJD';

// Root redirect component
const RootRedirect = () => {
  const { currentUser, loading } = useAuth();

  console.log("currentUser: ", currentUser);


  // Show loading while authentication state is being determined
  if (loading) {
    return <LoadingSpinner size="lg" text="Loading..." />;
  }

  // If no user is authenticated, redirect to user login
  if (!currentUser) {
    return <Navigate to="/user-login" />;
  }

  // Redirect based on user role
  if (currentUser.role === 'admin') {
    return <Navigate to="/admin-dashboard" />;
  } else {
    return <Navigate to="/user-dashboard" />;
  }
};

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  // Wait until auth state is initialized
  if (loading) {
    return <LoadingSpinner size="lg" text="Authenticating..." />;
  }

  // If not logged in, go to user login
  if (!currentUser) {
    return <Navigate to="/user-login" />;
  }

  // Check if the user has permission
  if (!allowedRoles.includes(currentUser.role)) {
    // Optionally redirect based on role
    return currentUser.role === 'admin'
      ? <Navigate to="/admin-dashboard" />
      : <Navigate to="/user-dashboard" />;
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

          {/* Action Buttons */}
          <div className="max-w-[300px] grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => navigate("/region-form")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Region
            </button>

            <button
              onClick={() => navigate("/add-user")}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add User
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
    <SocialMedia />
    <JustdialData />
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
            <Route path="/" element={<RootRedirect />} />
            <Route path="/register-admin" element={<AdminRegister />} />
            <Route path="/ad-lgn" element={<AdminLogin />} />
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/region-form" element={<RegionForm />} />
            <Route path="/add-user" element={<CreateUser />} />
            <Route path="/api-test" element={<APITest />} />
            <Route path="/api-debug" element={<APIDebug />} />
            <Route path="/justdial-data" element={<JustdialData />} />

            {/* justdial Ads routes */}
            <Route
              path="/justdial-data"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <JustdialData />
                </ProtectedRoute>
              }
            />

            <Route
              path="/justdial/add"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <AddJD />
                </ProtectedRoute>
              }
            />

            <Route
              path="/justdial/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UpdateJD />
                </ProtectedRoute>
              }
            />

            {/* Google Ads routes */}
            <Route
              path="/upload"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PdfUploader />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <InvoiceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/google-ads"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <GoogleAdsInvoices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meta-ads"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MetaAdsInvoices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bulk-download"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BulkDownloadManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bulk-delete"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BulkDeleteManager />
                </ProtectedRoute>
              }
            />

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
            <Route path="*" element={<RootRedirect />} />
          </Routes>

          {/* Global Toast Container */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;