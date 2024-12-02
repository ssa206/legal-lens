'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import SampleDocuments from './SampleDocuments';

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

  const handleSampleDocument = async (path) => {
    setError(null);
    setIsProcessing(true);
    
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error('Failed to load sample document');
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Clear previous document data
      clearPreviousStorage();
      
      // Extract and store text
      const totalPages = await extractText(arrayBuffer);
      
      console.log(`Successfully processed all ${totalPages} pages`);
      onFileChange(path);
    } catch (error) {
      console.error('Error processing sample PDF:', error);
      setError('Error loading sample document: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  return (
    <div className="text-center">
      {isProcessing ? (
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Processing document...</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {/* Dropzone area */}
            <div
              {...getRootProps()}
              className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-2">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  />
                </svg>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Drop your PDF here or click to upload</p>
                  <p>File size limit: 10MB</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 text-red-500 text-sm">{error}</div>
            )}
          </div>

          {/* Sample documents section - outside of dropzone */}
          <div onClick={e => e.stopPropagation()}>
            <SampleDocuments onSelect={handleSampleDocument} />
          </div>
        </>
      )}
    </div>
  );
};

export default PDFUploader;
