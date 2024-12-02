// Utility class for AI-powered text analysis using Chrome's Summarizer API
export class AIAnalyzer {
    constructor() {
      this.summarizer = null;
      this.isAvailable = false;
      this.WORD_LIMIT = 2000;
      this.MAX_RETRIES = 3;
      this.RETRY_DELAY = 1000; // 1 second
    }

    async sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    // Initialize the summarizer with given options
    async initialize(options = {
      sharedContext: 'This is a legal document analysis',
      type: 'key-points',
      format: 'markdown',
      length: 'medium'
    }) {
      try {
        console.log('Initializing AIAnalyzer...');
        if ('ai' in window && 'summarizer' in window.ai) {
            console.log('Chrome AI API detected');
            const summarizerCapabilities = await window.ai.summarizer.capabilities();
            console.log('Capabilities:', summarizerCapabilities);
            
            if (summarizerCapabilities.available === 'readily') {
                console.log('Summarizer API is supported and readily available');
                this.summarizer = await window.ai.summarizer.create(options);
                this.isAvailable = true;
                console.log('Summarizer created successfully');
            } else if (summarizerCapabilities.available === 'after-download') {
                console.log('Summarizer API is available after downloading');
            } else {
                console.log('Summarizer API is not available');
            }
        } else {
            throw new Error('Chrome AI API not found in window object');
        }
      } catch (error) {
          console.error('Error during initialization:', error);
          throw error;
      }
    }

    // Helper function to categorize findings
    categorizeFinding(text) {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('critical') || 
          lowerText.includes('severe') || 
          lowerText.includes('major') ||
          lowerText.includes('significant risk') ||
          lowerText.includes('dangerous')) {
        return 'critical';
      } else if (lowerText.includes('warning') || 
                 lowerText.includes('caution') || 
                 lowerText.includes('potential risk') ||
                 lowerText.includes('unclear') ||
                 lowerText.includes('vague')) {
        return 'warning';
      } else if (lowerText.includes('note') || 
                 lowerText.includes('consider') || 
                 lowerText.includes('may') ||
                 lowerText.includes('might')) {
        return 'info';
      }
      return 'warning'; // Default to warning for uncategorized items
    }

    async retryAnalysis(text, retryCount = 0) {
      try {
        const analysis = await this.summarizer.summarize(text, {
          context: `Analyze this legal text for potential issues. For each issue found:
            1. Identify if it's a critical issue, warning, or informational note
            2. Explain the potential impact or risk
            3. Suggest what to watch out for
            4. If possible, recommend improvements

            Focus on:
            - Legal loopholes or ambiguities (Critical)
            - Concerning clauses or terms (Warning)
            - Vague or unclear language (Warning)
            - Potentially disadvantageous terms (Warning)
            - Missing or incomplete information (Info)
            
            Format each point as a clear, separate finding.`,
        });

        // Check if we got a valid response
        if (!analysis || analysis.trim() === '') {
          throw new Error('Empty analysis response');
        }

        // Parse the analysis into structured format
        const findings = analysis.split('\n').filter(line => line.trim())
          .map(finding => {
            const cleanFinding = finding.replace(/^\*\s*/, '').trim();
            return {
              text: cleanFinding,
              category: this.categorizeFinding(cleanFinding),
              id: Math.random().toString(36).substr(2, 9)
            };
          });

        // Validate that we have at least one finding
        if (findings.length === 0) {
          throw new Error('No findings in analysis');
        }

        return {
          findings,
          timestamp: new Date().toISOString(),
          retryCount
        };
      } catch (error) {
        if (retryCount < this.MAX_RETRIES) {
          console.log(`Retry attempt ${retryCount + 1} of ${this.MAX_RETRIES}`);
          await this.sleep(this.RETRY_DELAY * (retryCount + 1)); // Exponential backoff
          return this.retryAnalysis(text, retryCount + 1);
        }
        throw error;
      }
    }
  
    // Analyze legal text for issues and concerns
    async analyzeLegalText(text) {
      console.log('Starting legal text analysis...');
      console.log('Analyzer state:', { isAvailable: this.isAvailable, hasSummarizer: !!this.summarizer });

      if (!this.isAvailable || !this.summarizer) {
        throw new Error('AI Analyzer is not initialized');
      }

      if (!text || typeof text !== 'string') {
        throw new Error('Invalid text input: ' + (typeof text));
      }

      try {
        console.log('Sending text for analysis (length:', text.length, 'chars)');
        const result = await this.retryAnalysis(text);
        console.log('Analysis completed successfully');
        return result;
      } catch (error) {
        console.error('Failed to analyze legal text:', error);
        throw error;
      }
    }
}