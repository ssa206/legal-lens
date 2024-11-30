'use client';

import { useState, useEffect } from 'react';
import { checkAICapabilities, createAISummarizer } from '../utils/aiAnalysis';
import PageAnalysis from './PageAnalysis';

const STORAGE_KEY_PREFIX = 'legal_lens_';

export default function AIAnalysis() {
  const [pages, setPages] = useState([]);
  const [hasAICapabilities, setHasAICapabilities] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let summarizer = null;

    const initializeAI = async () => {
      if (!mounted) return;

      try {
        setIsLoading(true);
        setError(null);

        // Check if the browser supports AI capabilities
        const hasCapabilities = await checkAICapabilities();
        
        if (!mounted) return;
        
        if (!hasCapabilities) {
          setHasAICapabilities(false);
          setError('AI features are not available. Please make sure you are using Chrome with AI features enabled.');
          setIsLoading(false);
          return;
        }

        try {
          // Create summarizer with progress monitoring
          summarizer = await createAISummarizer((progress) => {
            if (mounted) {
              setDownloadProgress(progress);
            }
          });

          // Wait for the summarizer to be ready
          await summarizer.ready;

          if (mounted) {
            setHasAICapabilities(true);
            setIsLoading(false);
          }
        } catch (initError) {
          console.error('Error initializing AI:', initError);
          if (mounted) {
            setError('Failed to initialize AI features. Please try refreshing the page.');
            setHasAICapabilities(false);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        if (mounted) {
          setError('An unexpected error occurred. Please try again later.');
          setHasAICapabilities(false);
          setIsLoading(false);
        }
      }
    };

    initializeAI();

    return () => {
      mounted = false;
      // No need to explicitly clean up the summarizer
    };
  }, []); // Empty dependency array since we only want to run this once on mount

  useEffect(() => {
    // Load pages from localStorage
    const totalPages = localStorage.getItem(`${STORAGE_KEY_PREFIX}total_pages`);
    if (totalPages) {
      const pagesData = [];
      for (let i = 1; i <= parseInt(totalPages); i++) {
        const pageText = localStorage.getItem(`${STORAGE_KEY_PREFIX}page_${i}_text`);
        if (pageText) {
          pagesData.push({ number: i, text: pageText });
        }
      }
      setPages(pagesData);
    }
  }, []);

  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <div className="text-center text-red-500">
          <p className="mb-2">Error initializing AI features</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <div className="text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Initializing AI capabilities...</p>
          {downloadProgress > 0 && (
            <div className="mt-2">
              <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress * 100}%` }}
                />
              </div>
              <p className="text-sm mt-1">{Math.round(downloadProgress * 100)}% downloaded</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (hasAICapabilities === false) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <div className="text-center text-gray-500">
          <p className="mb-2">AI Analysis features are not available in your browser.</p>
          <p className="text-sm">Please try using Chrome with AI capabilities enabled.</p>
          <p className="text-xs mt-4">
            To enable AI features:
            <br />1. Open chrome://flags
            <br />2. Search for "Writing Assistance API"
            <br />3. Enable the flag and restart Chrome
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Document Analysis</h2>
        <div className="text-sm text-gray-500">
          {pages.length} page{pages.length !== 1 ? 's' : ''} analyzed
        </div>
      </div>

      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {pages.map((page) => (
          <PageAnalysis
            key={page.number}
            pageNumber={page.number}
            pageText={page.text}
          />
        ))}

        {pages.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            No document loaded for analysis.
          </div>
        )}
      </div>
    </div>
  );
}
