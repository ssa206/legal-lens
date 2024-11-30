'use client';

const MAX_CHUNK_SIZE = 5000; // Adjust based on model's context window

export async function checkAICapabilities() {
  // Check if the summarizer API is supported
  if (!('ai' in window) || !('summarizer' in window.ai)) {
    console.log('AI summarizer API is not supported in this browser');
    return false;
  }

  try {
    const capabilities = await window.ai.summarizer.capabilities();
    return capabilities.available !== 'no';
  } catch (error) {
    console.error('Error checking AI capabilities:', error);
    return false;
  }
}

export async function createAISummarizer(onProgress) {
  if (!('ai' in window) || !('summarizer' in window.ai)) {
    throw new Error('AI summarizer API is not supported in this browser');
  }

  const options = {
    type: 'key-points',
    format: 'markdown',
    length: 'medium',
    monitor(m) {
      if (onProgress) {
        m.addEventListener('downloadprogress', (e) => {
          onProgress(e.loaded / e.total);
        });
      }
    }
  };

  return await window.ai.summarizer.create(options);
}

export async function analyzeText(text) {
  if (typeof window === 'undefined') return null;

  try {
    const summarizer = await createAISummarizer();
    
    const context = {
      context: 'This is a legal document that needs to be analyzed for key points, warnings, loopholes, and areas of interpretation.'
    };

    const summary = await summarizer.summarize(text, context);
    return parseAnalysis(summary);
  } catch (error) {
    console.error('Error analyzing text:', error);
    return null;
  }
}

function parseAnalysis(text) {
  // The summarizer returns markdown-formatted key points
  const sections = text.split('\n').filter(line => line.trim().startsWith('*'));
  
  return {
    warnings: sections.slice(0, 2).join('\n').replace(/^\*/gm, '').trim() || '',
    loopholes: sections.slice(2, 4).join('\n').replace(/^\*/gm, '').trim() || '',
    keyPoints: sections.slice(4, 6).join('\n').replace(/^\*/gm, '').trim() || '',
    interpretation: sections.slice(6).join('\n').replace(/^\*/gm, '').trim() || ''
  };
}
