'use client';

export default function Navbar({ onNewUpload, showNewUploadButton }) {
  return (
    <nav className="glass-panel rounded-2xl p-4 mb-6 flex items-center justify-between fade-in">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <div className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Legal Lens
          </div>
        </div>
        <div className="hidden md:block text-sm text-gray-500">
          AI-Powered Legal Document Analysis
        </div>
      </div>
      {showNewUploadButton && (
        <button
          onClick={onNewUpload}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:scale-105 hover:text-blue-600 transition-all duration-300 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Open New Document</span>
        </button>
      )}
    </nav>
  );
}
