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
      const file = acceptedFiles[0];
      setIsProcessing(true);
      
      try {
        // Create URL for PDF viewer
        const fileUrl = URL.createObjectURL(file);
        onPDFUpload(fileUrl);

        // Extract text
        const buffer = await file.arrayBuffer();
        const text = await extractText(buffer);
        onTextExtracted(text);
      } catch (error) {
        console.error('Error processing PDF:', error);
        onTextExtracted('Error extracting text from PDF');
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
