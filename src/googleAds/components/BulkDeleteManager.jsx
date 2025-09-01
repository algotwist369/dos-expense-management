import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, CheckCircle, Calendar, Filter, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { invoiceAPI, apiUtils } from '../api';

const BulkDeleteManager = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState({
        timePeriod: '',
        platform: 'all'
    });
    const [confirmationText, setConfirmationText] = useState('');
    const [previewCount, setPreviewCount] = useState(null);

    const timePeriodOptions = [
        { value: '1_day', label: 'Last 1 Day', description: 'Delete invoices from the last 24 hours' },
        { value: '2_days', label: 'Last 2 Days', description: 'Delete invoices from the last 48 hours' },
        { value: '1_week', label: 'Last 1 Week', description: 'Delete invoices from the last 7 days' },
        { value: '2_weeks', label: 'Last 2 Weeks', description: 'Delete invoices from the last 14 days' },
        { value: '1_month', label: 'Last 1 Month', description: 'Delete invoices from the last 30 days' },
        { value: '3_months', label: 'Last 3 Months', description: 'Delete invoices from the last 90 days' },
        { value: '6_months', label: 'Last 6 Months', description: 'Delete invoices from the last 180 days' },
        { value: '1_year', label: 'Last 1 Year', description: 'Delete invoices from the last 365 days' },
        { value: 'all', label: 'All Invoices', description: 'Delete ALL invoices (use with extreme caution)' }
    ];

    const platformOptions = [
        { value: 'all', label: 'All Platforms', description: 'Delete from all platforms' },
        { value: 'google_ads', label: 'Google Ads', description: 'Delete only Google Ads invoices' },
        { value: 'meta_ads', label: 'Meta Ads', description: 'Delete only Meta Ads invoices' },
        { value: 'facebook_ads', label: 'Facebook Ads', description: 'Delete only Facebook Ads invoices' },
        { value: 'instagram_ads', label: 'Instagram Ads', description: 'Delete only Instagram Ads invoices' },
        { value: 'other', label: 'Other', description: 'Delete only Other platform invoices' }
    ];

    // Auto-clear error and success messages
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccess(null);
            }, 8000); // Clear after 8 seconds for delete operations

            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const handleOptionChange = (field, value) => {
        setSelectedOptions(prev => ({
            ...prev,
            [field]: value
        }));
        setShowConfirmation(false);
        setConfirmationText('');
        setPreviewCount(null);
    };

    const getPreviewCount = async () => {
        if (!selectedOptions.timePeriod) {
            setError('Please select a time period first');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Use the preview endpoint to get accurate count
            const response = await invoiceAPI.previewBulkDelete({
                timePeriod: selectedOptions.timePeriod,
                platform: selectedOptions.platform
            });

            setPreviewCount(response.data.count);
            setShowConfirmation(true);

        } catch (err) {
            console.error('Error getting preview count:', err);
            const errorInfo = apiUtils.handleError(err);
            setError(errorInfo.message || 'Failed to get preview count. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (confirmationText !== 'DELETE') {
            setError('Please type "DELETE" to confirm the operation');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await invoiceAPI.bulkDeleteInvoices({
                timePeriod: selectedOptions.timePeriod,
                platform: selectedOptions.platform,
                confirm: confirmationText
            });

            setSuccess(response.data.message);
            setShowConfirmation(false);
            setConfirmationText('');
            setSelectedOptions({ timePeriod: '', platform: 'all' });
            setPreviewCount(null);

        } catch (err) {
            console.error('Bulk delete error:', err);
            const errorInfo = apiUtils.handleError(err);
            setError(errorInfo.message || 'Failed to delete invoices. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getTimePeriodLabel = (value) => {
        const option = timePeriodOptions.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    const getPlatformLabel = (value) => {
        const option = platformOptions.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/')}
                            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Delete Manager</h1>
                            <p className="text-gray-600">Delete multiple invoices based on time period and platform</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">{error}</div>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Success</h3>
                            <div className="mt-2 text-sm text-green-700">{success}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Selection Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Deletion Criteria</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Time Period Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Time Period
                        </label>
                        <select
                            value={selectedOptions.timePeriod}
                            onChange={(e) => handleOptionChange('timePeriod', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select time period</option>
                            {timePeriodOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {selectedOptions.timePeriod && (
                            <p className="mt-1 text-sm text-gray-500">
                                {timePeriodOptions.find(opt => opt.value === selectedOptions.timePeriod)?.description}
                            </p>
                        )}
                    </div>

                    {/* Platform Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Filter className="inline h-4 w-4 mr-1" />
                            Platform Filter
                        </label>
                        <select
                            value={selectedOptions.platform}
                            onChange={(e) => handleOptionChange('platform', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            {platformOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                            {platformOptions.find(opt => opt.value === selectedOptions.platform)?.description}
                        </p>
                    </div>
                </div>

                {/* Preview Button */}
                {selectedOptions.timePeriod && (
                    <div className="mt-6">
                        <button
                            onClick={getPreviewCount}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Preview Deletion
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Section */}
            {showConfirmation && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <AlertTriangle className="h-6 w-6 text-red-500 mt-1 mr-3" />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">
                                Confirm Bulk Deletion
                            </h3>

                            <div className="bg-white rounded-md p-4 mb-4">
                                <p className="text-sm text-gray-700 mb-2">
                                    <strong>Time Period:</strong> {getTimePeriodLabel(selectedOptions.timePeriod)}
                                </p>
                                <p className="text-sm text-gray-700 mb-2">
                                    <strong>Platform:</strong> {getPlatformLabel(selectedOptions.platform)}
                                </p>
                                <p className="text-sm text-gray-700 mb-2">
                                    <strong>Estimated Invoices to Delete:</strong> {previewCount}
                                </p>
                            </div>

                            <div className="text-sm text-red-700 mb-4">
                                <p className="font-semibold">⚠️ Warning:</p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>This action cannot be undone</li>
                                    <li>All selected invoices will be permanently deleted</li>
                                    <li>Both database records and physical files will be removed</li>
                                    {selectedOptions.timePeriod === 'all' && (
                                        <li className="font-bold text-red-800">You are about to delete ALL invoices!</li>
                                    )}
                                </ul>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type "DELETE" to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={confirmationText}
                                    onChange={(e) => setConfirmationText(e.target.value)}
                                    placeholder="Type DELETE to confirm"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={loading || confirmationText !== 'DELETE'}
                                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {loading ? 'Deleting...' : 'Delete Invoices'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowConfirmation(false);
                                        setConfirmationText('');
                                        setPreviewCount(null);
                                    }}
                                    disabled={loading}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkDeleteManager;
