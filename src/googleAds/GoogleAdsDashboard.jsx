import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PdfUploader from './components/PdfUploader';
import GetInvoices from './components/GetInvoices';
import InvoiceDetail from './components/InvoiceDetail';
import GoogleAdsInvoices from './components/GoogleAdsInvoices';
import MetaAdsInvoices from './components/MetaAdsInvoices';
import BulkDownloadManager from './components/BulkDownloadManager';
import BulkDeleteManager from './components/BulkDeleteManager';

function GoogleAdsDashboard() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Routes>
                <Route path="/" element={
                    <div className="flex flex-col gap-10 items-center justify-center py-8">
                        <GetInvoices />
                    </div>
                } />
                <Route path="/upload" element={<PdfUploader />} />
                <Route path="/invoice/:id" element={<InvoiceDetail />} />
                <Route path="/google-ads" element={<GoogleAdsInvoices />} />
                <Route path="/meta-ads" element={<MetaAdsInvoices />} />
                <Route path="/bulk-download" element={<BulkDownloadManager />} />
                <Route path="/bulk-delete" element={<BulkDeleteManager />} />
            </Routes>
        </div>
    );
}

export default GoogleAdsDashboard;
