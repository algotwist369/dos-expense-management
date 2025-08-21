# DOS Daily Expenses - API Documentation

## Overview

This document provides comprehensive documentation for all APIs used in the DOS Daily Expenses application. All APIs are now centralized in the `src/services/apiService.js` file for better maintainability and consistency.

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Authentication APIs](#authentication-apis)
3. [Expense APIs](#expense-apis)
4. [Region APIs](#region-apis)
5. [User APIs](#user-apis)
6. [Analytics APIs](#analytics-apis)
7. [Export/Import APIs](#exportimport-apis)
8. [Utility Functions](#utility-functions)
9. [Usage Examples](#usage-examples)
10. [Error Handling](#error-handling)

## Environment Configuration

The application uses a centralized configuration file located at `src/config/environment.js`:

```javascript
import config from '../config/environment';

// Available configuration options:
config.API_BASE_URL          // Base API URL
config.AUTH_BASE_URL         // Auth-specific API URL
config.ENABLE_ANALYTICS      // Analytics feature flag
config.ENABLE_GOOGLE_ADS     // Google Ads feature flag
config.DEFAULT_PAGE_SIZE     // Default pagination size
config.STORAGE_KEYS          // Local storage key constants
```

## Authentication APIs

### Import
```javascript
import { authAPI } from '../services/apiService';
```

### Available Methods

#### 1. Admin Registration
```javascript
const result = await authAPI.registerAdmin(email, phone, password);
```

#### 2. Admin Login
```javascript
const result = await authAPI.adminLogin(emailOrPhone, password);
```

#### 3. User Login
```javascript
const result = await authAPI.userLogin(name, pin);
```

#### 4. Create User (Admin Only)
```javascript
const result = await authAPI.createUser(name, pin);
```

#### 5. Verify Token
```javascript
const result = await authAPI.verifyToken();
```

## Expense APIs

### Import
```javascript
import { expenseAPI } from '../services/apiService';
```

### Available Methods

#### 1. Create Expense
```javascript
const expenseData = {
  user: userId,
  paidTo: "Vendor Name",
  amount: 1000,
  reason: "Marketing expenses",
  date: "2024-01-15",
  region: ["Region1", "Region2"],
  area: ["Area1", "Area2"],
  centre: ["Centre1", "Centre2"]
};

const result = await expenseAPI.createExpense(expenseData);
```

#### 2. Get All Expenses (Admin Only)
```javascript
const params = {
  page: 1,
  limit: 10,
  sortBy: 'date',
  sortOrder: 'desc'
};

const result = await expenseAPI.getAllExpenses(params);
```

#### 3. Get Expenses by User
```javascript
const result = await expenseAPI.getExpensesByUser(userId, {
  page: 1,
  limit: 10
});
```

#### 4. Get Expense by ID
```javascript
const result = await expenseAPI.getExpenseById(expenseId);
```

#### 5. Update Expense
```javascript
const updateData = {
  amount: 1500,
  reason: "Updated reason"
};

const result = await expenseAPI.updateExpense(expenseId, updateData);
```

#### 6. Delete Expense
```javascript
const result = await expenseAPI.deleteExpense(expenseId);
```

#### 7. Get Expense Statistics
```javascript
const params = {
  startDate: "2024-01-01",
  endDate: "2024-01-31",
  region: "Region1"
};

const result = await expenseAPI.getExpenseStats(params);
```

#### 8. Get Filtered Expenses
```javascript
const filters = {
  search: "marketing",
  region: "Region1",
  dateRange: "thisMonth",
  paidTo: "Vendor"
};

const result = await expenseAPI.getFilteredExpenses(filters);
```

#### 9. Get My Expenses (Paginated)
```javascript
const result = await expenseAPI.getMyExpenses({
  page: 1,
  limit: 10,
  dateFilter: "today"
});
```

## Region APIs

### Import
```javascript
import { regionAPI } from '../services/apiService';
```

### Available Methods

#### 1. Create Region
```javascript
const regionData = {
  name: "Region Name",
  areas: [
    {
      name: "Area 1",
      centres: [{ name: "Centre 1" }, { name: "Centre 2" }]
    },
    {
      name: "Area 2",
      centres: [{ name: "Centre 3" }]
    }
  ]
};

const result = await regionAPI.createRegion(regionData);
```

#### 2. Get All Regions
```javascript
const result = await regionAPI.getAllRegions();
```

#### 3. Get Region by ID
```javascript
const result = await regionAPI.getRegionById(regionId);
```

#### 4. Update Region
```javascript
const updateData = {
  name: "Updated Region Name",
  areas: [...]
};

const result = await regionAPI.updateRegion(regionId, updateData);
```

#### 5. Delete Region
```javascript
const result = await regionAPI.deleteRegion(regionId);
```

## User APIs

### Import
```javascript
import { userAPI } from '../services/apiService';
```

### Available Methods

#### 1. Get User Profile
```javascript
const result = await userAPI.getUserProfile(userId);
```

#### 2. Update User Profile
```javascript
const updateData = {
  name: "Updated Name",
  pin: "1234"
};

const result = await userAPI.updateUserProfile(userId, updateData);
```

#### 3. Get All Users (Admin Only)
```javascript
const result = await userAPI.getAllUsers();
```

#### 4. Delete User (Admin Only)
```javascript
const result = await userAPI.deleteUser(userId);
```

## Analytics APIs

### Import
```javascript
import { analyticsAPI } from '../services/apiService';
```

### Available Methods

#### 1. Get Expense Analytics
```javascript
const params = {
  startDate: "2024-01-01",
  endDate: "2024-01-31",
  groupBy: "region"
};

const result = await analyticsAPI.getExpenseAnalytics(params);
```

#### 2. Get Region Analytics
```javascript
const result = await analyticsAPI.getRegionAnalytics({
  period: "monthly"
});
```

#### 3. Get User Analytics
```javascript
const result = await analyticsAPI.getUserAnalytics({
  period: "weekly"
});
```

#### 4. Get Dashboard Stats
```javascript
const result = await analyticsAPI.getDashboardStats({
  dateRange: "thisMonth"
});
```

## Export/Import APIs

### Import
```javascript
import { exportAPI } from '../services/apiService';
```

### Available Methods

#### 1. Export Expenses to CSV
```javascript
const filters = {
  startDate: "2024-01-01",
  endDate: "2024-01-31",
  region: "Region1"
};

const blob = await exportAPI.exportExpensesToCSV(filters);
// Use file-saver to download
import { saveAs } from 'file-saver';
saveAs(blob, 'expenses.csv');
```

#### 2. Export Expenses to Excel
```javascript
const blob = await exportAPI.exportExpensesToExcel(filters);
saveAs(blob, 'expenses.xlsx');
```

#### 3. Import Expenses from CSV
```javascript
const file = event.target.files[0];
const result = await exportAPI.importExpensesFromCSV(file);
```

## Utility Functions

### Import
```javascript
import { apiUtils } from '../services/apiService';
```

### Available Methods

#### 1. Handle API Errors
```javascript
try {
  const result = await expenseAPI.createExpense(data);
} catch (error) {
  const { error: hasError, message } = apiUtils.handleError(error);
  if (hasError) {
    console.error(message);
  }
}
```

#### 2. Check Authentication
```javascript
if (apiUtils.isAuthenticated()) {
  // User is logged in
}
```

#### 3. Get Current User
```javascript
const user = apiUtils.getCurrentUser();
console.log(user.token, user.userId, user.role, user.name);
```

#### 4. Clear Session
```javascript
apiUtils.clearSession();
```

#### 5. Set Session
```javascript
apiUtils.setSession({
  token: "jwt_token",
  _id: "user_id",
  role: "admin",
  name: "User Name"
});
```

## Usage Examples

### Complete Example: Creating an Expense
```javascript
import { expenseAPI, apiUtils } from '../services/apiService';
import { toast } from 'react-toastify';

const createExpense = async (expenseData) => {
  try {
    // Check if user is authenticated
    if (!apiUtils.isAuthenticated()) {
      toast.error('Please login to create an expense');
      return;
    }

    // Create the expense
    const result = await expenseAPI.createExpense(expenseData);
    
    toast.success('Expense created successfully!');
    return result;
    
  } catch (error) {
    const { message } = apiUtils.handleError(error);
    toast.error(message);
    throw error;
  }
};
```

### Complete Example: Fetching Expenses with Filters
```javascript
import { expenseAPI } from '../services/apiService';

const fetchExpenses = async (filters = {}) => {
  try {
    const expenses = await expenseAPI.getFilteredExpenses({
      search: filters.search || '',
      region: filters.region || '',
      dateRange: filters.dateRange || 'all',
      paidTo: filters.paidTo || '',
      page: filters.page || 1,
      limit: filters.limit || 10
    });
    
    return expenses;
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    throw error;
  }
};
```

### Complete Example: Authentication Flow
```javascript
import { authAPI, apiUtils } from '../services/apiService';

const loginUser = async (name, pin) => {
  try {
    const result = await authAPI.userLogin(name, pin);
    
    // Set session data
    apiUtils.setSession(result);
    
    return result;
  } catch (error) {
    const { message } = apiUtils.handleError(error);
    throw new Error(message);
  }
};

const logoutUser = () => {
  apiUtils.clearSession();
  // Redirect to login page
  window.location.href = '/login';
};
```

## Error Handling

The API service includes built-in error handling:

1. **Automatic Token Management**: Invalid tokens are automatically cleared and user is redirected to login
2. **Consistent Error Format**: All errors are formatted consistently
3. **Request/Response Interceptors**: Automatic token injection and error handling

### Error Response Format
```javascript
{
  error: true,
  message: "Error description"
}
```

### Common Error Scenarios
- **401 Unauthorized**: Token is invalid or expired
- **403 Forbidden**: User doesn't have permission
- **404 Not Found**: Resource doesn't exist
- **422 Validation Error**: Invalid data provided
- **500 Server Error**: Internal server error

## Migration Guide

To migrate from the old scattered API calls to the new centralized service:

### Before (Old Way)
```javascript
// In component
const token = localStorage.getItem("token");
const response = await axios.get("https://dos-expence.onrender.com/api/expense", {
  headers: { Authorization: `Bearer ${token}` },
});
```

### After (New Way)
```javascript
// In component
import { expenseAPI } from '../services/apiService';
const response = await expenseAPI.getAllExpenses();
```

### Benefits of Centralized API Service

1. **Consistency**: All API calls use the same configuration
2. **Maintainability**: Easy to update base URL or add new features
3. **Error Handling**: Centralized error handling and token management
4. **Type Safety**: Better IntelliSense and code completion
5. **Testing**: Easier to mock and test API calls
6. **Documentation**: All APIs are documented in one place

## Best Practices

1. **Always use the API service**: Don't make direct axios calls
2. **Handle errors properly**: Use try-catch blocks and apiUtils.handleError()
3. **Check authentication**: Use apiUtils.isAuthenticated() before making calls
4. **Use proper loading states**: Show loading indicators during API calls
5. **Validate data**: Validate data before sending to API
6. **Use pagination**: For large datasets, use pagination parameters
7. **Cache when appropriate**: Cache frequently accessed data
8. **Log errors**: Log errors for debugging purposes

## Support

For questions or issues with the API service, please refer to:
- The API service file: `src/services/apiService.js`
- Environment configuration: `src/config/environment.js`
- This documentation file
