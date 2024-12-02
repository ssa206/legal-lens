'use client';
import {useState, useEffect, useRef} from 'react';
import { AIAnalyzer } from './utils/aiUtils';
import SearchPanel from './SearchPanel';

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
    <div className="flex flex-col gap-3 sm:gap-4 p-6 glass-panel rounded-3xl h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-[#6366F1]">Legal Analysis</h2>
          <span className="text-[#6366F1] opacity-70">
            Page {currentPage}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="text-gray-600">
              Analyzing page {currentPage}...
            </div>
            {retryCount > 0 && (
              <div className="text-yellow-600 text-sm">
                Retry attempt {retryCount} of 3
              </div>
            )}
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
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
            className="w-full px-4 py-2 bg-white hover:bg-red-50 text-red-600 rounded-lg text-sm transition-all duration-200 border border-red-200 hover:border-red-300 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      ) : currentAnalysis ? (
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Risk Overview */}
          <div className="rounded-3xl bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold text-gray-900">Risk Overview</h3>
              <button
                onClick={async () => {
                  const { generatePDFReport } = await import('./utils/reportUtils');
                  const doc = await generatePDFReport('Legal Document', analysisCache);
                  doc.save('legal-analysis-report.pdf');
                }}
                className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#5558E5] text-white px-6 py-3 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Report
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="min-h-[90px] flex flex-col p-2.5 rounded-xl bg-gray-50">
                <div className="text-lg font-bold text-gray-900">
                  {currentAnalysis.riskAnalysis.score}
                </div>
                <div className="text-[10px] text-gray-500">
                  Risk Score
                </div>
              </div>

              <div className="min-h-[90px] flex flex-col p-2.5 rounded-xl bg-gray-50">
                <div className="text-base font-bold text-[#F59E0B]">
                  Medium Risk
                </div>
                <div className="text-[10px] text-gray-500">
                  Risk Level
                </div>
              </div>

              <div className="min-h-[90px] flex flex-col p-2.5 rounded-xl bg-gray-50">
                <div className="text-lg font-bold text-gray-900">
                  {currentAnalysis.findings.length}
                </div>
                <div className="text-[10px] text-gray-500">
                  Total Findings
                </div>
              </div>

              <div className="min-h-[90px] flex flex-col p-2.5 rounded-xl bg-gray-50">
                <div className="text-lg font-bold text-gray-900">
                  {Object.keys(currentAnalysis.riskAnalysis.breakdown).length}
                </div>
                <div className="text-[10px] text-gray-500">
                  Categories
                </div>
              </div>
            </div>

            {/* Risk Breakdown */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">Risk Breakdown</h4>
              <div className="space-y-6">
                {Object.entries(currentAnalysis.riskAnalysis.breakdown).map(([category, data]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{category}</span>
                      <div className="flex items-center gap-6 text-gray-500">
                        <div className="flex items-center gap-2">
                          <span>Impact:</span>
                          <span className="text-gray-900">{data.impact}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>Count:</span>
                          <span className="text-gray-900">{data.count}</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#6366F1] rounded-full transition-all duration-500"
                        style={{ width: `${data.impact}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Findings Section */}
          <div className="rounded-3xl bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Detailed Findings</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {currentAnalysis.findings.map((finding, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      finding.category === 'critical' ? 'bg-red-100' :
                      finding.category === 'warning' ? 'bg-amber-100' :
                      'bg-blue-100'
                    }`}>
                      <svg className={`w-5 h-5 ${
                        finding.category === 'critical' ? 'text-red-600' :
                        finding.category === 'warning' ? 'text-amber-600' :
                        'text-blue-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d={finding.category === 'critical' ? 
                            "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" :
                            finding.category === 'warning' ?
                            "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" :
                            "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          } 
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg text-gray-900">{finding.category}</h4>
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          finding.category === 'critical' ? 'bg-red-50 text-red-700' :
                          finding.category === 'warning' ? 'bg-amber-50 text-amber-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {finding.category === 'critical' ? 'Critical' :
                           finding.category === 'warning' ? 'Warning' : 'Info'}
                        </span>
                      </div>
                      <p className="text-gray-600">{finding.text}</p>
                      {finding.recommendation && (
                        <div className="mt-3 text-sm">
                          <span className="font-medium text-gray-900">Recommendation: </span>
                          <span className="text-gray-600">{finding.recommendation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">No analysis available for this page</div>
        </div>
      )}
    </div>
  );
}