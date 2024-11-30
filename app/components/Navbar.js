'use client';

export default function Navbar({ onNewUpload, showNewUploadButton }) {
  return (
    <nav className="glass-panel rounded-2xl p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Legal Lens
        </div>
        <div className="hidden md:block text-sm text-[--gray-400]">
          AI-Powered Legal Document Analysis
        </div>
      </div>
      {showNewUploadButton && (
        <button
          onClick={onNewUpload}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Upload</span>
        </button>
      )}
    </nav>
  );
}
