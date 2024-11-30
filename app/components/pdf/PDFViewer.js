'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import react-pdf components
const PDFDocument = dynamic(() => import('react-pdf').then(mod => mod.Document), {
  ssr: false,
  loading: () => <p>Loading PDF viewer...</p>
});

const PDFPage = dynamic(() => import('react-pdf').then(mod => mod.Page), {
  ssr: false
});

/**
 * PDFViewer Component
 * 
 * @component
 * @param {Object} props
 * @param {string} props.file - PDF file URL to display
 * 
 * @returns {JSX.Element} Rendered PDF viewer component
 */
const PDFViewer = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the PDF.js worker
    const loadWorker = async () => {
      const { pdfjs } = await import('react-pdf');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.js',
        import.meta.url,
      ).toString();
    };
    
    loadWorker();
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error);
    setLoading(false);
  }

  if (!file) {
    return <div className="text-center p-4">No PDF file selected</div>;
  }

  return (
    <div className="w-full h-full overflow-auto" ref={containerRef}>
      {loading && <div className="text-center p-4">Loading PDF...</div>}
      <PDFDocument
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        className="flex flex-col items-center"
      >
        {numPages && Array.from(new Array(numPages), (el, index) => (
          <PDFPage
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            className="mb-4"
            width={containerRef.current?.offsetWidth ? containerRef.current.offsetWidth - 50 : undefined}
          />
        ))}
      </PDFDocument>
    </div>
  );
};

export default PDFViewer;
