import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
import PdfViewer from './PdfViewer';
import { invoiceAPI, pdfAPI, apiUtils, BASE_API_URL } from '../api';
import toast from 'react-hot-toast';

const MetaAdsInvoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    // Stats cards configuration
    const statsCards = [
        {
            id: 'totalInvoices',
            title: 'Total Invoices',
            getValue: () => analytics?.analytics?.[0]?.totalInvoices || pagination.totalInvoices || 0,
            formatValue: (value) => value
        },
        {
            id: 'totalSpend',
            title: 'Total Spend',
            getValue: () => analytics?.analytics?.[0]?.totalAmount || invoices.reduce((sum, inv) => sum + (inv.extractedData?.totalAmount || 0), 0),
            formatValue: (value) => formatCurrency(value, 'INR')
        },
        {
            id: 'totalImpressions',
            title: 'Total Impressions',
            getValue: () => analytics?.analytics?.[0]?.totalImpressions || invoices.reduce((sum, inv) => {
                const totals = getCampaignTotals(inv);
                return sum + totals.impressions;
            }, 0),
            formatValue: (value) => value.toLocaleString()
        },
        {
            id: 'avgCPM',
            title: 'Avg CPM',
            getValue: () => {
                if (analytics?.analytics?.[0]?.avgCPM) return analytics.analytics[0].avgCPM;
                const totalSpend = invoices.reduce((sum, inv) => sum + (inv.extractedData?.totalAmount || 0), 0);
                const totalImpressions = invoices.reduce((sum, inv) => {
                    const totals = getCampaignTotals(inv);
                    return sum + totals.impressions;
                }, 0);
                return totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
            },
            formatValue: (value) => value > 0 ? formatCurrency(value, 'INR') : '-'
        }
    ];

    // Table columns configuration
    const tableColumns = [
        {
            key: 'campaign',
            label: 'Campaign Details',
            className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        },
        {
            key: 'subtotal',
            label: 'Amount (Excl. GST)',
            className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        },
        {
            key: 'tax',
            label: 'GST Amount',
            className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        },
        {
            key: 'total',
            label: 'Total Amount',
            className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        },
        {
            key: 'impressions',
            label: 'Impressions',
            className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        },
        {
            key: 'cpm',
            label: 'CPM',
            className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
        }
    ];

    // Action buttons configuration
    const actionButtons = [
        {
            key: 'view',
            label: 'View',
            icon: <Eye className="h-3 w-3 mr-1" />,
            className: 'inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors',
            onClick: (invoice) => handleViewPdf(invoice),
            title: 'View PDF'
        },
        {
            key: 'download',
            label: 'Download',
            icon: <Download className="h-3 w-3 mr-1" />,
            className: 'inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors',
            onClick: (invoice) => handleDownloadPdf(invoice),
            title: 'Download PDF'
        }
    ];

    // Development-only debug button
    if (process.env.NODE_ENV === 'development') {
        actionButtons.push({
            key: 'debug',
            label: 'Debug',
            icon: (
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            className: 'hidden inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors',
            onClick: (invoice) => debugPdfUrl(invoice),
            title: 'Debug PDF URL'
        });
    }

    const fetchInvoices = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await invoiceAPI.getInvoicesByPlatform('meta_ads', { page });
            setInvoices(response.data.invoices);
            setPagination(response.data.pagination);
            setCurrentPage(response.data.pagination.currentPage);
        } catch (err) {
            const errorInfo = apiUtils.handleError(err);
            setError(errorInfo.message);
            console.error('Error fetching Meta Ads invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            // Get all Meta Ads invoices to calculate totals
            const response = await invoiceAPI.getAllInvoices({
                platform: 'meta_ads',
                limit: 10000 // Get all invoices
            });

            const allInvoices = response.data.invoices;

            // Calculate totals from all invoices
            const totals = {
                totalInvoices: allInvoices.length,
                totalAmount: allInvoices.reduce((sum, inv) => sum + (inv.extractedData?.totalAmount || 0), 0),
                totalImpressions: allInvoices.reduce((sum, inv) => {
                    const campaigns = inv.extractedData?.campaigns || [];
                    return sum + campaigns.reduce((campSum, camp) => campSum + (camp.impressions || 0), 0);
                }, 0),
                totalClicks: allInvoices.reduce((sum, inv) => {
                    const campaigns = inv.extractedData?.campaigns || [];
                    return sum + campaigns.reduce((campSum, camp) => campSum + (camp.clicks || 0), 0);
                }, 0)
            };

            // Calculate average CPM
            totals.avgCPM = totals.totalImpressions > 0
                ? (totals.totalAmount / totals.totalImpressions) * 1000
                : 0;

            setAnalytics({ analytics: [totals] });
        } catch (err) {
            console.error('Error fetching analytics:', err);
            // Don't set error state for analytics failure, just log it
        }
    };

    useEffect(() => {
        fetchInvoices();
        fetchAnalytics();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchInvoices(newPage);
        }
    };

    // Helpers: compute campaign metrics per invoice
    const getCampaignTotals = (invoice) => {
        const campaigns = invoice?.extractedData?.campaigns || [];
        return campaigns.reduce(
            (acc, c) => ({
                amount: acc.amount + (Number(c.amount) || 0),
                impressions: acc.impressions + (Number(c.impressions) || 0),
                clicks: acc.clicks + (Number(c.clicks) || 0)
            }),
            { amount: 0, impressions: 0, clicks: 0 }
        );
    };

    const getAverageCPM = (invoice) => {
        const totals = getCampaignTotals(invoice);
        if (!totals.impressions) return null;
        return (invoice.extractedData?.totalAmount / totals.impressions) * 1000; // CPM = cost per 1000 impressions
    };

    const handleViewPdf = (invoice) => {
        try {
            if (!invoice.fileName) {
                toast.error('Invoice filename not found');
                return;
            }

            // Debug logging
            console.log('Invoice data for PDF viewing:', {
                fileName: invoice.fileName,
                filePath: invoice.filePath,
                pdfUrl: invoice.pdfUrl,
                id: invoice._id,
                platform: invoice.platform
            });

            // Check if this is a Meta Ads invoice that might not be available locally
            if (invoice.platform === 'meta_ads') {
                // Show a warning toast first
                toast('Checking PDF availability...', {
                    icon: '⏳',
                    duration: 2000
                });

                // For Meta Ads, also show a hint about download option
                setTimeout(() => {
                    toast('💡 Tip: If viewing fails, try the Download option instead', {
                        duration: 4000,
                        icon: '💡'
                    });
                }, 1000);
            }

            // Use the proper API endpoint for viewing PDFs
            const pdfUrl = `${BASE_API_URL}/pdf/view/${encodeURIComponent(invoice.fileName)}`;

            console.log('Generated PDF URL:', pdfUrl);

            setSelectedPdf({
                url: pdfUrl,
                fileName: invoice.fileName
            });
        } catch (error) {
            console.error('Error setting up PDF viewer:', error);
            toast.error('Failed to open PDF viewer');
        }
    };

    const handleDownloadPdf = async (invoice) => {
        try {
            // Use the fileName from the invoice object (this is what the API expects)
            const response = await pdfAPI.downloadPdf(invoice.fileName);
            apiUtils.createDownloadLink(response.data, invoice.fileName);
        } catch (error) {
            console.error('Download failed:', error);
            const errorInfo = apiUtils.handleError(error);
            alert(`Download failed: ${errorInfo.message}`);
        }
    };

    const debugPdfUrl = async (invoice) => {
        try {
            if (!invoice.fileName) {
                console.log('No fileName found for invoice:', invoice);
                return;
            }

            const pdfUrl = `${BASE_API_URL}/pdf/view/${encodeURIComponent(invoice.fileName)}`;
            console.log('Testing PDF URL:', pdfUrl);

            // First, try to get the invoice details from the database
            try {
                const invoiceResponse = await fetch(`${BASE_API_URL}/invoices/${invoice._id}`);
                const invoiceData = await invoiceResponse.json();
                console.log('Invoice data from API:', invoiceData);
            } catch (invoiceError) {
                console.error('Error fetching invoice data:', invoiceError);
            }

            const response = await fetch(pdfUrl, { method: 'HEAD' });
            console.log('PDF URL test response:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (response.ok) {
                toast.success('PDF URL is accessible');
            } else {
                // Try to get the error response body
                try {
                    const errorResponse = await fetch(pdfUrl);
                    const errorData = await errorResponse.json();
                    console.log('Error response body:', errorData);
                    toast.error(`PDF URL test failed: ${response.status} ${response.statusText} - ${errorData.error || errorData.message || 'Unknown error'}`);
                } catch (bodyError) {
                    toast.error(`PDF URL test failed: ${response.status} ${response.statusText}`);
                }
            }
        } catch (error) {
            console.error('PDF URL test error:', error);
            toast.error('PDF URL test failed');
        }
    };

    // Render cell content based on column type
    const renderCellContent = (invoice, columnKey) => {
        const totals = getCampaignTotals(invoice);
        const avgCpm = getAverageCPM(invoice);

        switch (columnKey) {
            case 'campaign':
                return (
                    <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[250px]">
                            {(invoice.extractedData.campaigns || []).slice(0, 2).map(c => c.campaignName).filter(Boolean).join(', ') || '—'}
                        </div>
                        <div className="text-xs text-gray-500">
                            {formatDate(invoice.extractedData.invoiceDate)}
                        </div>
                    </div>
                );
            case 'subtotal':
                return (
                    <div className="text-sm text-gray-900">
                        {formatCurrency(invoice.extractedData.subtotal, invoice.extractedData.currency)}
                    </div>
                );
            case 'tax':
                return (
                    <div className="text-sm text-gray-900">
                        {formatCurrency(invoice.extractedData.taxAmount, invoice.extractedData.currency)}
                    </div>
                );
            case 'total':
                return (
                    <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(invoice.extractedData.totalAmount, invoice.extractedData.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                            {(invoice.extractedData.campaigns?.length || 0)} campaigns
                        </div>
                    </div>
                );
            case 'impressions':
                return (
                    <div className="text-sm text-gray-900">
                        {totals.impressions ? totals.impressions.toLocaleString() : '—'}
                    </div>
                );
            case 'cpm':
                return (
                    <div className="text-sm text-gray-900">
                        {avgCpm != null ? formatCurrency(avgCpm, invoice.extractedData.currency) : '—'}
                    </div>
                );
            case 'actions':
                return (
                    <div className="flex space-x-1">
                        {invoice.fileName && actionButtons.map((button) => (
                            <button
                                key={button.key}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    button.onClick(invoice);
                                }}
                                className={button.className}
                                title={button.title}
                            >
                                {button.icon}
                                {button.label}
                            </button>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-[99rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-lg text-gray-600">Loading Meta Ads invoices...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-[99rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error loading Meta Ads invoices</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => fetchInvoices()}
                                        className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-[99rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-2xl font-bold text-gray-900">Meta Ads Campaigns</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage and analyze your Meta Ads campaign invoices
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => navigate('/bulk-download')}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Bulk Download
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Subtle warning notice */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    <span className="font-medium">Note:</span> Some Meta Ads PDFs may not be available for viewing. Use the download option if viewing fails.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsCards.map((card) => (
                        <div key={card.id} className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        {card.icon}
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {card.formatValue(card.getValue())}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Invoices Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Invoice Details</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found
                        </p>
                    </div>

                    {invoices.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Meta Ads invoices found</h3>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {tableColumns.map((column) => (
                                            <th key={column.key} className={column.className}>
                                                {column.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/invoice/${invoice._id}`)}>
                                            {tableColumns.map((column) => (
                                                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {renderCellContent(invoice, column.key)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.hasPrev}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.hasNext}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{((currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(currentPage * pagination.limit, pagination.totalInvoices)}</span> of{' '}
                                    <span className="font-medium">{pagination.totalInvoices}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="First page"
                                    >
                                        <span className="sr-only">First</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={!pagination.hasPrev}
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* Page numbers with ellipsis */}
                                    {(() => {
                                        const pages = [];
                                        const totalPages = pagination.totalPages;
                                        const current = currentPage;

                                        if (totalPages <= 7) {
                                            // Show all pages if total is 7 or less
                                            for (let i = 1; i <= totalPages; i++) {
                                                pages.push(i);
                                            }
                                        } else {
                                            // Show first page
                                            pages.push(1);

                                            if (current <= 4) {
                                                // Show pages 2-5, then ellipsis, then last page
                                                for (let i = 2; i <= 5; i++) {
                                                    pages.push(i);
                                                }
                                                pages.push('...');
                                                pages.push(totalPages);
                                            } else if (current >= totalPages - 3) {
                                                // Show first page, ellipsis, then last 4 pages
                                                pages.push('...');
                                                for (let i = totalPages - 4; i <= totalPages; i++) {
                                                    pages.push(i);
                                                }
                                            } else {
                                                // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
                                                pages.push('...');
                                                pages.push(current - 1);
                                                pages.push(current);
                                                pages.push(current + 1);
                                                pages.push('...');
                                                pages.push(totalPages);
                                            }
                                        }

                                        return pages.map((page, index) => (
                                            <button
                                                key={index}
                                                onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                                                disabled={page === '...'}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${page === current
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : page === '...'
                                                            ? 'bg-white border-gray-300 text-gray-500 cursor-default'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ));
                                    })()}

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={!pagination.hasNext}
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.totalPages)}
                                        disabled={currentPage === pagination.totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Last page"
                                    >
                                        <span className="sr-only">Last</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* PDF Viewer Modal */}
            {selectedPdf && (
                <PdfViewer
                    pdfUrl={selectedPdf.url}
                    fileName={selectedPdf.fileName}
                    onClose={() => setSelectedPdf(null)}
                />
            )}
        </div>
    );
};

export default MetaAdsInvoices;
