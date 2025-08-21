import axios from 'axios';
import config from '../config/environment';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      window.location.href = '/admin-login';
    }
    return Promise.reject(error);
  }
);

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================== AUTHENTICATION APIs ====================

export const authAPI = {
  // Admin Registration
  registerAdmin: async (email, phone, password) => {
    const response = await apiClient.post('/auth/admin/register', {
      email,
      phone,
      password
    });
    return response.data;
  },

  // Admin Login
  adminLogin: async (emailOrPhone, password) => {
    const response = await apiClient.post('/auth/admin/login', {
      emailOrPhone,
      password
    });
    return response.data;
  },

  // User Login
  userLogin: async (name, pin) => {
    const response = await apiClient.post('/auth/user/login', {
      name,
      pin
    });
    return response.data;
  },

  // Create User (by Admin)
  createUser: async (name, pin) => {
    const response = await apiClient.post('/auth/admin/create-user', {
      name,
      pin
    });
    return response.data;
  },

  // Verify Token
  verifyToken: async () => {
    const response = await apiClient.get('/auth/verify', {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};

// ==================== EXPENSE APIs ====================

export const expenseAPI = {
  // Create new expense
  createExpense: async (expenseData) => {
    const response = await apiClient.post('/expense', expenseData);
    return response.data;
  },

  // Get all expenses (admin only)
  getAllExpenses: async (params = {}) => {
    const response = await apiClient.get('/expense', { params });
    return response.data;
  },

  // Get expenses by user
  getExpensesByUser: async (userId, params = {}) => {
    const response = await apiClient.get(`/expense/${userId}`, { params });
    return response.data;
  },

  // Get expense by ID
  getExpenseById: async (expenseId) => {
    const response = await apiClient.get(`/expense/${expenseId}`);
    return response.data;
  },

  // Update expense
  updateExpense: async (expenseId, updateData) => {
    const response = await apiClient.put(`/expense/${expenseId}`, updateData);
    return response.data;
  },

  // Delete expense
  deleteExpense: async (expenseId) => {
    const response = await apiClient.delete(`/expense/${expenseId}`);
    return response.data;
  },

  // Get expense statistics
  getExpenseStats: async (params = {}) => {
    const response = await apiClient.get('/expense/stats', { params });
    return response.data;
  },

  // Get filtered expenses
  getFilteredExpenses: async (filters = {}) => {
    const response = await apiClient.get('/expense/filtered', { params: filters });
    return response.data;
  },

  // Get user's expenses (paginated)
  getMyExpenses: async (params = {}) => {
    const response = await apiClient.get('/expense/my', { params });
    return response.data;
  }
};

// ==================== REGION APIs ====================

export const regionAPI = {
  // Create new region
  createRegion: async (regionData) => {
    const response = await apiClient.post('/region', regionData);
    return response.data;
  },

  // Get all regions
  getAllRegions: async () => {
    const response = await apiClient.get('/region');
    return response.data;
  },

  // Get region by ID
  getRegionById: async (regionId) => {
    const response = await apiClient.get(`/region/${regionId}`);
    return response.data;
  },

  // Update region
  updateRegion: async (regionId, updateData) => {
    const response = await apiClient.put(`/region/${regionId}`, updateData);
    return response.data;
  },

  // Delete region
  deleteRegion: async (regionId) => {
    const response = await apiClient.delete(`/region/${regionId}`);
    return response.data;
  }
};

// ==================== USER APIs ====================

export const userAPI = {
  // Get user profile
  getUserProfile: async (userId) => {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (userId, updateData) => {
    const response = await apiClient.put(`/user/${userId}`, updateData);
    return response.data;
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    const response = await apiClient.get('/user');
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/user/${userId}`);
    return response.data;
  }
};

// ==================== ANALYTICS APIs ====================

export const analyticsAPI = {
  // Get expense analytics
  getExpenseAnalytics: async (params = {}) => {
    const response = await apiClient.get('/analytics/expenses', { params });
    return response.data;
  },

  // Get region analytics
  getRegionAnalytics: async (params = {}) => {
    const response = await apiClient.get('/analytics/regions', { params });
    return response.data;
  },

  // Get user analytics
  getUserAnalytics: async (params = {}) => {
    const response = await apiClient.get('/analytics/users', { params });
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async (params = {}) => {
    const response = await apiClient.get('/analytics/dashboard', { params });
    return response.data;
  }
};

// ==================== EXPORT/IMPORT APIs ====================

export const exportAPI = {
  // Export expenses to CSV
  exportExpensesToCSV: async (filters = {}) => {
    const response = await apiClient.get('/export/expenses/csv', { 
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Export expenses to Excel
  exportExpensesToExcel: async (filters = {}) => {
    const response = await apiClient.get('/export/expenses/excel', { 
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  // Import expenses from CSV
  importExpensesFromCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/import/expenses/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'An error occurred';
    return { error: true, message };
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user info
  getCurrentUser: () => {
    return {
      token: localStorage.getItem('token'),
      userId: localStorage.getItem('userId'),
      role: localStorage.getItem('role'),
      name: localStorage.getItem('name')
    };
  },

  // Clear user session
  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
  },

  // Set user session
  setSession: (userData) => {
    if (userData.token) localStorage.setItem('token', userData.token);
    if (userData._id) localStorage.setItem('userId', userData._id);
    if (userData.role) localStorage.setItem('role', userData.role);
    if (userData.name) localStorage.setItem('name', userData.name);
  }
};

// Export default API client for direct use if needed
export default apiClient;
