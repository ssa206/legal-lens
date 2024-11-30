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
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        {isProcessing ? (
          <p>Processing PDF...</p>
        ) : isDragActive ? (
          <p>Drop the PDF here...</p>
        ) : (
          <p>Drag and drop a PDF here, or click to select one (max {MAX_PDF_SIZE_MB}MB)</p>
        )}
      </div>
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
