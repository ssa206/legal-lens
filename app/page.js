'use client';

import { useState } from 'react';
import PDFUploader from './components/pdf/PDFUploader';
import PDFViewer from './components/pdf/PDFViewer';

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  return (
    <main className="container mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Legal Lens</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PDFUploader
            onPDFUpload={setPdfFile}
            onTextExtracted={setExtractedText}
          />
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Extracted Text</h2>
            <div className="max-h-[500px] overflow-y-auto">
              <p className="whitespace-pre-wrap">{extractedText}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 min-h-[600px]">
          <h2 className="text-xl font-semibold mb-4">PDF Viewer</h2>
          {pdfFile && <PDFViewer file={pdfFile} />}
        </div>
      </div>
    </main>
  );
}
