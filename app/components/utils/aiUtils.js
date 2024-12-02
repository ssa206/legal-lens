// Utility class for AI-powered text analysis using Chrome's Summarizer API
export class AIAnalyzer {
    constructor() {
      this.summarizer = null;
      this.isAvailable = false;
      this.WORD_LIMIT = 2000;
    }
  
    // Initialize the summarizer with given options
    async initialize(options = {
      sharedContext: 'This is a legal document analysis',
      type: 'key-points',
      format: 'markdown',
      length: 'medium'
    }) {
      try {
        if ('ai' in window && 'summarizer' in window.ai) {
            const summarizerCapabilities = await window.ai.summarizer.capabilities()
            if (summarizerCapabilities.available === 'readily') {
                console.log('Summarizer API is supported and readily available');
            } else if (summarizerCapabilities.available === 'after-download') {
                console.log('Summarizer API is available after downloading');
            } else {
                console.log('Summarizer API is not available');
            }
            this.summarizer = await window.ai.summarizer.create(options);
            this.isAvailable = true;
        }
        }
        catch (error) {
            console.error('Summarizer API is not supported:', error);
        }
    }
  
    // Generate a summary of the given text
    async generateSummary(text, context = '') {
      if (!this.isAvailable || !this.summarizer) {
        throw new Error('AI Analyzer is not initialized');
      }
  
      try {
        const summary = await this.summarizer.summarize(text, {
          context: context
        });
        return summary;
      } catch (error) {
        console.error('Failed to generate summary:', error);
        throw error;
      }
    }
  
    // Generate a streaming summary of the given text
    async *generateStreamingSummary(text, context = '') {
      if (!this.isAvailable || !this.summarizer) {
        throw new Error('AI Analyzer is not initialized');
      }
  
      try {
        const stream = await this.summarizer.summarizeStreaming(text, {
          context: context
        });
  
        let previousLength = 0;
        for await (const segment of stream) {
          const newContent = segment.slice(previousLength);
          previousLength = segment.length;
          yield newContent;
        }
      } catch (error) {
        console.error('Failed to generate streaming summary:', error);
        throw error;
      }
    }
  
    // Generate key points from the text
    async generateKeyPoints(text, context = '') {
      if (!this.isAvailable || !this.summarizer) {
        throw new Error('AI Analyzer is not initialized');
      }
  
      try {
        const keyPointsSummarizer = await window.ai.summarizer.create({
          type: 'key-points',
          format: 'markdown',
          length: 'medium'
        });
  
        const keyPoints = await keyPointsSummarizer.summarize(text, {
          context: context
        });
        return keyPoints;
      } catch (error) {
        console.error('Failed to generate key points:', error);
        throw error;
      }
    }
  
    // Generate a headline for the text
    async generateHeadline(text, context = '') {
      if (!this.isAvailable || !this.summarizer) {
        throw new Error('AI Analyzer is not initialized');
      }
  
      try {
        const headlineSummarizer = await window.ai.summarizer.create({
          type: 'headline',
          format: 'plain-text',
          length: 'short'
        });
  
        const headline = await headlineSummarizer.summarize(text, {
          context: context
        });
        return headline;
      } catch (error) {
        console.error('Failed to generate headline:', error);
        throw error;
      }
    }
  
    // Split text into chunks of approximately equal size based on word count
    splitTextIntoChunks(text, wordLimit = this.WORD_LIMIT) {
      const words = text.split(/\s+/);
      const chunks = [];
      
      // Try to split on sentence boundaries when possible
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      let currentChunk = '';
      let currentWordCount = 0;
  
      for (const sentence of sentences) {
        const sentenceWordCount = sentence.split(/\s+/).length;
        
        if (currentWordCount + sentenceWordCount > wordLimit) {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
            currentWordCount = 0;
          }
          
          // If a single sentence is too long, force split it
          if (sentenceWordCount > wordLimit) {
            const words = sentence.split(/\s+/);
            let tempChunk = '';
            let tempWordCount = 0;
            
            for (const word of words) {
              if (tempWordCount + 1 > wordLimit) {
                chunks.push(tempChunk.trim());
                tempChunk = '';
                tempWordCount = 0;
              }
              tempChunk += word + ' ';
              tempWordCount++;
            }
            if (tempChunk) {
              currentChunk = tempChunk;
              currentWordCount = tempWordCount;
            }
          } else {
            currentChunk = sentence + ' ';
            currentWordCount = sentenceWordCount;
          }
        } else {
          currentChunk += sentence + ' ';
          currentWordCount += sentenceWordCount;
        }
      }
  
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
  
      return chunks;
    }
  
    // Analyze text for legal gotchas and loopholes
    async analyzeLegalGotchas(text) {
      try {
        // First, check if we need to chunk the text
        const words = text.split(/\s+/).length;
        let finalSummary;
  
        if (words > this.WORD_LIMIT) {
          // Split text into chunks and summarize each
          const chunks = this.splitTextIntoChunks(text);
          const summaries = [];
  
          for (const chunk of chunks) {
            const summary = await this.generateSummary(chunk, 'This is a portion of a legal document');
            summaries.push(summary);
          }
  
          // Combine summaries into one text
          finalSummary = summaries.join('\n\n');
        } else {
          finalSummary = text;
        }
  
        // Create a specialized summarizer for identifying gotchas and loopholes
        const gotchaAnalyzer = await window.ai.summarizer.create({
          sharedContext: 'Identify potential legal issues, loopholes, gotchas, and concerning clauses in this legal text',
          type: 'key-points',
          format: 'markdown',
          length: 'long'
        });
  
        // Generate analysis focusing on gotchas and loopholes
        const analysis = await gotchaAnalyzer.summarize(finalSummary, {
          context: `
            Please identify and explain:
            1. Potential loopholes or ambiguous language
            2. Hidden clauses or concerning terms
            3. Vague or undefined terms
            4. Unusual or potentially unfair conditions
            5. Missing important details or safeguards
          `
        });
  
        return {
          wordCount: words,
          wasChunked: words > this.WORD_LIMIT,
          analysis: analysis
        };
      } catch (error) {
        console.error('Failed to analyze legal gotchas:', error);
        throw error;
      }
    }
  }