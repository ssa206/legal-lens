'use client';
import {useState, useEffect, useRef} from 'react';
import { AIAnalyzer } from './utils/aiUtils';

export default function AIAnalysis({ currentPage }) {
  const [analyzer, setAnalyzer] = useState(null);
  const [analysisCache, setAnalysisCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const initializationRef = useRef(false);
  
  useEffect(() => {
    async function initializeAnalyzer() {
      try {
        console.log('Initializing analyzer...');
        if (!initializationRef.current) {
          initializationRef.current = true;
          const newAnalyzer = new AIAnalyzer();
          await newAnalyzer.initialize();
          console.log('Analyzer initialized successfully');
          setAnalyzer(newAnalyzer);
        }
      } catch (error) {
        console.error('Failed to initialize analyzer:', error);
        setError('Failed to initialize the analyzer. Please make sure you are using Chrome browser.');
      }
    }
    initializeAnalyzer();
  }, []);

  useEffect(() => {
    const analyzeCurrentPage = async () => {
      if (!analyzer || !currentPage) {
        console.log('Skipping analysis:', { hasAnalyzer: !!analyzer, currentPage });
        return;
      }

      // Check if we already have analysis for this page
      if (analysisCache[currentPage]) {
        console.log('Using cached analysis for page', currentPage);
        return;
      }

      const pageKey = `legal_lens_page_${currentPage}_text`;
      const pageText = localStorage.getItem(pageKey);
      
      console.log('Page text retrieved:', { 
        pageKey, 
        hasText: !!pageText, 
        textLength: pageText?.length 
      });

      if (!pageText) {
        setError('No text available for this page');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setRetryCount(0);
        console.log('Starting analysis for page', currentPage);
        const result = await analyzer.analyzeLegalText(pageText);
        console.log('Analysis completed:', result);
        setRetryCount(result.retryCount);
        setAnalysisCache(prev => ({
          ...prev,
          [currentPage]: result
        }));
      } catch (error) {
        console.error('Failed to analyze page:', error);
        setError('Failed to analyze the page. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    analyzeCurrentPage();
  }, [analyzer, currentPage]);

  if (!analyzer) {
    return <div className="p-4">Initializing analyzer...</div>;
  }

  const currentAnalysis = analysisCache[currentPage];

  // Calculate statistics if we have analysis
  const stats = currentAnalysis?.findings.reduce((acc, finding) => {
    acc[finding.category] = (acc[finding.category] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <div className="flex flex-col gap-4 p-4 glass-panel rounded-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Legal Analysis</h2>
        <div className="text-sm text-gray-500">
          Page {currentPage}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-pulse space-y-2">
            <div className="text-gray-500">
              Analyzing page {currentPage}...
            </div>
            {retryCount > 0 && (
              <div className="text-yellow-600">
                Retry attempt {retryCount} of 3
              </div>
            )}
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setRetryCount(0);
              const pageKey = `legal_lens_page_${currentPage}_text`;
              const pageText = localStorage.getItem(pageKey);
              if (pageText && analyzer) {
                setLoading(true);
                analyzer.analyzeLegalText(pageText)
                  .then(result => {
                    setRetryCount(result.retryCount);
                    setAnalysisCache(prev => ({
                      ...prev,
                      [currentPage]: result
                    }));
                    setError(null);
                  })
                  .catch(err => {
                    setError('Failed to analyze the page. Please try again.');
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }
            }}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : currentAnalysis ? (
        <div className="space-y-6">
          {/* Risk Score */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Risk Assessment</h3>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const { generatePDFReport } = await import('./utils/reportUtils');
                    const doc = await generatePDFReport('Legal Document', analysisCache);
                    doc.save('legal-analysis-report.pdf');
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Report
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-4xl font-bold text-gray-700">
                  {currentAnalysis.riskAnalysis.score}
                </div>
                <div className="text-sm text-gray-500">Risk Score</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  currentAnalysis.riskAnalysis.level === 'High Risk' ? 'text-red-600' :
                  currentAnalysis.riskAnalysis.level === 'Medium Risk' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {currentAnalysis.riskAnalysis.level}
                </div>
                <div className="text-sm text-gray-500">Risk Level</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Risk Breakdown</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-red-50 rounded-lg">
                  <div className="text-red-700 font-medium">Critical Issues</div>
                  <div className="text-sm text-red-600">
                    Impact Score: {currentAnalysis.riskAnalysis.breakdown.critical.impact}
                  </div>
                </div>
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <div className="text-yellow-700 font-medium">Warnings</div>
                  <div className="text-sm text-yellow-600">
                    Impact Score: {currentAnalysis.riskAnalysis.breakdown.warning.impact}
                  </div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="text-blue-700 font-medium">Info Items</div>
                  <div className="text-sm text-blue-600">
                    Impact Score: {currentAnalysis.riskAnalysis.breakdown.info.impact}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-700">{stats.critical || 0}</div>
              <div className="text-sm text-red-600">Critical Issues</div>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-700">{stats.warning || 0}</div>
              <div className="text-sm text-yellow-600">Warnings</div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.info || 0}</div>
              <div className="text-sm text-blue-600">Info Items</div>
            </div>
          </div>

          {currentAnalysis.retryCount > 0 && (
            <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
              Analysis succeeded after {currentAnalysis.retryCount} {currentAnalysis.retryCount === 1 ? 'retry' : 'retries'}
            </div>
          )}

          {/* Critical Issues */}
          {currentAnalysis.findings.some(f => f.category === 'critical') && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Critical Issues
              </h3>
              <div className="space-y-2">
                {currentAnalysis.findings
                  .filter(f => f.category === 'critical')
                  .map(finding => (
                    <div key={finding.id} className="p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                      <p className="text-red-700">{finding.text}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {currentAnalysis.findings.some(f => f.category === 'warning') && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-yellow-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Warnings
              </h3>
              <div className="space-y-2">
                {currentAnalysis.findings
                  .filter(f => f.category === 'warning')
                  .map(finding => (
                    <div key={finding.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
                      <p className="text-yellow-700">{finding.text}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Information */}
          {currentAnalysis.findings.some(f => f.category === 'info') && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Additional Information
              </h3>
              <div className="space-y-2">
                {currentAnalysis.findings
                  .filter(f => f.category === 'info')
                  .map(finding => (
                    <div key={finding.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                      <p className="text-blue-700">{finding.text}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400 mt-4">
            Last updated: {new Date(currentAnalysis.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="text-gray-500">No analysis available for this page</div>
      )}
    </div>
  );
}