# LegalLens - AI Legal Document Analysis Tool

LegalLens is an AI-powered web application that helps users understand complex legal documents using Chrome's built-in AI capabilities. Built for the Google Chrome Built-in AI Challenge, it provides intelligent analysis and insights for legal documents.

## Features

- **Document Upload**
  - Drag and drop PDF upload
  - Sample document selection
  - Client-side document processing
  - 10MB file size limit

- **AI Analysis**
  - Privacy policy analysis
  - Terms of service review
  - Legal document summarization
  - Risk assessment scoring
  - Detailed findings categorization

- **Privacy First**
  - Client-side processing
  - No server storage
  - Secure document handling
  - Chrome's built-in AI

- **Modern UI/UX**
  - Responsive design
  - Side-by-side document view
  - Interactive analysis panel
  - Export functionality

## Technology Stack

- **Frontend**: Next.js (React)
- **Styling**: Tailwind CSS
- **PDF Processing**: pdfjs-dist
- **AI Integration**: Chrome Built-in AI APIs
  - Summarization API
  - Write API
  - Rewrite API
  - Prompt API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- A modern web browser (preferably Google Chrome)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ssa206/legal-lens.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Build for Production

To create a production build:

```bash
npm run build
npm start
```

The production server will start at `http://localhost:3000`

## Requirements

- Google Chrome browser (for AI capabilities)
- Node.js 18+ 
- npm/yarn/pnpm

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open Chrome and navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
legal-lens/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   │   ├── AIAnalyzer.js  # AI analysis component
│   │   └── utils/         # Utility functions
│   ├── page.js            # Home page
│   └── about/             # About page
├── public/                 # Static assets
└── styles/                # Global styles
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

MIT License

Copyright (c) 2024 LegalLens

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.