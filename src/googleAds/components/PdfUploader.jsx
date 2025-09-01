import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader, Cloud, Trash2, AlertTriangle, Clock, Info, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { pdfAPI, apiUtils } from '../api';
import io from 'socket.io-client';

const PdfUploader = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLog, setUploadLog] = useState([]);
  const [socket, setSocket] = useState(null);
  const [currentUploadId, setCurrentUploadId] = useState(null);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    duplicates: 0,
    processing: 0
  });
  const logEndRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io('https://ads.api.d0s369.co.in' || 'https://ads.api2.d0s369.co.in' || 'http://localhost:7080');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      addToLog('info', 'Connected to upload server');
    });

    newSocket.on('upload:start', (data) => {
      setCurrentUploadId(data.uploadId);
      setUploadStats(prev => ({ ...prev, total: data.totalFiles }));
      addToLog('info', `Upload started - ${data.totalFiles} files to process`);
    });

    newSocket.on('upload:progress', (data) => {
      if (data.uploadId === currentUploadId) {
        updateFileProgress(data);
        addToLog(data.status, data.message, data.fileName);

        if (data.progress !== undefined) {
          setUploadProgress(data.progress);
        }

        // Update stats based on status
        if (data.status === 'completed') {
          setUploadStats(prev => ({ ...prev, completed: prev.completed + 1, processing: prev.processing - 1 }));
        } else if (data.status === 'error') {
          setUploadStats(prev => ({ ...prev, failed: prev.failed + 1, processing: prev.processing - 1 }));
        } else if (data.status === 'duplicate') {
          setUploadStats(prev => ({ ...prev, duplicates: prev.duplicates + 1, processing: prev.processing - 1 }));
        } else if (data.status === 'processing' || data.status === 'processing_zip') {
          setUploadStats(prev => ({ ...prev, processing: prev.processing + 1 }));
        }
      }
    });

    newSocket.on('upload:complete', (data) => {
      if (data.uploadId === currentUploadId) {
        addToLog('success', `Upload completed: ${data.successful} successful, ${data.failed} failed, ${data.duplicates} duplicates`);
        setUploading(false);
        setUploadProgress(100);
      }
    });

    newSocket.on('upload:error', (data) => {
      addToLog('error', `Upload failed: ${data.message}`);
      setUploading(false);
    });

    newSocket.on('upload:cancelled', (data) => {
      if (data.uploadId === currentUploadId) {
        addToLog('info', `Upload cancelled by user`);
        setUploading(false);
      }
    });

    newSocket.on('upload:paused', (data) => {
      if (data.uploadId === currentUploadId) {
        addToLog('info', `Upload paused`);
      }
    });

    newSocket.on('upload:resumed', (data) => {
      if (data.uploadId === currentUploadId) {
        addToLog('info', `Upload resumed`);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [currentUploadId]);

  // Auto-scroll log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [uploadLog]);

  const addToLog = (type, message, fileName = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setUploadLog(prev => [...prev, {
      id: Date.now() + Math.random(),
      timestamp,
      type,
      message,
      fileName
    }]);
  };

  const updateFileProgress = (data) => {
    setFiles(prev => prev.map(file => {
      if (file.file.name === data.fileName) {
        return {
          ...file,
          status: data.status,
          progress: data.progress || 0,
          message: data.message,
          error: data.error,
          reason: data.reason
        };
      }
      return file;
    }));
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2, 11),
      status: 'pending',
      progress: 0,
      message: 'Ready to upload'
    }));

    setFiles(prev => [...prev, ...newFiles]);
    addToLog('info', `Added ${acceptedFiles.length} file(s) to upload queue`);
    toast.success(`${acceptedFiles.length} file(s) added`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip']
    },
    multiple: true,
    maxFiles: 200,
    maxSize: 500 * 1024 * 1024 // 500MB
  });

  const removeFile = async (fileId) => {
    const fileToRemove = files.find(f => f.id === fileId);

    if (fileToRemove && fileToRemove.status === 'completed') {
      // If file was successfully uploaded, delete it from server too
      try {
        await pdfAPI.deletePdf(fileToRemove.file.name);
        addToLog('info', `Deleted uploaded file: ${fileToRemove.file.name}`);
      } catch (error) {
        console.error('Error deleting file from server:', error);
        addToLog('error', `Failed to delete file from server: ${fileToRemove.file.name}`);
      }
    }

    setFiles(prev => prev.filter(f => f.id !== fileId));
    addToLog('info', `Removed file from queue: ${fileToRemove?.file.name}`);
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadLog([]);

    // Update all files to uploading status
    setFiles(prev => prev.map(file => ({
      ...file,
      status: 'uploading',
      progress: 0,
      message: 'Starting upload...'
    })));

    const formData = new FormData();

    files.forEach(({ file }) => {
      formData.append('pdfs', file);
    });

    try {
      const response = await pdfAPI.uploadPdfs(formData);

      // The WebSocket will handle all the real-time updates
      // This is just a fallback for the final response
      if (response.data.successful > 0) {
        toast.success(`Successfully uploaded ${response.data.successful} file(s)`);
      }

      if (response.data.duplicates > 0) {
        toast.warning(`${response.data.duplicates} duplicate file(s) detected and skipped`);
      }

      if (response.data.failed > 0) {
        toast.error(`${response.data.failed} file(s) failed to upload`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      const errorInfo = apiUtils.handleError(error);
      toast.error(`Upload failed: ${errorInfo.message}`);
      addToLog('error', `Upload failed: ${errorInfo.message}`);

      // Mark all files as failed
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'error',
        progress: 0,
        error: errorInfo.message
      })));

      setUploading(false);
    }
  };

  const cancelUpload = async () => {
    if (currentUploadId) {
      try {
        await pdfAPI.cancelUpload(currentUploadId);
        addToLog('info', `Cancelling upload...`);
      } catch (error) {
        console.error('Error cancelling upload:', error);
        addToLog('error', `Failed to cancel upload`);
      }
    }
  };

  const clearAll = async () => {
    // Delete all completed files from server
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length > 0) {
      try {
        const fileNames = completedFiles.map(f => f.file.name);
        await pdfAPI.bulkDeletePdfs(fileNames);
        addToLog('info', `Deleted ${completedFiles.length} uploaded files from server`);
      } catch (error) {
        console.error('Error bulk deleting files from server:', error);
        addToLog('error', `Failed to delete some files from server`);
      }
    }

    setFiles([]);
    setUploadProgress(0);
    setUploadLog([]);
    setUploadStats({
      total: 0,
      completed: 0,
      failed: 0,
      duplicates: 0,
      processing: 0
    });
    addToLog('info', `Cleared all files from queue`);
  };

  const deleteCompletedFiles = async () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length === 0) {
      toast.info('No completed files to delete');
      return;
    }

    try {
      const fileNames = completedFiles.map(f => f.file.name);
      await pdfAPI.bulkDeletePdfs(fileNames);

      // Remove completed files from the list
      setFiles(prev => prev.filter(f => f.status !== 'completed'));

      addToLog('info', `Deleted ${completedFiles.length} completed files from server`);
      toast.success(`Deleted ${completedFiles.length} completed files`);
    } catch (error) {
      console.error('Error deleting completed files:', error);
      addToLog('error', `Failed to delete completed files`);
      toast.error('Failed to delete completed files');
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'zip') {
      return <Upload className="h-5 w-5 text-purple-500 mr-3" />;
    }
    return <FileText className="h-5 w-5 text-gray-500 mr-3" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'uploading':
      case 'processing':
      case 'processing_zip':
        return <Loader className="h-3 w-3 mr-1 animate-spin" />;
      case 'completed':
      case 'zip_extracted':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'duplicate':
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      default:
        return <Info className="h-3 w-3 mr-1" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'uploading':
      case 'processing':
      case 'processing_zip':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'zip_extracted':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'duplicate':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Ready';
      case 'uploading':
        return 'Uploading';
      case 'processing':
        return 'Processing';
      case 'processing_zip':
        return 'Extracting ZIP';
      case 'zip_extracted':
        return 'ZIP Extracted';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      case 'duplicate':
        return 'Duplicate';
      default:
        return 'Unknown';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'duplicate':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            PDF Invoice Data Extraction
          </h1>
          <p className="text-gray-600 mt-1">
            Upload and process PDF invoices with real-time progress tracking
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload Area and File List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Simple Upload Area */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Upload Files
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Drag & drop PDF or ZIP files for processing
                </p>
              </div>

              <div
                {...getRootProps()}
                className={`p-8 text-center cursor-pointer transition-colors ${isDragActive
                    ? 'bg-blue-50 border-2 border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                  }`}
              >
                <input {...getInputProps()} />

                <div className="mb-4">
                  <Cloud className="mx-auto h-12 w-12 text-gray-400" />
                </div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop files here' : 'Upload PDF or ZIP Files'}
                </h3>

                <p className="text-gray-600 mb-4">
                  Support for up to 200 files, 50MB each
                </p>

                <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors">
                  <Upload className="inline h-4 w-4 mr-2" />
                  Choose Files
                </button>
              </div>
            </div>

            {/* Simple Upload Progress */}
            {uploading && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Upload Progress
                    </h3>
                    <button
                      onClick={cancelUpload}
                      className="flex items-center px-3 py-1 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{uploadStats.total}</div>
                      <div className="text-sm text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{uploadStats.completed}</div>
                      <div className="text-sm text-gray-500">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{uploadStats.processing}</div>
                      <div className="text-sm text-gray-500">Processing</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{uploadStats.duplicates}</div>
                      <div className="text-sm text-gray-500">Duplicates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{uploadStats.failed}</div>
                      <div className="text-sm text-gray-500">Failed</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-gray-700">
                      <span>Overall Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Simple File List */}
            {files.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        File Queue
                      </h3>
                      <p className="text-sm text-gray-600">
                        {files.length} file{files.length !== 1 ? 's' : ''} ready for processing
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={clearAll}
                        className="text-gray-600 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <Trash2 className="inline h-4 w-4 mr-2" />
                        Clear All
                      </button>
                      {files.filter(f => f.status === 'completed').length > 0 && (
                        <button
                          onClick={deleteCompletedFiles}
                          className="text-red-600 px-4 py-2 text-sm border border-red-300 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="inline h-4 w-4 mr-2" />
                          Delete Completed
                        </button>
                      )}
                      <button
                        onClick={uploadFiles}
                        disabled={uploading}
                        className="bg-green-600 text-white px-6 py-2 text-sm rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
                      >
                        {uploading ? (
                          <>
                            <Loader className="inline h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="inline h-4 w-4 mr-2" />
                            Start Upload
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                      <div className="col-span-6">File Name</div>
                      <div className="col-span-2">Size</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-1">Progress</div>
                      <div className="col-span-1">Action</div>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {files.map(({ id, file, status, progress, message, error, reason }) => (
                      <div key={id} className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* File Name */}
                          <div className="col-span-6">
                            <div className="flex items-center">
                              {getFileIcon(file.name)}
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                {file.name.endsWith('.zip') && (
                                  <p className="text-xs text-purple-600 mt-1">
                                    ZIP Archive
                                  </p>
                                )}
                                {status === 'duplicate' && reason && (
                                  <p className="text-xs text-yellow-600 mt-1">
                                    {reason}
                                  </p>
                                )}
                                {error && (
                                  <p className="text-xs text-red-600 mt-1">
                                    {error}
                                  </p>
                                )}
                                {message && status !== 'pending' && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* File Size */}
                          <div className="col-span-2">
                            <span className="text-sm text-gray-600">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>

                          {/* Status */}
                          <div className="col-span-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {getStatusIcon(status)}
                              {getStatusText(status)}
                            </span>
                          </div>

                          {/* Progress */}
                          <div className="col-span-1">
                            {status === 'uploading' || status === 'processing' || status === 'processing_zip' ? (
                              <span className="text-sm font-medium text-blue-600">
                                {progress}%
                              </span>
                            ) : status === 'completed' || status === 'zip_extracted' ? (
                              <span className="text-sm font-medium text-green-600">
                                100%
                              </span>
                            ) : status === 'pending' ? (
                              <span className="text-sm text-gray-400">
                                -
                              </span>
                            ) : status === 'error' ? (
                              <span className="text-sm font-medium text-red-600">
                                Failed
                              </span>
                            ) : status === 'duplicate' ? (
                              <span className="text-sm font-medium text-yellow-600">
                                Skipped
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                -
                              </span>
                            )}
                          </div>

                          {/* Action */}
                          <div className="col-span-1">
                            <button
                              onClick={() => removeFile(id)}
                              className="text-gray-400 p-1 hover:text-red-500 rounded"
                              disabled={uploading}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar for Uploading Files */}
                        {(status === 'uploading' || status === 'processing' || status === 'processing_zip') && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Simple Upload Log */}
          <div className="max-h-[520px] lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 h-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Activity Log
                    </h3>
                    <p className="text-sm text-gray-600">
                      Real-time processing updates
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadLog([])}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    disabled={uploading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 h-96 overflow-y-auto bg-gray-50">
                {uploadLog.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No activity yet</p>
                    <p className="text-xs mt-1">Upload logs will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {uploadLog.map((log) => (
                      <div key={log.id} className="flex items-start space-x-2 p-3 bg-white rounded border border-gray-200">
                        {getLogIcon(log.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-gray-500">{log.timestamp}</p>
                            {log.fileName && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {log.fileName.length > 15 ? log.fileName.substring(0, 15) + '...' : log.fileName}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-900">{log.message}</p>
                          {log.fileName && (
                            <p className="text-xs text-gray-600 font-mono mt-1 break-all">{log.fileName}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfUploader;
