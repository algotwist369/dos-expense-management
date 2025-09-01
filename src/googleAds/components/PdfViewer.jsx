import React, { useState, useEffect, useCallback } from 'react';
import { Download, X, Eye, FileText, AlertCircle, RefreshCw } from 'lucide-react';

const PdfViewer = ({ pdfUrl, fileName, onClose, showDownload = true }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);

  const loadPdf = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
        credentials: 'omit', // Don't send cookies for cross-origin requests
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Check for specific Meta Ads error
        if (errorData.error === 'PDF file not available locally') {
          throw new Error('This Meta Ads invoice was processed on a different server and is not available locally. You can still view the extracted data and download functionality may work. Please contact the administrator if you need the original PDF file.');
        }

        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const blob = await response.blob();

      if (blob.type !== 'application/pdf') {
        throw new Error('File is not a valid PDF');
      }

      setPdfBlob(blob);
      setLoading(false);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError(err.message || 'Failed to load PDF. Please try downloading the file instead.');
      setLoading(false);
    }
  }, [pdfUrl]);

  useEffect(() => {
    if (pdfUrl) {
      loadPdf();
    }
  }, [pdfUrl, loadPdf]);

  const handleDownload = async () => {
    try {
      if (pdfBlob) {
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'invoice.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback to direct download
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'invoice.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
      setError('Download failed. Please try again.');
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError('Failed to display PDF in viewer');
  };

  // Check if iframe loaded successfully after a timeout
  useEffect(() => {
    if (!loading && !error && pdfBlob) {
      const timer = setTimeout(() => {
        const iframe = document.querySelector('iframe');
        if (iframe && iframe.contentDocument && iframe.contentDocument.body.innerHTML === '') {
          // Iframe loaded but content is empty, show fallback
          const fallbackContainer = document.getElementById('fallback-container');
          if (fallbackContainer) {
            fallbackContainer.style.display = 'flex';
          }
        }
      }, 3000); // Wait 3 seconds for iframe to load

      return () => clearTimeout(timer);
    }
  }, [loading, error, pdfBlob]);

  const handleRetry = () => {
    loadPdf();
  };

  const handleOpenInNewTab = () => {
    if (pdfBlob) {
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    } else {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {fileName || 'PDF Viewer'}
              </h3>
              <p className="text-sm text-gray-500">
                Viewing PDF document
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {showDownload && (
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md mx-auto p-6">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Loading Error</h3>
                <p className="text-gray-600 mb-4 text-sm">{error}</p>
                <div className="text-xs text-gray-500 mb-4">
                  <p>This could be due to:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>File not found on server</li>
                    <li>Network connectivity issues</li>
                    <li>CORS policy restrictions</li>
                    <li>File corruption</li>
                  </ul>
                </div>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={handleRetry}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Retry</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Instead</span>
                  </button>
                  <button
                    onClick={handleOpenInNewTab}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Open in New Tab</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && pdfBlob && (
            <iframe
              src={URL.createObjectURL(pdfBlob)}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={fileName || 'PDF Document'}
            />
          )}

          {!loading && !error && !pdfBlob && (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={fileName || 'PDF Document'}
            />
          )}

          {/* Fallback if iframe fails */}
          {!loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50" style={{ display: 'none' }} id="fallback-container">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">PDF viewer failed to load. Try opening in a new tab.</p>
                <button
                  onClick={handleOpenInNewTab}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mx-auto"
                >
                  <Eye className="h-4 w-4" />
                  <span>Open in New Tab</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
