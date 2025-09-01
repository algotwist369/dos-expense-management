import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Download, ExternalLink } from 'lucide-react';
import PdfViewer from './PdfViewer';
import { invoiceAPI, pdfAPI, apiUtils } from '../api';

const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPdf, setSelectedPdf] = useState(null);

    useEffect(() => {
        const fetchInvoiceDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await invoiceAPI.getInvoiceById(id);
                setInvoice(response.data.invoice || response.data);
            } catch (err) {
                const errorInfo = apiUtils.handleError(err);
                setError(errorInfo.message);
                console.error('Error fetching invoice detail:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInvoiceDetail();
        }
    }, [id]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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

    const handleViewPdf = () => {
        if (invoice?.pdfUrl) {
            setSelectedPdf({
                url: invoice.pdfUrl,
                fileName: invoice.fileName
            });
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const response = await pdfAPI.downloadPdf(invoice.fileName);
            apiUtils.createDownloadLink(response.data, invoice.fileName);
        } catch (error) {
            console.error('Download failed:', error);
            const errorInfo = apiUtils.handleError(error);
            alert(`Download failed: ${errorInfo.message}`);
        }
    };

    const handleOpenInNewTab = () => {
        if (invoice?.pdfUrl) {
            window.open(invoice.pdfUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-[99rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-lg text-gray-600">Loading invoice details...</span>
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
                                <h3 className="text-sm font-medium text-red-800">Error loading invoice</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => navigate('/')}
                                        className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                                    >
                                        Back to Invoices
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-[99rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900">Invoice not found</h3>
                        <p className="mt-2 text-gray-600">The invoice you're looking for doesn't exist.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                            Back to Invoices
                        </button>
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
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Invoices
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
                            <p className="mt-2 text-gray-600">
                                Comprehensive view of invoice {invoice.extractedData?.invoiceNumber}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            {invoice.pdfUrl && (
                                <>
                                    <button
                                        onClick={handleViewPdf}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View PDF
                                    </button>
                                    <button
                                        onClick={handleDownloadPdf}
                                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 flex items-center"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF
                                    </button>
                                    <button
                                        onClick={handleOpenInNewTab}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 flex items-center"
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        External
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Invoice Status and Platform */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Status</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                    {invoice.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Platform</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlatformColor(invoice.platform)}`}>
                                    {invoice.platform === 'google_ads' ? 'Google Ads' : 
                                     invoice.platform === 'meta_ads' ? 'Meta Ads' : invoice.platform}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {formatCurrency(invoice.extractedData?.totalAmount, invoice.extractedData?.currency)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Invoice Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Invoice Information */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Invoice Information</h3>
                            </div>
                            <div className="px-6 py-4">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoice.extractedData?.invoiceNumber}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Invoice Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatDate(invoice.extractedData?.invoiceDate)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Account ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoice.extractedData?.accountId}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Account Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoice.extractedData?.accountName || 'N/A'}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoice.extractedData?.location || 'N/A'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Billing Period */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Billing Period</h3>
                            </div>
                            <div className="px-6 py-4">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatDate(invoice.extractedData?.billingPeriod?.startDate)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">End Date</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatDate(invoice.extractedData?.billingPeriod?.endDate)}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Financial Summary</h3>
                            </div>
                            <div className="px-6 py-4">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
                                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                                            {formatCurrency(invoice.extractedData?.subtotal, invoice.extractedData?.currency)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Tax Amount</dt>
                                        <dd className="mt-1 text-lg font-semibold text-gray-900">
                                            {formatCurrency(invoice.extractedData?.taxAmount, invoice.extractedData?.currency)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                                        <dd className="mt-1 text-lg font-semibold text-blue-600">
                                            {formatCurrency(invoice.extractedData?.totalAmount, invoice.extractedData?.currency)}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Campaigns */}
                        {invoice.extractedData?.campaigns && invoice.extractedData.campaigns.length > 0 && (
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Campaigns ({invoice.extractedData.campaigns.length})</h3>
                                </div>
                                <div className="px-6 py-4">
                                    <div className="space-y-4">
                                        {invoice.extractedData.campaigns.map((campaign, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-medium text-gray-900">{campaign.campaignName}</h4>
                                                    <span className="text-sm font-semibold text-blue-600">
                                                        {formatCurrency(campaign.amount, invoice.extractedData?.currency)}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                                    {campaign.clicks && (
                                                        <div>
                                                            <span className="text-gray-500">Clicks:</span>
                                                            <span className="ml-2 font-medium text-gray-900">{campaign.clicks.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    {campaign.cpc && (
                                                        <div>
                                                            <span className="text-gray-500">CPC:</span>
                                                            <span className="ml-2 font-medium text-gray-900">
                                                                {formatCurrency(campaign.cpc, invoice.extractedData?.currency)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {campaign.impressions && (
                                                        <div>
                                                            <span className="text-gray-500">Impressions:</span>
                                                            <span className="ml-2 font-medium text-gray-900">{campaign.impressions.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payments */}
                        {invoice.extractedData?.payments && invoice.extractedData.payments.length > 0 && (
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Payments ({invoice.extractedData.payments.length})</h3>
                                </div>
                                <div className="px-6 py-4">
                                    <div className="space-y-4">
                                        {invoice.extractedData.payments.map((payment, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Payment Method:</span>
                                                        <span className="ml-2 font-medium text-gray-900">{payment.method || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Amount:</span>
                                                        <span className="ml-2 font-medium text-gray-900">
                                                            {formatCurrency(payment.amount, invoice.extractedData?.currency)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - File Information & Metadata */}
                    <div className="space-y-6">
                        {/* File Information */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">File Information</h3>
                            </div>
                            <div className="px-6 py-4">
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">File Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900 break-all">{invoice.fileName}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">File Path</dt>
                                        <dd className="mt-1 text-sm text-gray-500 break-all">{invoice.filePath}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Currency</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{invoice.extractedData?.currency}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Processing Information */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Processing Information</h3>
                            </div>
                            <div className="px-6 py-4">
                                <dl className="space-y-4">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created At</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatDate(invoice.createdAt)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Processed At</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatDate(invoice.processedAt)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{formatDate(invoice.updatedAt)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Invoice ID</dt>
                                        <dd className="mt-1 text-sm text-gray-500 font-mono">{invoice._id}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                            </div>
                            <div className="px-6 py-4 space-y-3">
                                {invoice.pdfUrl && (
                                    <>
                                        <button
                                            onClick={handleViewPdf}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View PDF
                                        </button>
                                        <button
                                            onClick={handleDownloadPdf}
                                            className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 flex items-center justify-center"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download PDF
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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

export default InvoiceDetail;
