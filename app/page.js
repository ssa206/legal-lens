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
        
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)]">
          {!currentPDF ? (
            <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
              <div className="w-full max-w-xl lg:max-w-2xl">
                <PDFUploader onFileChange={handleFileChange} />
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-xl lg:max-w-2xl mx-4">
              <PDFUploader onFileChange={handleFileChange} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
