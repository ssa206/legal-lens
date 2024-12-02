// Utility for searching and filtering analysis results
export class SearchEngine {
  constructor() {
    this.searchIndex = new Map();
  }

  // Index findings for quick search
  indexFindings(pageNumber, findings) {
    findings.forEach(finding => {
      const words = this.tokenize(finding.text);
      words.forEach(word => {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, new Map());
        }
        if (!this.searchIndex.get(word).has(pageNumber)) {
          this.searchIndex.get(word).set(pageNumber, new Set());
        }
        this.searchIndex.get(word).get(pageNumber).add(finding.id);
      });
    });
  }

  // Tokenize text into searchable words
  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/) // Split on whitespace
      .filter(word => word.length > 2); // Remove short words
  }

  // Search for findings across all pages
  search(query, analysisCache) {
    const queryWords = this.tokenize(query);
    const results = new Map();

    queryWords.forEach(word => {
      const wordResults = this.searchIndex.get(word);
      if (wordResults) {
        wordResults.forEach((findingIds, pageNumber) => {
          findingIds.forEach(findingId => {
            const finding = this.getFindingById(findingId, pageNumber, analysisCache);
            if (finding) {
              if (!results.has(pageNumber)) {
                results.set(pageNumber, new Map());
              }
              results.get(pageNumber).set(findingId, {
                ...finding,
                relevance: this.calculateRelevance(finding.text, queryWords)
              });
            }
          });
        });
      }
    });

    return this.formatResults(results);
  }

  // Get finding by ID from analysis cache
  getFindingById(findingId, pageNumber, analysisCache) {
    const pageAnalysis = analysisCache[pageNumber];
    if (!pageAnalysis) return null;
    return pageAnalysis.findings.find(f => f.id === findingId);
  }

  // Calculate search result relevance
  calculateRelevance(text, queryWords) {
    const words = this.tokenize(text);
    let relevance = 0;

    queryWords.forEach(queryWord => {
      if (words.includes(queryWord)) {
        relevance += 1;
      }
    });

    return relevance / queryWords.length;
  }

  // Format search results for display
  formatResults(results) {
    const formatted = [];

    results.forEach((pageFindings, pageNumber) => {
      pageFindings.forEach((finding, findingId) => {
        formatted.push({
          pageNumber,
          findingId,
          ...finding
        });
      });
    });

    return formatted.sort((a, b) => b.relevance - a.relevance);
  }

  // Filter findings by various criteria
  filterFindings(analysisCache, filters) {
    const results = [];

    Object.entries(analysisCache).forEach(([pageNumber, analysis]) => {
      analysis.findings
        .filter(finding => this.matchesFilters(finding, filters))
        .forEach(finding => {
          results.push({
            pageNumber: parseInt(pageNumber),
            ...finding
          });
        });
    });

    return results;
  }

  // Check if finding matches all filters
  matchesFilters(finding, filters) {
    if (filters.category && finding.category !== filters.category) {
      return false;
    }
    if (filters.riskLevel) {
      const findingRiskLevel = this.getRiskLevel(finding.category);
      if (findingRiskLevel !== filters.riskLevel) {
        return false;
      }
    }
    if (filters.text && !finding.text.toLowerCase().includes(filters.text.toLowerCase())) {
      return false;
    }
    return true;
  }

  // Get risk level from category
  getRiskLevel(category) {
    switch (category) {
      case 'critical':
        return 'high';
      case 'warning':
        return 'medium';
      case 'info':
        return 'low';
      default:
        return 'medium';
    }
  }
}
