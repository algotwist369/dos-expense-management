import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
import PdfViewer from './PdfViewer';
import { invoiceAPI, pdfAPI, apiUtils } from '../api';
import toast from 'react-hot-toast';

const GoogleAdsInvoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    const fetchInvoices = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await invoiceAPI.getInvoicesByPlatform('google_ads', { page });
            setInvoices(response.data.invoices);
            setPagination(response.data.pagination);
            setCurrentPage(response.data.pagination.currentPage);
        } catch (err) {
            const errorInfo = apiUtils.handleError(err);
            setError(errorInfo.message);
            console.error('Error fetching Google Ads invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            // Get all Google Ads invoices to calculate totals
            const response = await invoiceAPI.getAllInvoices({ 
                platform: 'google_ads', 
                limit: 10000 // Get all invoices
            });
            
            const allInvoices = response.data.invoices;
            
            // Calculate totals from all invoices
            const totals = {
                totalInvoices: allInvoices.length,
                totalAmount: allInvoices.reduce((sum, inv) => sum + (inv.extractedData?.totalAmount || 0), 0),
                totalClicks: allInvoices.reduce((sum, inv) => {
                    const campaigns = inv.extractedData?.campaigns || [];
                    return sum + campaigns.reduce((campSum, camp) => campSum + (camp.clicks || 0), 0);
                }, 0),
                totalImpressions: allInvoices.reduce((sum, inv) => {
                    const campaigns = inv.extractedData?.campaigns || [];
                    return sum + campaigns.reduce((campSum, camp) => campSum + (camp.impressions || 0), 0);
                }, 0)
            };
            
            // Calculate average CPC
            totals.avgCPC = totals.totalClicks > 0 
                ? totals.totalAmount / totals.totalClicks 
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
                clicks: acc.clicks + (Number(c.clicks) || 0),
                cpcSum: acc.cpcSum + ((Number(c.cpc) || 0) * (Number(c.clicks) || 0)),
                clicksForCpc: acc.clicksForCpc + (Number(c.clicks) || 0)
            }),
            { amount: 0, clicks: 0, cpcSum: 0, clicksForCpc: 0 }
        );
    };

    const getAverageCpc = (invoice) => {
        const totals = getCampaignTotals(invoice);
        if (!totals.clicksForCpc) return null;
        return totals.cpcSum / totals.clicksForCpc;
    };

    const handleViewPdf = (invoice) => {
        if (invoice.pdfUrl) {
            setSelectedPdf({
                url: invoice.pdfUrl,
                fileName: invoice.fileName
            });
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-[99rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-lg text-gray-600">Loading Google Ads invoices...</span>
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
                                <h3 className="text-sm font-medium text-red-800">Error loading Google Ads invoices</h3>
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-[99rem] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Google Ads Campaigns</h1>
                            <p className="mt-2 text-gray-600">
                                Manage and analyze your Google Ads campaigns
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => navigate('/bulk-download')}
                                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Bulk Download
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                            >
                                Back to All Campaigns
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {analytics?.analytics?.[0]?.totalInvoices || pagination.totalInvoices || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Spend (All Campaigns)</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {analytics?.analytics?.[0]?.totalAmount 
                                        ? formatCurrency(analytics.analytics[0].totalAmount, 'INR')
                                        : formatCurrency(invoices.reduce((sum, inv) => sum + (inv.extractedData?.totalAmount || 0), 0), 'INR')
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Clicks (All Campaigns)</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {analytics?.analytics?.[0]?.totalClicks 
                                        ? analytics.analytics[0].totalClicks.toLocaleString()
                                        : invoices.reduce((sum, inv) => {
                                            const totals = getCampaignTotals(inv);
                                            return sum + totals.clicks;
                                        }, 0).toLocaleString()
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Avg CPC (All Campaigns)</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {analytics?.analytics?.[0]?.avgCPC 
                                        ? formatCurrency(analytics.analytics[0].avgCPC, 'INR')
                                        : (() => {
                                            const totalSpend = invoices.reduce((sum, inv) => sum + (inv.extractedData?.totalAmount || 0), 0);
                                            const totalClicks = invoices.reduce((sum, inv) => {
                                                const totals = getCampaignTotals(inv);
                                                return sum + totals.clicks;
                                            }, 0);
                                            return totalClicks > 0 ? formatCurrency(totalSpend / totalClicks, 'INR') : '-';
                                        })()
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Google Ads Campaign Details</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                    
                    {invoices.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Google Ads Campaigns found</h3>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Campaign Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount (Excl. GST)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            GST Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Clicks
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg CPC
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {invoices.map((invoice) => {
                                        const totals = getCampaignTotals(invoice);
                                        const avgCpc = getAverageCpc(invoice);
                                        return (
                                        <tr key={invoice._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/invoice/${invoice._id}`)}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <div className="text-sm text-gray-500">
                                                        {invoice.fileName.split('.')[0]}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {formatDate(invoice.extractedData.invoiceDate)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(invoice.extractedData.subtotal, invoice.extractedData.currency)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(invoice.extractedData.taxAmount, invoice.extractedData.currency)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(invoice.extractedData.totalAmount, invoice.extractedData.currency)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {(invoice.extractedData.campaigns?.length || 0)} campaigns
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {totals.clicks ? totals.clicks.toLocaleString() : '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {avgCpc != null ? formatCurrency(avgCpc, invoice.extractedData.currency) : '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    {invoice.pdfUrl && (
                                                        <>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewPdf(invoice);
                                                                }}
                                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-xs flex items-center"
                                                                title="View PDF"
                                                            >
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDownloadPdf(invoice);
                                                                }}
                                                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md text-xs flex items-center"
                                                                title="Download PDF"
                                                            >
                                                                <Download className="h-3 w-3 mr-1" />
                                                                Download
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-md shadow">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.hasPrev}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.hasNext}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                                                    page === current
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
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.totalPages)}
                                        disabled={currentPage === pagination.totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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

export default GoogleAdsInvoices;
