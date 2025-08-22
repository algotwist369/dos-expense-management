import React, { useState, useEffect } from 'react';
import { 
  authAPI, 
  expenseAPI, 
  regionAPI, 
  userAPI, 
  analyticsAPI, 
  exportAPI, 
  apiUtils 
} from '../services/apiService';
import { toast } from 'react-toastify';

const ExampleUsage = () => {
  const [expenses, setExpenses] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Example 1: Fetch expenses using the centralized API
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!apiUtils.isAuthenticated()) {
        toast.error('Please login first');
        return;
      }

      // Get current user info
      const currentUser = apiUtils.getCurrentUser();
      console.log('Current user:', currentUser);

      // Fetch expenses with filters
      const result = await expenseAPI.getFilteredExpenses({
        search: '',
        region: '',
        dateRange: 'thisMonth',
        page: 1,
        limit: 10
      });

      setExpenses(Array.isArray(result) ? result : result.data || []);
      toast.success('Expenses loaded successfully!');
      
    } catch (error) {
      const { message } = apiUtils.handleError(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Create a new expense
  const createExpense = async (expenseData) => {
    try {
      setLoading(true);
      
      const result = await expenseAPI.createExpense({
        user: apiUtils.getCurrentUser().userId,
        paidTo: expenseData.paidTo,
        amount: Number(expenseData.amount),
        reason: expenseData.reason,
        date: expenseData.date,
        region: expenseData.region,
        area: expenseData.area,
        centre: expenseData.centre
      });

      toast.success('Expense created successfully!');
      fetchExpenses(); // Refresh the list
      return result;
      
    } catch (error) {
      const { message } = apiUtils.handleError(error);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Fetch regions
  const fetchRegions = async () => {
    try {
      const result = await regionAPI.getAllRegions();
      setRegions(Array.isArray(result) ? result : []);
    } catch (error) {
      const { message } = apiUtils.handleError(error);
      toast.error(message);
    }
  };

  // Example 4: Get analytics
  const fetchAnalytics = async () => {
    try {
      const result = await analyticsAPI.getDashboardStats({
        dateRange: 'thisMonth'
      });
      setStats(result);
    } catch (error) {
      const { message } = apiUtils.handleError(error);
      toast.error(message);
    }
  };

  // Example 5: Export expenses
  const exportExpenses = async () => {
    try {
      const filters = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const blob = await exportAPI.exportExpensesToCSV(filters);
      
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expenses.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Export completed!');
    } catch (error) {
      const { message } = apiUtils.handleError(error);
      toast.error(message);
    }
  };

  // Example 6: User authentication
  const loginExample = async (credentials) => {
    try {
      setLoading(true);
      
      // Admin login example
      const adminResult = await authAPI.adminLogin(
        credentials.emailOrPhone, 
        credentials.password
      );
      
      // Set session data
      apiUtils.setSession(adminResult);
      
      toast.success('Login successful!');
      return adminResult;
      
    } catch (error) {
      const { message } = apiUtils.handleError(error);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Example 7: User login
  const userLoginExample = async (credentials) => {
    try {
      setLoading(true);
      
      const result = await authAPI.userLogin(
        credentials.name, 
        credentials.pin
      );
      
      apiUtils.setSession(result);
      toast.success('Login successful!');
      return result;
      
    } catch (error) {
      const { message } = apiUtils.handleError(error);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Example 8: Logout
  const logoutExample = () => {
    apiUtils.clearSession();
    toast.info('Logged out successfully');
    // Redirect to login page
    window.location.href = '/user-login';
  };

  // Load data on component mount
  useEffect(() => {
    fetchExpenses();
    fetchRegions();
    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Service Usage Examples</h1>
      
      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
        <p>Is Authenticated: {apiUtils.isAuthenticated() ? 'Yes' : 'No'}</p>
        {apiUtils.isAuthenticated() && (
          <div className="mt-2">
            <p>User: {apiUtils.getCurrentUser().name}</p>
            <p>Role: {apiUtils.getCurrentUser().role}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={fetchExpenses}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch Expenses'}
        </button>

        <button
          onClick={fetchRegions}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch Regions'}
        </button>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch Analytics'}
        </button>

        <button
          onClick={exportExpenses}
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Export Expenses'}
        </button>

        <button
          onClick={logoutExample}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Dashboard Statistics</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      )}

      {/* Expenses List */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Expenses ({expenses.length})</h2>
        <div className="bg-white border rounded-lg overflow-hidden">
          {expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense, index) => (
                    <tr key={expense._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.paidTo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{expense.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No expenses found
            </div>
          )}
        </div>
      </div>

      {/* Regions List */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Regions ({regions.length})</h2>
        <div className="bg-white border rounded-lg p-4">
          {regions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regions.map((region, index) => (
                <div key={region._id || index} className="p-3 border rounded">
                  <h3 className="font-semibold">{region.name}</h3>
                  <p className="text-sm text-gray-600">
                    Areas: {region.areas?.length || 0}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No regions found
            </div>
          )}
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
        <h3 className="text-white mb-2">Code Examples:</h3>
        <pre>
{`// Import the API service
import { 
  authAPI, 
  expenseAPI, 
  regionAPI, 
  apiUtils 
} from '../services/apiService';

// Check authentication
if (apiUtils.isAuthenticated()) {
  // User is logged in
}

// Get current user
const user = apiUtils.getCurrentUser();

// Fetch expenses
const expenses = await expenseAPI.getFilteredExpenses({
  dateRange: 'thisMonth',
  page: 1,
  limit: 10
});

// Create expense
const newExpense = await expenseAPI.createExpense({
  user: user.userId,
  paidTo: "Vendor",
  amount: 1000,
  reason: "Marketing",
  date: "2024-01-15",
  region: ["Region1"],
  area: ["Area1"],
  centre: ["Centre1"]
});

// Handle errors
try {
  const result = await expenseAPI.createExpense(data);
} catch (error) {
  const { message } = apiUtils.handleError(error);
  console.error(message);
}`}
        </pre>
      </div>
    </div>
  );
};

export default ExampleUsage;
