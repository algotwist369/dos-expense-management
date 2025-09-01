import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
import { invoiceAPI, pdfAPI, apiUtils } from '../api';
import PdfViewer from './PdfViewer';
import StatsCards from './InvoiceManagement/StatsCards';
import toast from 'react-hot-toast';
import Tabs from './InvoiceManagement/Tabs';

const GetInvoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedPdf, setSelectedPdf] = useState(null);

    const fetchInvoices = async (page = 1, platform = 'all') => {
        try {
            setLoading(true);
            setError(null);

            const params = { page, limit: 20 };
            if (platform !== 'all') {
                params.platform = platform;
            }

            const response = await invoiceAPI.getAllInvoices(params);
            setInvoices(response.data.invoices);
            setPagination(response.data.pagination);
            setCurrentPage(response.data.pagination.currentPage);
        } catch (err) {
            const errorInfo = apiUtils.handleError(err);
            setError(errorInfo.message);
            console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices(1, activeTab);
    }, [activeTab]);

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
            fetchInvoices(newPage, activeTab);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const getPlatformColor = (platform) => {
        switch (platform) {
            case 'google_ads':
                return 'bg-blue-100 text-blue-800';
            case 'meta_ads':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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

    // Helpers: compute campaign metrics per invoice
    const getCampaignTotals = (invoice) => {
        const campaigns = invoice?.extractedData?.campaigns || [];
        return campaigns.reduce(
            (acc, c) => ({
                amount: acc.amount + (Number(c.amount) || 0),
                clicks: acc.clicks + (Number(c.clicks) || 0),
                impressions: acc.impressions + (Number(c.impressions) || 0)
            }),
            { amount: 0, clicks: 0, impressions: 0 }
        );
    };

    // Calculate tab statistics
    const tabStats = {
        all: invoices.length,
        google_ads: invoices.filter(inv => inv.platform === 'google_ads').length,
        meta_ads: invoices.filter(inv => inv.platform === 'meta_ads').length
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">Error: {error}</div>
                <button
                    onClick={() => fetchInvoices(1, activeTab)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[99rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Management</h1>
                        <p className="text-gray-600">View and manage all processed campaign data</p>
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
                            onClick={() => navigate('/bulk-delete')}
                            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Bulk Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <StatsCards invoices={invoices} pagination={pagination} />

            {/* Tabs */}
            <Tabs activeTab={activeTab} handleTabChange={handleTabChange} navigate={navigate} tabStats={tabStats} />

            {/* Invoices Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {invoices.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by uploading some PDF campaigns.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[
                                        { key: "invoice", label: "Campaigns" },
                                        { key: "date", label: "Date" },
                                        { key: "subtotal", label: "Subtotal" },
                                        { key: "tax", label: "GST" },
                                        { key: "total", label: "Total" },
                                        ...(activeTab !== "meta_ads"
                                            ? [
                                                { key: "clicks", label: "Clicks" },
                                                { key: "avg_cpc", label: "Avg CPC" },
                                            ]
                                            : []),
                                        ...(activeTab !== "google_ads"
                                            ? [{ key: "impressions", label: "Impressions" }]
                                            : []),
                                        ...(activeTab === "all"
                                            ? [{ key: "platform", label: "Platform" }]
                                            : []),
                                        { key: "actions", label: "Actions" },
                                    ].map((col) => (
                                        <th
                                            key={col.key}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {invoices.map((invoice) => {
                                    const totals = getCampaignTotals(invoice);
                                    const avgCpc = totals.clicks > 0 ? totals.amount / totals.clicks : null;

                                    const columns = [
                                        {
                                            key: "file",
                                            content: (
                                                <div className="flex items-center">
                                                    <div className="">
                                                        <div className="text-md font-medium text-gray-900 truncate max-w-xs">
                                                            {invoice.fileName.split('.pdf')[0]}
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        },
                                        {
                                            key: "date",
                                            content: invoice.extractedData?.invoiceDate
                                                ? formatDate(invoice.extractedData.invoiceDate)
                                                : "—",
                                        },
                                        {
                                            key: "subtotal",
                                            content: (
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(
                                                            invoice.extractedData.subtotal,
                                                            invoice.extractedData.currency
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Base amount</div>
                                                </div>
                                            ),
                                        },
                                        {
                                            key: "taxAmount",
                                            content: (
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(
                                                            invoice.extractedData.taxAmount,
                                                            invoice.extractedData.currency
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Tax amount</div>
                                                </div>
                                            ),
                                        },
                                        {
                                            key: "totalAmount",
                                            content: (
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(
                                                            invoice.extractedData.totalAmount,
                                                            invoice.extractedData.currency
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {(invoice.extractedData.campaigns?.length || 0)} campaigns
                                                    </div>
                                                </div>
                                            ),
                                        },
                                        ...(activeTab !== "meta_ads"
                                            ? [
                                                {
                                                    key: "clicks",
                                                    content: totals.clicks
                                                        ? totals.clicks.toLocaleString()
                                                        : "—",
                                                },
                                                {
                                                    key: "avgCpc",
                                                    content:
                                                        avgCpc != null
                                                            ? formatCurrency(avgCpc, invoice.extractedData.currency)
                                                            : "—",
                                                },
                                            ]
                                            : []),
                                        ...(activeTab !== "google_ads"
                                            ? [
                                                {
                                                    key: "impressions",
                                                    content: totals.impressions
                                                        ? totals.impressions.toLocaleString()
                                                        : "—",
                                                },
                                            ]
                                            : []),
                                        ...(activeTab === "all"
                                            ? [
                                                {
                                                    key: "platform",
                                                    content: (
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlatformColor(
                                                                invoice.platform
                                                            )}`}
                                                        >
                                                            {invoice.platform === "google_ads"
                                                                ? "Google Ads"
                                                                : invoice.platform === "meta_ads"
                                                                    ? "Meta Ads"
                                                                    : invoice.platform}
                                                        </span>
                                                    ),
                                                },
                                            ]
                                            : []),
                                        {
                                            key: "actions",
                                            content: (
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
                                            ),
                                        },
                                    ];

                                    return (
                                        <tr
                                            key={invoice._id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => navigate(`/invoice/${invoice._id}`)}
                                        >
                                            {columns.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                                >
                                                    {col.content}
                                                </td>
                                            ))}
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
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === pagination.totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing{" "}
                                <span className="font-medium">
                                    {((Number(currentPage || 1) - 1) * Number(pagination?.limit || 0)) + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium">
                                    {Math.min(
                                        Number(currentPage || 1) * Number(pagination?.limit || 0),
                                        Number(pagination?.totalInvoices || 0)
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium">{pagination?.totalInvoices || 0}</span> results
                            </p>
                        </div>

                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNum === currentPage
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Next</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
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
    );
};

export default GetInvoices;