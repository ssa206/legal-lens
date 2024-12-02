'use client';
import {useState, useEffect, useRef} from 'react';
import { AIAnalyzer } from './utils/aiUtils';

export default function AIAnalysis() {
  const [analyzer, setAnalyzer] = useState(null);
  const initializationRef = useRef(false);
  
  useEffect(() => {
    if (!initializationRef.current) {
      initializationRef.current = true;
      const newAnalyzer = new AIAnalyzer();
      newAnalyzer.initialize();
      setAnalyzer(newAnalyzer);
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-lg text-gray-500">
        AI-powered text analysis using Chrome's Summarizer API
      </div>
    </div>
  );
}