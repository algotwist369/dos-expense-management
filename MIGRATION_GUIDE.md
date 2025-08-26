# Migration Guide: Centralizing API Calls

This guide will help you migrate from scattered API calls to the new centralized API service in the DOS Daily Expenses application.

## Overview

Previously, API calls were scattered across different components with hardcoded URLs and inconsistent error handling. Now, all APIs are centralized in `src/services/apiService.js` for better maintainability and consistency.

## Before vs After Examples

### 1. Authentication Context (`src/context/AuthContext.jsx`)

#### Before (Old Way)
```javascript
import axios from 'axios';

const base_url = "https://dos-expence.onrender.com/api/auth";

// Admin Login
const adminLogin = async (emailOrPhone, password) => {
    try {
        setError('');
        const { data } = await axios.post(`${base_url}/admin/login`, {
            emailOrPhone, password
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userId', data._id);
        localStorage.setItem('name', data.name);

        setCurrentUser({
            token: data.token,
            role: data.role,
            name: data.name,
            userId: data._id
        });

        return data;
    } catch (err) {
        setError(err.response?.data?.error || 'Login failed');
        throw err;
    }
};
```

#### After (New Way)
```javascript
import { authAPI, apiUtils } from '../services/apiService';

// Admin Login
const adminLogin = async (emailOrPhone, password) => {
    try {
        setError('');
        const data = await authAPI.adminLogin(emailOrPhone, password);
        
        // Set session data using utility function
        apiUtils.setSession(data);
        
        setCurrentUser({
            token: data.token,
            role: data.role,
            name: data.name,
            userId: data._id
        });

        return data;
    } catch (err) {
        const { message } = apiUtils.handleError(err);
        setError(message);
        throw err;
    }
};
```

### 2. Expense Form (`src/components/expense/ExpenseForm.jsx`)

#### Before (Old Way)
```javascript
import axios from "axios";

// Fetch regions
useEffect(() => {
    axios
        .get("https://dos-expence.onrender.com/api/region")
        .then((res) => {
            setRegions(res.data);
        })
        .catch((err) => {
            console.error("Failed to fetch regions", err);
            toast.error("Failed to load regions");
        });
}, []);

// Submit expense
const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    try {
        await axios.post(
            "https://dos-expence.onrender.com/api/expense",
            {
                user: userId,
                paidTo: form.paidTo,
                amount: Number(form.amount),
                reason: form.reason,
                date: form.date,
                region: form.region,
                area: form.area,
                centre: form.centre,
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Expense added successfully!");
    } catch (err) {
        toast.error("Failed to add expense: " + (err.response?.data?.message || "Please try again"));
    }
};
```

#### After (New Way)
```javascript
import { regionAPI, expenseAPI, apiUtils } from '../../services/apiService';

// Fetch regions
useEffect(() => {
    const fetchRegions = async () => {
        try {
            const data = await regionAPI.getAllRegions();
            setRegions(data);
        } catch (err) {
            const { message } = apiUtils.handleError(err);
            toast.error(message);
        }
    };
    
    fetchRegions();
}, []);

// Submit expense
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication
    if (!apiUtils.isAuthenticated()) {
        toast.error("You must be logged in to add an expense.");
        return;
    }
    
    try {
        const expenseData = {
            user: apiUtils.getCurrentUser().userId,
            paidTo: form.paidTo,
            amount: Number(form.amount),
            reason: form.reason,
            date: form.date,
            region: form.region,
            area: form.area,
            centre: form.centre,
        };
        
        await expenseAPI.createExpense(expenseData);
        toast.success("Expense added successfully!");
    } catch (err) {
        const { message } = apiUtils.handleError(err);
        toast.error(message);
    }
};
```

### 3. Expenses Table (`src/components/ExpensesTable.jsx`)

#### Before (Old Way)
```javascript
import axios from "axios";

// Fetch data
useEffect(() => {
    setLoading(true);
    axios
        .get("https://dos-expence.onrender.com/api/expense", {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
            const data = Array.isArray(res.data) ? res.data : res.data.data || [];
            setExpenses(data);
            setFiltered(data);
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error fetching expenses:", err);
            setLoading(false);
        });
}, [token]);
```

#### After (New Way)
```javascript
import { expenseAPI, apiUtils } from '../services/apiService';

// Fetch data
useEffect(() => {
    const fetchExpenses = async () => {
        try {
            setLoading(true);
            
            if (!apiUtils.isAuthenticated()) {
                console.error("User not authenticated");
                setLoading(false);
                return;
            }
            
            const data = await expenseAPI.getAllExpenses();
            const expensesArray = Array.isArray(data) ? data : data.data || [];
            
            setExpenses(expensesArray);
            setFiltered(expensesArray);
        } catch (err) {
            const { message } = apiUtils.handleError(err);
            console.error("Error fetching expenses:", message);
        } finally {
            setLoading(false);
        }
    };
    
    fetchExpenses();
}, []);
```

### 4. Today's Expenses (`src/components/expense/TodaysExpenses.jsx`)

#### Before (Old Way)
```javascript
import axios from "axios";

const fetchExpenses = async () => {
    try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token) {
            setError("Unauthorized. Please log in.");
            setLoading(false);
            return;
        }

        const res = await axios.get(
            `https://dos-expence.onrender.com/api/expense/${userId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        setExpenses(res.data);
    } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch expenses.");
    } finally {
        setLoading(false);
    }
};
```

#### After (New Way)
```javascript
import { expenseAPI, apiUtils } from '../../services/apiService';

