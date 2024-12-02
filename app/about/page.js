import Link from 'next/link';

export default function About() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">
                Legal<span className="text-indigo-600">Lens</span>
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                href="/about" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="/"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Try Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Project Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            About Legal<span className="text-indigo-600">Lens</span>
          </h1>
          <p className="text-gray-600 mb-6">
            LegalLens is an AI-powered legal document analyzer built for the Google Chrome Built-in AI Challenge. 
            It leverages Chrome&apos;s built-in AI capabilities to make legal documents more accessible and understandable for everyone.
          </p>
          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium text-gray-900">Quick Analysis:</span> Instant AI-powered insights into your legal documents
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium text-gray-900">Privacy-First:</span> All processing happens in your browser using Chrome&apos;s built-in AI
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-600">
                  <span className="font-medium text-gray-900">Simple Explanations:</span> Complex legal terms simplified and explained
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Technology</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Built with modern web technologies and Chrome&apos;s latest AI capabilities:
            </p>
            <ul className="grid grid-cols-2 gap-4">
              <li className="flex items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">Next.js</span>
              </li>
              <li className="flex items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">Chrome AI APIs</span>
              </li>
              <li className="flex items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">Tailwind CSS</span>
              </li>
              <li className="flex items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-900">React</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Hackathon Context */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Google Chrome Built-in AI Challenge</h2>
          <p className="text-gray-600 mb-6">
            This project was created for the Google Chrome Built-in AI Challenge, which invites developers to explore 
            new possibilities using Chrome&apos;s built-in AI APIs and models, including Gemini Nano.
          </p>
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">APIs Used:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <svg className="h-4 w-4 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                Summarization API for document overview
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                Write API for simplified explanations
              </li>
              <li className="flex items-center">
                <svg className="h-4 w-4 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                Rewrite API for legal term clarification
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
