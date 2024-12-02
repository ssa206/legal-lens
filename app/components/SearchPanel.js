'use client';
import { useState, useEffect } from 'react';
import { SearchEngine } from './utils/searchUtils';

export default function SearchPanel({ analysisCache, onResultClick }) {
  const [searchEngine] = useState(() => new SearchEngine());
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    riskLevel: '',
    text: ''
  });
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Index findings when cache changes
  useEffect(() => {
    Object.entries(analysisCache).forEach(([pageNumber, analysis]) => {
      searchEngine.indexFindings(parseInt(pageNumber), analysis.findings);
    });
  }, [analysisCache, searchEngine]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    let searchResults;
    if (query.trim()) {
      searchResults = searchEngine.search(query, analysisCache);
    } else {
      searchResults = searchEngine.filterFindings(analysisCache, filters);
    }

    setResults(searchResults);
    setIsSearching(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Search & Filter</h3>
        
        <form onSubmit={handleSearch} className="mt-4 space-y-4">
          {/* Search input */}
          <div>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for specific issues..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              >
                <option value="">All Categories</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Risk Level</label>
              <select
                value={filters.riskLevel}
                onChange={(e) => setFilters(f => ({ ...f, riskLevel: e.target.value }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              >
                <option value="">All Levels</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="divide-y divide-gray-200">
        {results.map((result) => (
          <div
            key={`${result.pageNumber}-${result.id}`}
            className="p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => onResultClick?.(result)}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                result.category === 'critical' ? 'bg-red-500' :
                result.category === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              <div>
                <p className="font-medium text-gray-900">{result.text}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Page {result.pageNumber}
                  {result.relevance && ` • Match: ${Math.round(result.relevance * 100)}%`}
                </p>
              </div>
            </div>
          </div>
        ))}

        {results.length === 0 && !isSearching && (
          <div className="p-8 text-center text-gray-500">
            No results found. Try adjusting your search or filters.
          </div>
        )}
      </div>
    </div>
  );
}
