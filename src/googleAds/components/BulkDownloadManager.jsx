import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, FileText, Archive, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import PdfViewer from './PdfViewer';
import { invoiceAPI, pdfAPI, apiUtils } from '../api';

const BulkDownloadManager = () => {
    const [platforms, setPlatforms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [platformStats, setPlatformStats] = useState({});
    const [selectedPdf, setSelectedPdf] = useState(null);

    const platformConfig = useMemo(() => ({
        google_ads: { name: 'Google Ads', color: 'blue' },
        meta_ads: { name: 'Meta Ads', color: 'purple' },
        other: { name: 'Other', color: 'gray' }
    }), []);

    const fetchPlatformStats = useCallback(async () => {
        try {
            setLoading(true);
            const response = await invoiceAPI.getAnalyticsSummary();
            const stats = {};

            response.data.analytics.forEach(platform => {
                stats[platform._id] = platform.totalInvoices;
            });

            setPlatformStats(stats);
            setPlatforms(Object.keys(platformConfig));
        } catch (err) {
            const errorInfo = apiUtils.handleError(err);
            setError('Failed to fetch platform statistics: ' + errorInfo.message);
            console.error('Error fetching platform stats:', err);
        } finally {
            setLoading(false);
        }
    }, [platformConfig]);

    useEffect(() => {
        fetchPlatformStats();
    }, [fetchPlatformStats]);

    // Auto-clear error and success messages
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccess(null);
            }, 5000); // Clear after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const handleBulkDownload = async (platform, format = 'zip') => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            if (format === 'zip') {
                // Download ZIP file
                const response = await pdfAPI.bulkDownloadPdfs(platform, 'zip');

                // Check if response is actually a blob
                if (response.data instanceof Blob) {
                    // Create download link
                    apiUtils.createDownloadLink(response.data, `${platform}_invoices.zip`);
                    setSuccess(`Successfully downloaded ${platformConfig[platform].name} invoices as ZIP`);
                } else {
                    throw new Error('Invalid response format');
                }
            } else {
                // Get list of files for individual download
                const response = await pdfAPI.getBulkDownloadList(platform);

                if (response.data.files && response.data.files.length > 0) {
                    setSelectedPlatform({
                        platform,
                        files: response.data.files,
                        totalFiles: response.data.totalFiles
                    });
                } else {
                    setError(`No invoices found for ${platformConfig[platform].name}`);
                }
            }
        } catch (err) {
            let errorMessage = `Failed to download ${platformConfig[platform].name} invoices`;

            if (err.response?.status === 404) {
                errorMessage = `No invoices found for ${platformConfig[platform].name}`;
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = `Request timeout. Please try again.`;
            } else {
                const errorInfo = apiUtils.handleError(err);
                errorMessage = errorInfo.message;
            }

            setError(errorMessage);
            console.error('Bulk download error:', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadIndividualFile = async (downloadUrl, fileName) => {
        try {
            const response = await pdfAPI.downloadPdf(fileName);

            if (response.data instanceof Blob) {
                apiUtils.createDownloadLink(response.data, fileName);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Download failed:', error);
            const errorMessage = apiUtils.handleError(error).message;
            setError(`Download failed: ${errorMessage}`);
            // toast.error(`Download failed: ${errorMessage}`); // Assuming toast is available
        }
    };

    const handleViewPdf = (viewUrl, fileName) => {
        if (viewUrl) {
            setSelectedPdf({
                url: viewUrl,
                fileName: fileName
            });
        }
    };

    const getColorClasses = (platform) => {
        const config = platformConfig[platform];
        switch (config.color) {
            case 'blue':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'purple':
                return 'bg-purple-50 border-purple-200 text-purple-800';
            case 'gray':
                return 'bg-gray-50 border-gray-200 text-gray-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    if (loading && platforms.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-lg text-gray-600">Loading platform statistics...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Download Manager</h1>
                    <p className="text-gray-600">Download multiple invoices by platform</p>
                </div>

                {/* Error and Success Messages */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                                <p className="text-sm text-green-800">{success}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Platform Cards */}
                {!selectedPlatform ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {platforms.map((platform) => {
                            const config = platformConfig[platform];
                            const count = platformStats[platform] || 0;

                            return (
                                <div key={platform} className="bg-white rounded-lg shadow-md border border-gray-200">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-3">{config.icon}</span>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                                                    <p className="text-sm text-gray-500">{config.description}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getColorClasses(platform)}`}>
                                                {count} invoices available
                                            </div>
                                        </div>

                                        {count > 0 ? (
                                            <div className="space-y-2">
                                                <button
                                                    onClick={() => handleBulkDownload(platform, 'zip')}
                                                    disabled={loading}
                                                    className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'opacity-50' : ''}`}
                                                >
                                                    <Archive className="h-4 w-4 mr-2" />
                                                    Download All as ZIP
                                                </button>
                                                <button
                                                    onClick={() => handleBulkDownload(platform, 'list')}
                                                    disabled={loading}
                                                    className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'opacity-50' : ''}`}
                                                >
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    View Individual Files
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-sm text-gray-500">No invoices available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Individual Files List */
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {platformConfig[selectedPlatform.platform].name} Invoices
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {selectedPlatform.totalFiles} files available for download
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedPlatform(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {selectedPlatform.files.map((file, index) => (
                                <div key={index} className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleViewPdf(file.viewUrl, file.fileName)}
                                            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => downloadIndividualFile(file.downloadUrl, file.fileName)}
                                            className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 rounded-md"
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <button
                                onClick={() => handleBulkDownload(selectedPlatform.platform, 'zip')}
                                disabled={loading}
                                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Archive className="h-4 w-4 mr-2" />
                                Download All as ZIP
                            </button>
                        </div>
                    </div>
                )}

                {/* PDF Viewer Modal */}
                {selectedPdf && (
                    <PdfViewer
                        pdfUrl={selectedPdf.url}
                        fileName={selectedPdf.fileName}
                        onClose={() => setSelectedPdf(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default BulkDownloadManager;
