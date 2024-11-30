'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const STORAGE_KEY_PREFIX = 'legal_lens_';

const PDFUploader = ({ onFileChange }) => {
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const clearPreviousStorage = () => {
    // Clear all previous document data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  };

  const extractText = async (arrayBuffer) => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    try {
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const totalPages = pdf.numPages;
      
      // Store total pages
      localStorage.setItem(`${STORAGE_KEY_PREFIX}total_pages`, totalPages.toString());
      
      // Extract text for each page
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ').trim();
        
        // Store each page's text separately
        localStorage.setItem(`${STORAGE_KEY_PREFIX}page_${i}_text`, pageText);
        
        // Log progress
        console.log(`Processed page ${i} of ${totalPages}`);
      }
      
      return totalPages;
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    setError(null);
    const file = acceptedFiles[0];

    if (!file) {
      setError('Please select a PDF file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB.');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }

    setIsProcessing(true);
    try {
      // Create URL for PDF viewer
      const fileUrl = URL.createObjectURL(file);

      // Clear previous document data
      clearPreviousStorage();

      // Extract and store text
      const buffer = await file.arrayBuffer();
      const totalPages = await extractText(buffer);
      
      console.log(`Successfully processed all ${totalPages} pages`);
      onFileChange(fileUrl);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError('Error processing PDF: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  return (
    <div className="w-full fade-in">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto">
              <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium">Processing document<span className="loading-dots"></span></p>
              <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop your PDF here' : 'Upload your legal document'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop your PDF file here, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Maximum file size: 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
