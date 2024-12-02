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
      <div className="max-w-[1920px] mx-auto">
        <Navbar onNewUpload={handleNewUpload} showNewUploadButton={!!currentPDF} />
        
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
          {!currentPDF ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <PDFUploader onFileChange={handleFileChange} />
              </div>
            </div>
          ) : (
            <>
              {/* Left Panel - PDF Viewer */}
              <div className="flex-1 min-h-[500px] glass-panel rounded-2xl p-4 fade-in">
                <PDFViewer file={currentPDF} />
              </div>

              {/* Right Panel - AI Analysis */}
              <div className="lg:w-[400px] glass-panel rounded-2xl p-6 h-full overflow-y-auto fade-in">
                <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Document Analysis
                </h2>
                <div className="space-y-4">
                  {/* Analysis content */}
                  <AIAnalysis />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Upload Legal Document
              </h2>
              <p className="text-gray-500 mt-1">
                Upload your document to get started with AI-powered analysis
              </p>
            </div>
            <PDFUploader onFileChange={handleFileChange} />
          </div>
        </div>
      )}
    </main>
  );
}
