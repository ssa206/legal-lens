'use client';

import { useState } from 'react';
import PDFUploader from './components/pdf/PDFUploader';
import PDFViewer from './components/pdf/PDFViewer';

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  return (
    <main className="min-h-screen bg-[--background] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-[--gray-100] bg-[--background] bg-opacity-80">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold tracking-tight">Legal Lens</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Upload Section */}
          <section className="mb-8 animate-fade-in max-w-2xl mx-auto">
            <PDFUploader
              onPDFUpload={setPdfFile}
              onTextExtracted={setExtractedText}
            />
          </section>

          {/* Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up h-[calc(100vh-20rem)]">
            {/* Extracted Text - Left Side */}
            <section className="glass-panel rounded-2xl p-6 h-full order-2 lg:order-1">
              <h2 className="text-lg font-medium mb-4">Extracted Content</h2>
              <div className="h-[calc(100%-3rem)] rounded-xl bg-[--gray-50] p-6 overflow-y-auto">
                {extractedText ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {extractedText}
                  </p>
                ) : (
                  <div className="flex items-center justify-center h-full text-[--gray-300]">
                    Upload a document to see extracted text
                  </div>
                )}
              </div>
            </section>

            {/* PDF Viewer - Right Side */}
            <section className="glass-panel rounded-2xl p-6 h-full order-1 lg:order-2">
              <h2 className="text-lg font-medium mb-4">Document Preview</h2>
              <div className="h-[calc(100%-3rem)] rounded-xl overflow-hidden">
                {pdfFile ? (
                  <PDFViewer file={pdfFile} />
                ) : (
                  <div className="flex items-center justify-center h-full text-[--gray-300]">
                    No document uploaded
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
