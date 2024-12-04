'use client';

import { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * PDFViewer Component - Displays a PDF document with zoom and pan controls
 * 
 * @component
 * @param {Object} props
 * @param {string} props.file - PDF file URL to display
 * @param {function} props.onPageChange - Callback function to notify parent of page changes
 */
const PDFViewer = ({ file, onPageChange }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);

  // Reset state when file changes
  useEffect(() => {
    setCurrentPage(1);
    setScale(1);
    setLoading(true);
  }, [file]);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (onPageChange && currentPage <= numPages) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange, numPages]);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setScale(1);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages || 1));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-[--gray-300]">
        No document uploaded
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-2 glass-panel rounded-xl">
        {/* Page Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg hover:bg-[--gray-100] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm">
            Page {currentPage} of {numPages || '...'}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage >= numPages}
            className="p-2 rounded-lg hover:bg-[--gray-100] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next Page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2 rounded-lg hover:bg-[--gray-100] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={resetZoom}
            className="text-sm px-2 py-1 rounded hover:bg-[--gray-100]"
            title="Reset Zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className="p-2 rounded-lg hover:bg-[--gray-100] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative bg-[--gray-50] rounded-xl">
        <div 
          className="absolute inset-0 overflow-auto"
          style={{
            padding: scale > 1 ? '20px' : '0',
          }}
        >
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-[--gray-300]">Loading document...</div>
            </div>
          )}
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex justify-center"
          >
            <div 
              style={{
                transform: `scale(${scale})`,
                transformOrigin: '0 0',
                display: 'inline-block'
              }}
            >
              <Page
                pageNumber={currentPage}
                className="shadow-lg"
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </div>
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
