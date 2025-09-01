import React, { useState } from 'react';
import { Search, FileText, CheckCircle, AlertCircle, Clock, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_API_URL } from '../api';

const StatusChecker = () => {
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    if (!fileName.trim()) {
      toast.error('Please enter a file name');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${BASE_API_URL}/pdf/status/${encodeURIComponent(fileName)}`);
      setStatus(response.data);
      toast.success('Status retrieved successfully');
    } catch (error) {
      console.error('Status check error:', error);
      if (error.response?.status === 404) {
        toast.error('File not found');
      } else {
        toast.error('Failed to check status');
      }
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Processing Status</h3>

      <div className="flex space-x-2 mb-6">
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Enter file name to check status"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          onClick={checkStatus}
          disabled={loading}
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span>Check</span>
        </button>
      </div>

      {status && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-5 w-5 text-gray-400" />
            <h4 className="font-medium text-gray-900">{status.fileName}</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {getStatusIcon(status.status)}
              <span className={`font-medium ${getStatusColor(status.status)}`}>
                Status: {status.status}
              </span>
            </div>

            {status.platform && (
              <div>
                <span className="text-sm text-gray-600">Platform: </span>
                <span className="text-sm font-medium text-gray-900">{status.platform}</span>
              </div>
            )}

            {status.errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <span className="text-sm text-red-800">Error: {status.errorMessage}</span>
              </div>
            )}

            {status.extractedData && (
              <div>
                <span className="text-sm text-gray-600">Extracted Data:</span>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded-md overflow-auto max-h-40">
                  {JSON.stringify(status.extractedData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusChecker;
