import React, { useState } from 'react';
import { authAPI, expenseAPI, regionAPI, apiUtils } from '../services/apiService';
import config from '../config/environment';

const APITest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testConfig = async () => {
    addResult('Configuration', 'info', `API Base URL: ${config.API_BASE_URL}`);
    addResult('Configuration', 'info', `Auth Base URL: ${config.AUTH_BASE_URL}`);
    
    // Test if the URLs are correct
    if (config.API_BASE_URL.includes('dos-expence.onrender.com')) {
      addResult('Configuration', 'success', '✅ Using correct API domain');
    } else {
      addResult('Configuration', 'error', '❌ Using incorrect API domain');
    }
  };

  const testAuthEndpoints = async () => {
    setLoading(true);
    
    try {
      // Test admin login with dummy data
      addResult('Auth API', 'info', 'Testing admin login endpoint...');
      try {
        await authAPI.adminLogin('test@test.com', 'password');
        addResult('Auth API', 'error', 'Admin login should have failed with invalid credentials');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          addResult('Auth API', 'success', 'Admin login endpoint is reachable (expected auth failure)');
        } else {
          addResult('Auth API', 'error', `Admin login failed: ${error.message}`);
        }
      }

      // Test user login with dummy data
      addResult('Auth API', 'info', 'Testing user login endpoint...');
      try {
        await authAPI.userLogin('testuser', '1234');
        addResult('Auth API', 'error', 'User login should have failed with invalid credentials');
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          addResult('Auth API', 'success', 'User login endpoint is reachable (expected auth failure)');
        } else {
          addResult('Auth API', 'error', `User login failed: ${error.message}`);
        }
      }

    } catch (error) {
      addResult('Auth API', 'error', `Auth API test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegionEndpoints = async () => {
    setLoading(true);
    
    try {
      addResult('Region API', 'info', 'Testing region endpoints...');
      const regions = await regionAPI.getAllRegions();
      addResult('Region API', 'success', `Regions fetched successfully: ${regions.length} regions found`);
    } catch (error) {
      addResult('Region API', 'error', `Region API failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testExpenseEndpoints = async () => {
    setLoading(true);
    
    try {
      addResult('Expense API', 'info', 'Testing expense endpoints...');
      
      // Test without authentication (should fail)
      try {
        await expenseAPI.getAllExpenses();
        addResult('Expense API', 'error', 'Expense API should require authentication');
      } catch (error) {
        if (error.response?.status === 401) {
          addResult('Expense API', 'success', 'Expense API properly requires authentication');
        } else {
          addResult('Expense API', 'error', `Expense API error: ${error.message}`);
        }
      }
    } catch (error) {
      addResult('Expense API', 'error', `Expense API test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testNetworkConnectivity = async () => {
    setLoading(true);
    
    try {
      addResult('Network', 'info', 'Testing network connectivity...');
      
      // Test health check endpoint
      try {
        const response = await fetch(`${config.API_BASE_URL}/health`);
        if (response.ok) {
          const data = await response.json();
          addResult('Network', 'success', `Health check passed: ${data.message}`);
          addResult('Network', 'info', `Available routes: ${Object.keys(data.routes).join(', ')}`);
        } else {
          addResult('Network', 'warning', `Health check failed with status: ${response.status}`);
        }
      } catch (error) {
        addResult('Network', 'error', `Health check failed: ${error.message}`);
      }
      
      // Test basic connectivity
      try {
        const response = await fetch(config.API_BASE_URL.replace('/api', ''));
        if (response.ok) {
          addResult('Network', 'success', 'Base domain is reachable');
        } else {
          addResult('Network', 'warning', `Base domain responded with status: ${response.status}`);
        }
      } catch (error) {
        addResult('Network', 'error', `Base domain connectivity failed: ${error.message}`);
      }
    } catch (error) {
      addResult('Network', 'error', `Network connectivity failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    setLoading(true);
    
    await testConfig();
    await testNetworkConnectivity();
    await testAuthEndpoints();
    await testRegionEndpoints();
    await testExpenseEndpoints();
    
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Current Configuration</h2>
        <p><strong>API Base URL:</strong> {config.API_BASE_URL}</p>
        <p><strong>Auth Base URL:</strong> {config.AUTH_BASE_URL}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={runAllTests}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>

        <button
          onClick={testConfig}
          disabled={loading}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Test Config
        </button>

        <button
          onClick={testNetworkConnectivity}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Network
        </button>

        <button
          onClick={testAuthEndpoints}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Auth
        </button>

        <button
          onClick={testRegionEndpoints}
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Test Regions
        </button>

        <button
          onClick={testExpenseEndpoints}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Expenses
        </button>

        <button
          onClick={clearResults}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Clear Results
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Test Results ({testResults.length})</h3>
        </div>
        
        {testResults.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No test results yet. Click "Run All Tests" to start testing.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="p-4 border-b last:border-b-0">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-semibold ${getStatusColor(result.status)}`}>
                      [{result.status.toUpperCase()}]
                    </span>
                    <span className="ml-2 font-medium">{result.test}</span>
                  </div>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                <p className="mt-1 text-gray-700">{result.message}</p>
                {result.data && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Troubleshooting Tips</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• If network tests fail, check if the server is running</li>
          <li>• If auth tests fail with CORS errors, check server CORS configuration</li>
          <li>• If endpoints return 404, verify the API routes are correctly configured</li>
          <li>• If you get 401 errors for public endpoints, check authentication middleware</li>
        </ul>
      </div>
    </div>
  );
};

export default APITest;
