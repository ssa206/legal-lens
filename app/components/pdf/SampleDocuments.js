'use client';

const SAMPLE_DOCUMENTS = [
  {
    title: 'Terms of Service Example',
    description: 'A standard terms of service agreement template',
    path: '/samples/terms-of-service.pdf',
  },
  {
    title: 'Privacy Policy Sample',
    description: 'Example privacy policy document',
    path: '/samples/privacy-policy.pdf',
  },
  {
    title: 'Employment Contract',
    description: 'Sample employment agreement',
    path: '/samples/employment-contract.pdf',
  }
];

export default function SampleDocuments({ onSelect }) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Or try one of our sample documents:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SAMPLE_DOCUMENTS.map((doc) => (
          <button
            key={doc.path}
            onClick={() => onSelect(doc.path)}
            className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-gray-900">{doc.title}</h4>
                <p className="text-sm text-gray-500">{doc.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
