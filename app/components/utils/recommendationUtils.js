// Utility to generate recommendations based on findings
export class RecommendationEngine {
  constructor() {
    // Common patterns and their recommendations
    this.recommendationPatterns = {
      'vague language': {
        title: 'Clarify Ambiguous Terms',
        suggestion: 'Replace vague terms with specific, measurable criteria',
        example: 'Instead of "reasonable time", specify "within 30 business days"'
      },
      'data privacy': {
        title: 'Enhance Data Protection',
        suggestion: 'Add specific data handling and protection clauses',
        example: 'Include GDPR compliance measures and data breach notification procedures'
      },
      'liability': {
        title: 'Address Liability Concerns',
        suggestion: 'Clearly define liability limits and responsibilities',
        example: 'Specify maximum liability amounts and excluded scenarios'
      },
      'termination': {
        title: 'Clarify Termination Terms',
        suggestion: 'Define clear termination conditions and procedures',
        example: 'Include notice periods and post-termination obligations'
      },
      'payment': {
        title: 'Specify Payment Terms',
        suggestion: 'Add detailed payment conditions and schedules',
        example: 'Define payment deadlines, late fees, and accepted payment methods'
      },
      'compliance': {
        title: 'Ensure Regulatory Compliance',
        suggestion: 'Add relevant compliance clauses',
        example: 'Reference specific regulations and compliance requirements'
      },
      'intellectual property': {
        title: 'Protect Intellectual Property',
        suggestion: 'Add IP protection clauses',
        example: 'Define ownership, usage rights, and confidentiality terms'
      }
    };
  }

  // Generate recommendations based on finding text
  generateRecommendation(findingText) {
    const lowerText = findingText.toLowerCase();
    let recommendations = [];

    // Check each pattern for matches
    Object.entries(this.recommendationPatterns).forEach(([pattern, recommendation]) => {
      if (lowerText.includes(pattern)) {
        recommendations.push({
          ...recommendation,
          relevance: this.calculateRelevance(lowerText, pattern)
        });
      }
    });

    // If no specific recommendations found, generate generic ones based on category
    if (recommendations.length === 0) {
      if (lowerText.includes('critical') || lowerText.includes('severe')) {
        recommendations.push({
          title: 'Address Critical Issue',
          suggestion: 'Review and revise this clause with legal counsel',
          example: 'Consider potential legal implications and risks',
          relevance: 1.0
        });
      } else if (lowerText.includes('warning')) {
        recommendations.push({
          title: 'Review Potential Risk',
          suggestion: 'Evaluate and clarify the terms',
          example: 'Add specific definitions or examples where needed',
          relevance: 0.8
        });
      }
    }

    return recommendations.sort((a, b) => b.relevance - a.relevance);
  }

  // Calculate how relevant a recommendation is to the finding
  calculateRelevance(text, pattern) {
    let relevance = 0.5; // Base relevance

    // Increase relevance based on various factors
    if (text.includes('critical') || text.includes('severe')) {
      relevance += 0.3;
    }
    if (text.includes('immediate') || text.includes('urgent')) {
      relevance += 0.2;
    }
    if (text.includes('recommend') || text.includes('suggest')) {
      relevance += 0.1;
    }

    return Math.min(1.0, relevance);
  }

  // Generate action items based on findings
  generateActionItems(findings) {
    const actionItems = findings.map(finding => {
      const recommendations = this.generateRecommendation(finding.text);
      return {
        id: finding.id,
        text: finding.text,
        category: finding.category,
        recommendations,
        priority: this.calculatePriority(finding.category, recommendations)
      };
    });

    return actionItems.sort((a, b) => b.priority - a.priority);
  }

  // Calculate priority score for action items
  calculatePriority(category, recommendations) {
    let priority = category === 'critical' ? 3 : 
                  category === 'warning' ? 2 : 1;

    // Adjust priority based on recommendation relevance
    const maxRelevance = Math.max(...recommendations.map(r => r.relevance));
    priority *= (1 + maxRelevance);

    return priority;
  }
}
