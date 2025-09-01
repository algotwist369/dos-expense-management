import axios from 'axios';

// API Base URL
const API_BASE_URL = 'https://ads.api.d0s369.co.in/api' || 'https://ads.api2.d0s369.co.in/api' || 'http://localhost:7080/api';
// const API_BASE_URL = 'http://localhost:7080/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 300000, // 5 minutes for large operations
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('API Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

// Invoice Management APIs
export const invoiceAPI = {
    // Get all invoices with pagination and filtering
    getAllInvoices: (params = {}) => {
        const { page = 1, limit = 20, platform, startDate, endDate, campaignName, sortBy = 'processedAt', sortOrder = 'desc' } = params;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy,
            sortOrder,
        });

        if (platform && platform !== 'all') queryParams.append('platform', platform);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        if (campaignName) queryParams.append('campaignName', campaignName);

        return api.get(`/invoices?${queryParams.toString()}`);
    },

    // Get invoices by platform
    getInvoicesByPlatform: (platform, params = {}) => {
        const { page = 1, limit = 20 } = params;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        return api.get(`/invoices/platform/${platform}?${queryParams.toString()}`);
    },

    // Get single invoice by ID
    getInvoiceById: (id) => {
        return api.get(`/invoices/${id}`);
    },

    // Delete single invoice
    deleteInvoice: (id) => {
        return api.delete(`/invoices/${id}`);
    },

    // Get analytics summary
    getAnalyticsSummary: (params = {}) => {
        const { platform, startDate, endDate } = params;
        const queryParams = new URLSearchParams();

        if (platform) queryParams.append('platform', platform);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        return api.get(`/invoices/analytics/summary?${queryParams.toString()}`);
    },

    // Get overall totals
    getOverallTotals: (params = {}) => {
        const { platform, startDate, endDate } = params;
        const queryParams = new URLSearchParams();

        if (platform) queryParams.append('platform', platform);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);

        return api.get(`/invoices/totals?${queryParams.toString()}`);
    },

    // Bulk delete preview
    previewBulkDelete: (data) => {
        return api.post('/invoices/bulk-delete/preview', data);
    },

    // Bulk delete invoices
    bulkDeleteInvoices: (data) => {
        return api.delete('/invoices/bulk-delete', { data });
    },
};

// PDF API endpoints
const pdfAPI = {
    // Upload PDFs
    uploadPdfs: (formData) => api.post('/pdf/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Get processing status
    getProcessingStatus: (fileName) => api.get(`/pdf/status/${encodeURIComponent(fileName)}`),

    // Download PDF
    downloadPdf: (fileName) => api.get(`/pdf/download/${encodeURIComponent(fileName)}`, {
        responseType: 'blob'
    }),

    // Get PDF info
    getPdfInfo: (fileName) => api.get(`/pdf/info/${encodeURIComponent(fileName)}`),

    // View PDF (get blob for iframe)
    viewPdf: (fileName) => api.get(`/pdf/view/${encodeURIComponent(fileName)}`, {
        responseType: 'blob'
    }),

    // Bulk download PDFs by platform
    bulkDownloadPdfs: (platform, format = 'zip') => api.get(`/pdf/bulk-download/${platform}?format=${format}`, {
        responseType: 'blob'
    }),

    // Get bulk download list (for individual file downloads)
    getBulkDownloadList: (platform) => api.get(`/pdf/bulk-download/${platform}?format=list`),

    // Get PDFs by platform for bulk operations
    getPdfsByPlatform: (platform, page = 1, limit = 50) => api.get(`/pdf/platform/${platform}?page=${page}&limit=${limit}`),

    // Delete PDF file
    deletePdf: (fileName) => api.delete(`/pdf/delete/${encodeURIComponent(fileName)}`),

    // Bulk delete PDFs
    bulkDeletePdfs: (fileNames) => api.delete('/pdf/bulk-delete', { data: { fileNames } }),

    // Cancel ongoing upload
    cancelUpload: (uploadId) => api.post(`/pdf/cancel-upload/${uploadId}`),

    // Pause ongoing upload
    pauseUpload: (uploadId) => api.post(`/pdf/pause-upload/${uploadId}`),

    // Resume paused upload
    resumeUpload: (uploadId) => api.post(`/pdf/resume-upload/${uploadId}`)
};

// Health check API
export const healthAPI = {
    checkHealth: () => {
        return api.get('/health');
    },
};

// Utility functions
export const apiUtils = {
    // Create download link for blob
    createDownloadLink: (blob, fileName) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    // Handle API errors
    handleError: (error) => {
        if (error.response) {
            // Server responded with error status
            return {
                message: error.response.data?.error || error.response.data?.message || 'Server error occurred',
                status: error.response.status,
                data: error.response.data,
            };
        } else if (error.request) {
            // Request was made but no response received
            return {
                message: 'No response from server. Please check your connection.',
                status: 0,
            };
        } else {
            // Something else happened
            return {
                message: error.message || 'An unexpected error occurred',
                status: 0,
            };
        }
    },

    // Format date for API
    formatDateForAPI: (date) => {
        if (!date) return null;
        if (typeof date === 'string') return date;
        return date.toISOString();
    },

    // Parse API date
    parseAPIDate: (dateString) => {
        if (!dateString) return null;
        return new Date(dateString);
    },
};

// Export default api instance for direct use if needed
export default api;

// Export pdfAPI (invoiceAPI is already exported above)
export { pdfAPI };


export const BASE_API_URL = 'https://ads.api.d0s369.co.in/api' || 'https://ads.api2.d0s369.co.in/api' || 'http://localhost:7080/api';
