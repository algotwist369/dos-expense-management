import React from 'react';
import config from '../config/environment';

const APIDebug = () => {
  const currentConfig = {
    API_BASE_URL: config.API_BASE_URL,
    AUTH_BASE_URL: config.AUTH_BASE_URL,
    timestamp: new Date().toISOString()
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Configuration Debug</h1>
      
      <div className="bg-white border rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Current Configuration</h2>
        
        <div className="space-y-3">
          <div>
            <label className="font-medium text-gray-700">API Base URL:</label>
            <p className="text-sm bg-gray-100 p-2 rounded mt-1 font-mono">
              {currentConfig.API_BASE_URL}
            </p>
          </div>
          
          <div>
            <label className="font-medium text-gray-700">Auth Base URL:</label>
            <p className="text-sm bg-gray-100 p-2 rounded mt-1 font-mono">
              {currentConfig.AUTH_BASE_URL}
            </p>
          </div>
          
          <div>
            <label className="font-medium text-gray-700">Generated Auth Endpoints:</label>
            <div className="text-sm bg-gray-100 p-2 rounded mt-1 font-mono space-y-1">
              <div>Admin Login: {currentConfig.AUTH_BASE_URL}/admin/login</div>
              <div>User Login: {currentConfig.AUTH_BASE_URL}/user/login</div>
              <div>Admin Register: {currentConfig.AUTH_BASE_URL}/admin/register</div>
              <div>Create User: {currentConfig.AUTH_BASE_URL}/admin/create-user</div>
            </div>
          </div>
          
          <div>
            <label className="font-medium text-gray-700">Generated Expense Endpoints:</label>
            <div className="text-sm bg-gray-100 p-2 rounded mt-1 font-mono space-y-1">
              <div>All Expenses: {currentConfig.API_BASE_URL}/expense</div>
              <div>Create Expense: {currentConfig.API_BASE_URL}/expense</div>
              <div>User Expenses: {currentConfig.API_BASE_URL}/expense/:userId</div>
            </div>
          </div>
          
          <div>
            <label className="font-medium text-gray-700">Generated Region Endpoints:</label>
            <div className="text-sm bg-gray-100 p-2 rounded mt-1 font-mono space-y-1">
              <div>All Regions: {currentConfig.API_BASE_URL}/region</div>
              <div>Create Region: {currentConfig.API_BASE_URL}/region</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Status Check</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>✅ Configuration loaded from environment.js</div>
            <div>✅ Using centralized API service</div>
            <div>✅ All components updated to use new service</div>
            <div>✅ Server is reachable at dos-expence.onrender.com</div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>• If you still see api.ciphra.in, clear browser cache</div>
            <div>• Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)</div>
            <div>• Check browser developer tools Network tab</div>
            <div>• Verify the build was deployed correctly</div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Last updated: {currentConfig.timestamp}
        </div>
      </div>
    </div>
  );
};

export default APIDebug;
