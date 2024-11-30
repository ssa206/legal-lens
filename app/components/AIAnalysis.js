'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY_PREFIX = 'legal_lens_';

export default function AIAnalysis() {
  const [documentText, setDocumentText] = useState('');
  const [summary, setSummary] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [capabilities, setCapabilities] = useState({
    summarizer: false,
    writer: false
  });

  useEffect(() => {
    // Check API capabilities
    const checkCapabilities = async () => {
      try {
        const summarizerCapabilities = await window.ai?.summarizer?.capabilities();
        const writerCapabilities = await window.ai?.writer?.capabilities();
        
        setCapabilities({
          summarizer: summarizerCapabilities?.available !== 'no',
          writer: writerCapabilities?.available !== 'no'
        });
      } catch (err) {
        console.error('Error checking AI capabilities:', err);
      }
    };

    checkCapabilities();
  }, []);

  useEffect(() => {
    // Load document text from localStorage
    const totalPages = localStorage.getItem(`${STORAGE_KEY_PREFIX}total_pages`);
    if (totalPages) {
      let fullText = '';
      for (let i = 1; i <= parseInt(totalPages); i++) {
        const pageText = localStorage.getItem(`${STORAGE_KEY_PREFIX}page_${i}_text`);
        if (pageText) {
          fullText += pageText + '\n\n';
        }
      }
      setDocumentText(fullText);
    }
  }, []);

  const analyzeLegalDocument = async () => {
    if (!documentText) return;

    setLoading(true);
    setError(null);
    
    try {
      // Using the Writing Assistance API for summarization
      const summarizer = await window.ai?.summarizer?.create();
      if (!summarizer) {
        throw new Error('AI Summarizer not available');
      }

      // Generate document summary
      const summaryStream = await summarizer.summarizeStreaming(documentText, {
        type: 'key-points',
        format: 'text',
        length: 'paragraph'
      });

      let summaryText = '';
      const reader = summaryStream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        summaryText += value;
      }
      setSummary(summaryText);

      // Using the Writer API for detailed analysis
      const writer = await window.ai?.writer?.create();
      if (!writer) {
        throw new Error('AI Writer not available');
      }

      // Generate legal analysis
      const analysisPrompt = `Analyze this legal document and provide:
      1. Key points and obligations
      2. Potential risks or concerns
      3. Important dates or deadlines
      4. Recommendations
      
      Please be thorough but concise. Focus on the most important aspects that a legal professional should be aware of.`;

      const analysisStream = await writer.writeStreaming(analysisPrompt, {
        context: documentText,
        format: 'text'
      });

      let analysisText = '';
      const analysisReader = analysisStream.getReader();
      while (true) {
        const { done, value } = await analysisReader.read();
        if (done) break;
        analysisText += value;
      }

      // Parse and structure the analysis
      const sections = analysisText.split(/\d+\./);
      const structuredAnalysis = {
        keyPoints: sections[1]?.trim() || '',
        risks: sections[2]?.trim() || '',
        dates: sections[3]?.trim() || '',
        recommendations: sections[4]?.trim() || ''
      };

      setAnalysis(structuredAnalysis);
    } catch (err) {
      setError(err.message);
      console.error('AI Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!capabilities.summarizer || !capabilities.writer) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <div className="text-center text-gray-500">
          <p className="mb-2">AI Analysis features are not available in your browser.</p>
          <p className="text-sm">Please try using a browser with AI capabilities enabled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">AI Analysis</h2>
        <button
          onClick={analyzeLegalDocument}
          disabled={loading || !documentText}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Analyzing...' : 'Analyze Document'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your document...</p>
        </div>
      )}

      {summary && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Executive Summary</h3>
          <p className="text-gray-600 bg-white p-4 rounded-lg shadow-sm">{summary}</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Key Points and Obligations</h3>
            <p className="text-gray-600 bg-white p-4 rounded-lg shadow-sm">{analysis.keyPoints}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Potential Risks or Concerns</h3>
            <p className="text-gray-600 bg-white p-4 rounded-lg shadow-sm">{analysis.risks}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Important Dates or Deadlines</h3>
            <p className="text-gray-600 bg-white p-4 rounded-lg shadow-sm">{analysis.dates}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Recommendations</h3>
            <p className="text-gray-600 bg-white p-4 rounded-lg shadow-sm">{analysis.recommendations}</p>
          </div>
        </div>
      )}

      {!summary && !analysis && !loading && !error && (
        <div className="text-gray-500 text-center py-8">
          Click "Analyze Document" to get AI-powered insights about your legal document.
        </div>
      )}
    </div>
  );
}
