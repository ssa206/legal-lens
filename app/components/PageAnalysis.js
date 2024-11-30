'use client';

import { useState, useEffect } from 'react';
import { analyzeText } from '../utils/aiAnalysis';

export default function PageAnalysis({ pageNumber, pageText }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const performAnalysis = async () => {
      if (!pageText) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await analyzeText(pageText);
        setAnalysis(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    performAnalysis();
  }, [pageText]);

  if (loading) {
    return (
      <div className="animate-pulse p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm p-4">
        Error analyzing page {pageNumber}: {error}
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 border-b border-gray-100 last:border-b-0">
      <h3 className="font-medium text-gray-700">Page {pageNumber}</h3>
      
      {analysis.warnings && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-600">⚠️ Warnings and Red Flags</h4>
          <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg">{analysis.warnings}</p>
        </div>
      )}

      {analysis.loopholes && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-orange-600">🕳️ Potential Loopholes</h4>
          <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">{analysis.loopholes}</p>
        </div>
      )}

      {analysis.keyPoints && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-blue-600">🎯 Key Points</h4>
          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{analysis.keyPoints}</p>
        </div>
      )}

      {analysis.interpretation && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-purple-600">💭 Open to Interpretation</h4>
          <p className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">{analysis.interpretation}</p>
        </div>
      )}
    </div>
  );
}
