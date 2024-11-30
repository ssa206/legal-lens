'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

// Constants for size limits
const MAX_PDF_SIZE_MB = 10;
const MAX_STORAGE_SIZE_MB = 5; // Conservative estimate for localStorage limit
const BYTES_PER_MB = 1024 * 1024;
const STORAGE_KEY = 'legal_lens_current_doc';

/**
 * Storage utility functions
 */
const storageUtils = {
  // Get size of all data in localStorage
  getTotalStorageSize: () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length * 2; // multiply by 2 for UTF-16 encoding
      }
    }
    return total;
  },

  // Get available storage space in bytes
  getAvailableSpace: () => {
    const totalSize = storageUtils.getTotalStorageSize();
    return (MAX_STORAGE_SIZE_MB * BYTES_PER_MB) - totalSize;
  },

  // Clear current document from storage
  clearCurrentDocument: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Store text for current document
  storeText: (text) => {
    try {
      // Clear any existing document first
      storageUtils.clearCurrentDocument();
      
      // Try to store the new text
      localStorage.setItem(STORAGE_KEY, text);
      return true;
    } catch (e) {
      console.error('Storage failed:', e);
      return false;
    }
  },

  // Get current document text
  getCurrentText: () => {
    return localStorage.getItem(STORAGE_KEY);
  }
};

/**
 * PDFUploader Component
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onPDFUpload - Callback function called with uploaded PDF file
 * @param {Function} props.onTextExtracted - Callback function called with extracted text
 * 
 * @returns {JSX.Element} Rendered PDF uploader component
 */
const PDFUploader = ({ onPDFUpload, onTextExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const extractText = async (arrayBuffer) => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    
    try {
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let text = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      
      return text.trim();
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setError(null);
      const file = acceptedFiles[0];
      
      // Check file size
      if (file.size > MAX_PDF_SIZE_MB * BYTES_PER_MB) {
        setError(`PDF file size must be less than ${MAX_PDF_SIZE_MB}MB`);
        return;
      }

      setIsProcessing(true);
      
      try {
        // Create URL for PDF viewer
        const fileUrl = URL.createObjectURL(file);
        onPDFUpload(fileUrl);

        // Extract text
        const buffer = await file.arrayBuffer();
        const text = await extractText(buffer);
        
        // Calculate text size
        const textSizeInBytes = new Blob([text]).size;
        console.log(`Extracted text size: ${(textSizeInBytes / BYTES_PER_MB).toFixed(2)} MB`);

        // Check if we have enough space after clearing current document
        const availableSpace = storageUtils.getAvailableSpace() + 
          (storageUtils.getCurrentText()?.length * 2 || 0); // Add space that will be freed
        
        if (textSizeInBytes > availableSpace) {
          setError('Not enough storage space. The extracted text is too large.');
          return;
        }

        // Store the text (this will automatically clear the previous document)
        if (!storageUtils.storeText(text)) {
          setError('Failed to store text. The file might be too large.');
          return;
        }

        console.log('Successfully stored new document text');
        onTextExtracted(text);
      } catch (error) {
        console.error('Error processing PDF:', error);
        setError('Error processing PDF: ' + error.message);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [onPDFUpload, onTextExtracted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`glass-panel rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200 ease-out
          ${isDragActive ? 'ring-2 ring-[--primary] scale-[1.01]' : 'hover:scale-[1.01]'}
          ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[--primary] bg-opacity-10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[--primary]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          
          {isProcessing ? (
            <div className="animate-pulse">
              <p className="text-lg font-medium text-[--gray-300]">Processing document...</p>
              <p className="text-sm text-[--gray-300] mt-2">This may take a moment</p>
            </div>
          ) : isDragActive ? (
            <div className="animate-fade-in">
              <p className="text-lg font-medium text-[--primary]">Drop your document here</p>
              <p className="text-sm text-[--gray-300] mt-2">Release to upload</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-lg font-medium">Upload your document</p>
                <p className="text-sm text-[--gray-300] mt-2">
                  Drag and drop your PDF here, or click to browse
                </p>
              </div>
              <div className="text-xs text-[--gray-300] mt-4">
                Maximum file size: {MAX_PDF_SIZE_MB}MB
              </div>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-[--error] animate-fade-in">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-[--error] mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium">Upload Failed</h3>
              <p className="text-xs text-[--gray-300] mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
