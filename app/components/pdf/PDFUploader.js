'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

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

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setIsProcessing(true);
      
      try {
        // Create a URL for the PDF file
        const fileUrl = URL.createObjectURL(file);
        onPDFUpload(fileUrl);
        
        // Load the PDF.js library dynamically
        const pdfjsLib = await import('pdfjs-dist/build/pdf');
        const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
        
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        
        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }

        onTextExtracted(fullText);
      } catch (error) {
        console.error('Error processing PDF:', error);
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
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
        ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
    >
      <input {...getInputProps()} />
      {isProcessing ? (
        <p>Processing PDF...</p>
      ) : isDragActive ? (
        <p>Drop the PDF file here...</p>
      ) : (
        <p>Drag and drop a PDF file here, or click to select one</p>
      )}
    </div>
  );
};

export default PDFUploader;
