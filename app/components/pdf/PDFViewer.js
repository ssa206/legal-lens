'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * PDFViewer Component - Displays a PDF document
 * 
 * @component
 * @param {Object} props
 * @param {string} props.file - PDF file URL to display
 */
const PDFViewer = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  if (!file) {
    return <div className="text-center p-4">No PDF file selected</div>;
  }

  return (
    <div className="w-full h-full overflow-auto bg-white rounded-lg shadow p-4">
      {loading && <div className="text-center p-4">Loading PDF...</div>}
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col items-center"
        renderTextLayer={false}
        renderAnnotationLayer={false}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="mb-4"
          />
        ))}
      </Document>
    </div>
  );
};

export default PDFViewer;
