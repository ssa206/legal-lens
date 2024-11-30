'use client';

import { useState, useEffect } from 'react';
import PDFUploader from './components/pdf/PDFUploader';
import PDFViewer from './components/pdf/PDFViewer';
import Navbar from './components/Navbar';

const STORAGE_KEY = 'legal_lens_current_doc';

export default function Home() {
  const [currentPDF, setCurrentPDF] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleFileChange = (file) => {
    // Clear previous document data
    localStorage.removeItem(STORAGE_KEY);
    setCurrentPDF(file);
    setShowUploadModal(false);
  };

  const handleNewUpload = () => {
    setShowUploadModal(true);
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (currentPDF && currentPDF.startsWith('blob:')) {
        URL.revokeObjectURL(currentPDF);
      }
    };
  }, [currentPDF]);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <Navbar onNewUpload={handleNewUpload} showNewUploadButton={!!currentPDF} />
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
        {!currentPDF ? (
          // Upload Section
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full max-w-2xl">
              <PDFUploader onFileChange={handleFileChange} />
            </div>
          </div>
        ) : (
          // PDF Viewer Section
          <>
            {/* Left Panel - PDF Viewer */}
            <div className="flex-1 min-h-[500px] glass-panel rounded-2xl p-4">
              <PDFViewer file={currentPDF} />
            </div>

            {/* Right Panel - Analysis */}
            <div className="w-full lg:w-[400px] glass-panel rounded-2xl p-4">
              <h2 className="text-lg font-semibold mb-4">Document Analysis</h2>
              <div className="text-sm text-[--gray-400]">
                Analysis features coming soon...
              </div>
            </div>
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[--background] rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Upload New Document</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-lg hover:bg-[--gray-100]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PDFUploader onFileChange={handleFileChange} />
          </div>
        </div>
      )}
    </main>
  );
}
