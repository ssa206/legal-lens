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
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          w-full p-8 border-2 border-dashed rounded-2xl
          transition-colors duration-200 ease-in-out cursor-pointer
          flex flex-col items-center justify-center text-center
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 bg-opacity-10' 
            : 'border-[--gray-200] hover:border-blue-500 hover:bg-[--gray-50]'
          }
          ${isProcessing ? 'opacity-70 cursor-wait' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="mb-4">
          <svg 
            className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-[--gray-300]'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
        
        <p className="text-lg font-medium mb-2">
          {isProcessing 
            ? 'Processing document...' 
            : isDragActive 
              ? 'Drop your PDF here' 
              : 'Upload your legal document'
          }
        </p>
        
        <p className="text-sm text-[--gray-400] mb-2">
          {isProcessing 
            ? 'Extracting text from document...'
            : 'Drag and drop your PDF file here, or click to select'
          }
        </p>
        
        <p className="text-xs text-[--gray-300]">
          Maximum file size: 10MB
        </p>

        {error && (
          <div className="mt-4 text-sm text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUploader;