const fetchExpenses = async () => {
    try {
        setLoading(true);
        setError("");
        
        if (!apiUtils.isAuthenticated()) {
            setError("Unauthorized. Please log in.");
            return;
        }
        
        const userId = apiUtils.getCurrentUser().userId;
        const data = await expenseAPI.getExpensesByUser(userId);
        
        setExpenses(data);
    } catch (err) {
        const { message } = apiUtils.handleError(err);
        setError(message);
    } finally {
        setLoading(false);
    }
};
```

### 5. Region Form (`src/components/expense/RegionForm.jsx`)

#### Before (Old Way)
```javascript
import axios from 'axios';

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            name: regionName,
            areas,
        };
        const response = await axios.post('https://dos-expence.onrender.com/api/region', payload);
        alert('Region created successfully!');
        console.log(response.data);
    } catch (error) {
        console.error('Submission Error:', error.response?.data || error.message);
    }
};
```

#### After (New Way)
```javascript
import { regionAPI, apiUtils } from '../../services/apiService';

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            name: regionName,
            areas,
        };
        
        const result = await regionAPI.createRegion(payload);
        alert('Region created successfully!');
        console.log(result);
    } catch (error) {
        const { message } = apiUtils.handleError(error);
        console.error('Submission Error:', message);
    }
};
```

## Step-by-Step Migration Process

### Step 1: Update Imports
Replace axios imports with the new API service:

```javascript
// Remove this
import axios from 'axios';

// Add this
import { 
    authAPI, 
    expenseAPI, 
    regionAPI, 
    userAPI, 
    analyticsAPI, 
    exportAPI, 
    apiUtils 
} from '../services/apiService';
```

### Step 2: Replace Direct API Calls
Replace hardcoded API calls with service methods:

```javascript
// Before
const response = await axios.get(url, { headers });

// After
const response = await apiService.methodName(params);
```

### Step 3: Update Error Handling
Use the centralized error handling:

```javascript
// Before
} catch (err) {
    console.error("Error:", err.response?.data?.error || err.message);
}

// After
} catch (err) {
    const { message } = apiUtils.handleError(err);
    console.error("Error:", message);
}
```

### Step 4: Update Authentication Checks
Use utility functions for authentication:

```javascript
// Before
const token = localStorage.getItem("token");
if (!token) {
    // Handle unauthorized
}

// After
if (!apiUtils.isAuthenticated()) {
    // Handle unauthorized
}
```

### Step 5: Update Session Management
Use utility functions for session management:

```javascript
// Before
localStorage.setItem('token', data.token);
localStorage.setItem('role', data.role);
localStorage.setItem('userId', data._id);
localStorage.setItem('name', data.name);

// After
apiUtils.setSession(data);
```

## Benefits of Migration

1. **Consistency**: All API calls use the same configuration and error handling
2. **Maintainability**: Easy to update base URL or add new features
3. **Type Safety**: Better IntelliSense and code completion
4. **Testing**: Easier to mock and test API calls
5. **Documentation**: All APIs are documented in one place
6. **Error Handling**: Centralized error handling and token management
7. **Security**: Automatic token injection and validation

## Common Migration Patterns

### Pattern 1: Simple GET Request
```javascript
// Before
const response = await axios.get(url, { headers });

// After
const response = await apiService.methodName(params);
```

### Pattern 2: POST Request with Data
```javascript
// Before
const response = await axios.post(url, data, { headers });

// After
const response = await apiService.methodName(data);
```

### Pattern 3: Error Handling
```javascript
// Before
} catch (err) {
    const message = err.response?.data?.message || err.message;
    handleError(message);
}

// After
} catch (err) {
    const { message } = apiUtils.handleError(err);
    handleError(message);
}
```

### Pattern 4: Authentication Check
```javascript
// Before
const token = localStorage.getItem("token");
if (!token) return;

// After
if (!apiUtils.isAuthenticated()) return;
```

## Testing Your Migration

After migrating, test the following:

1. **Authentication**: Login/logout functionality
2. **Data Fetching**: All data loading operations
3. **Data Creation**: Form submissions
4. **Data Updates**: Edit operations
5. **Data Deletion**: Delete operations
6. **Error Handling**: Network errors, validation errors
7. **Token Management**: Token expiration, refresh

## Troubleshooting

### Common Issues

1. **Import Paths**: Make sure import paths are correct relative to your component
2. **Method Names**: Check the API documentation for correct method names
3. **Parameters**: Ensure you're passing the correct parameters to API methods
4. **Error Handling**: Make sure you're using `apiUtils.handleError()` for consistent error handling

### Debug Tips

1. Check the browser console for import errors
2. Verify that the API service is properly imported
3. Test API calls in the browser's Network tab
4. Use the ExampleUsage component to test API functionality

## Support

If you encounter issues during migration:

1. Check the API documentation: `API_DOCUMENTATION.md`
2. Review the example component: `src/components/ExampleUsage.jsx`
3. Check the API service file: `src/services/apiService.js`
4. Verify environment configuration: `src/config/environment.js`
