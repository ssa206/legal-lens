'use client';

import { useState, useEffect } from 'react';
import PDFUploader from './components/pdf/PDFUploader';
import PDFViewer from './components/pdf/PDFViewer';
import Navbar from './components/Navbar';
import AIAnalysis from './components/AIAnalyzer';
const STORAGE_KEY = 'legal_lens_current_doc';

export default function Home() {
  const [currentPDF, setCurrentPDF] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFileChange = (file) => {
    // Clear previous document data
    localStorage.removeItem(STORAGE_KEY);
    setCurrentPDF(file);
    setShowUploadModal(false);
  };

  const handleNewUpload = () => {
    setShowUploadModal(true);
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowUploadModal(false);
      }
    };

    if (showUploadModal) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showUploadModal]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (currentPDF && currentPDF.startsWith('blob:')) {
        URL.revokeObjectURL(currentPDF);
      }
    };
  }, [currentPDF]);

  return (
    <main className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        <Navbar onNewUpload={handleNewUpload} showNewUploadButton={!!currentPDF} />
        
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mt-16 sm:mt-20">
          {!currentPDF ? (
            <div className="w-full flex flex-col items-center justify-start p-2 sm:p-4">
              <div className="max-w-2xl w-full">
                {/* Simple Welcome */}
                <div className="text-center mb-6">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    Legal<span className="text-indigo-600">Lens</span>
                  </h1>
                  <p className="text-gray-600">
                    Let AI help you understand your legal documents
                  </p>
                </div>

                {/* Main Upload Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  {/* Privacy Notice */}
                  <div className="flex items-center gap-3 mb-6 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Your documents are processed securely and never stored</span>
                  </div>

                  <PDFUploader onFileChange={handleFileChange} />
                </div>

                {/* Quick Benefits */}
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Quick Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Key Points Identified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Risk Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Simple Explanations</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Left Panel - PDF Viewer */}
              <div className="flex-1 min-h-[400px] sm:min-h-[500px] glass-panel rounded-xl sm:rounded-2xl p-2 sm:p-4 fade-in">
                <PDFViewer 
                  file={currentPDF} 
                  onPageChange={handlePageChange}
                />
              </div>

              {/* Right Panel - AI Analysis */}
              <div className="w-full lg:w-[400px] xl:w-[450px] min-h-[400px] sm:min-h-[500px] fade-in">
                <AIAnalysis currentPage={currentPage} />
              </div>
            </>
          )}
        </div>

        {showUploadModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowUploadModal(false);
              }
            }}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-xl lg:max-w-2xl mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upload Document</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <PDFUploader onFileChange={handleFileChange} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
