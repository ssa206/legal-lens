import { diffLines } from 'diff';

export class DocumentComparison {
  constructor() {
    this.previousVersions = new Map(); // Store previous versions of documents
  }

  // Save a version of a document
  saveVersion(documentId, content, version = new Date().toISOString()) {
    if (!this.previousVersions.has(documentId)) {
      this.previousVersions.set(documentId, new Map());
    }
    this.previousVersions.get(documentId).set(version, content);
  }

  // Get all versions of a document
  getVersions(documentId) {
    return Array.from(this.previousVersions.get(documentId)?.keys() || []);
  }

  // Compare two versions of a document
  async compareVersions(documentId, version1, version2) {
    const versions = this.previousVersions.get(documentId);
    if (!versions) {
      throw new Error('Document not found');
    }

    const content1 = versions.get(version1);
    const content2 = versions.get(version2);

    if (!content1 || !content2) {
      throw new Error('One or both versions not found');
    }

    // Perform diff analysis
    const diff = diffLines(content1, content2);

    // Analyze changes with AI
    const changes = diff.map(part => ({
      value: part.value,
      added: part.added,
      removed: part.removed
    }));

    return {
      changes,
      summary: {
        addedLines: diff.filter(part => part.added).length,
        removedLines: diff.filter(part => part.removed).length,
        modifiedSections: diff.filter(part => part.added || part.removed).length
      }
    };
  }

  // Get significant changes between versions
  async getSignificantChanges(documentId, version1, version2, analyzer) {
    const { changes } = await this.compareVersions(documentId, version1, version2);
    
    // Analyze only added or modified sections
    const addedContent = changes
      .filter(part => part.added)
      .map(part => part.value)
      .join('\n');

    if (!addedContent) {
      return {
        significantChanges: [],
        riskLevel: 'low'
      };
    }

    // Use AI analyzer to assess new content
    const analysis = await analyzer.analyzeLegalText(addedContent);
    
    // Determine overall risk level
    const riskLevel = this.determineRiskLevel(analysis.findings);

    return {
      significantChanges: analysis.findings,
      riskLevel
    };
  }

  // Helper to determine risk level based on findings
  determineRiskLevel(findings) {
    const hasCritical = findings.some(f => f.category === 'critical');
    const hasWarning = findings.some(f => f.category === 'warning');
    
    if (hasCritical) return 'high';
    if (hasWarning) return 'medium';
    return 'low';
  }
}
