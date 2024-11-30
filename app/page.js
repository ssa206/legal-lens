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
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-white">
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
                <h2 className="text-xl font-semibold mb-4">Document Analysis</h2>
                <div className="space-y-4">
                  {/* Analysis content */}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-xl">
            <PDFUploader onFileChange={handleFileChange} />
          </div>
        </div>
      )}
    </main>
  );
}
