'use client';
import { useState, useEffect } from 'react';
import { diffChars } from 'diff';

export default function ActionModal({ isOpen, onClose, item, onSave }) {
  const [suggestedText, setSuggestedText] = useState('');
  const [activeTab, setActiveTab] = useState('edit'); // edit, diff, checklist
  const [checklist, setChecklist] = useState([]);
  const [savedVersions, setSavedVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showDiff, setShowDiff] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Generate initial checklist based on the issue
      generateChecklist(item);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, item]);

  if (!isOpen) return null;

  // Generate checklist based on the issue and recommendations
  const generateChecklist = (item) => {
    const baseChecklist = [
      { id: 1, text: 'Review current clause', completed: false },
      { id: 2, text: 'Compare with suggested improvements', completed: false },
      { id: 3, text: 'Check for legal compliance', completed: false },
      { id: 4, text: 'Verify clarity and specificity', completed: false },
    ];

    // Add recommendation-specific items
    const recommendationItems = item.recommendations.map((rec, idx) => ({
      id: 5 + idx,
      text: `Address: ${rec.title}`,
      completed: false,
      details: rec.suggestion
    }));

    setChecklist([...baseChecklist, ...recommendationItems]);
  };

  // Generate suggested text based on the recommendation
  const generateSuggestedText = (recommendation) => {
    switch (recommendation.title) {
      case 'Address Liability Concerns':
        return `Liability and Indemnification:
1. Maximum Liability: The total aggregate liability of either party under this agreement shall not exceed [amount].
2. Exclusions: This limitation of liability shall not apply to:
   a) Willful misconduct or gross negligence
   b) Breach of confidentiality obligations
   c) Intellectual property infringement
3. Indemnification: Each party agrees to indemnify and hold harmless the other party against...`;
      
      case 'Clarify Termination Terms':
        return `Termination:
1. Term: This agreement shall commence on [date] and continue for [period].
2. Termination for Convenience: Either party may terminate this agreement upon [X] days written notice.
3. Termination for Cause: Either party may terminate immediately upon written notice if:
   a) The other party breaches any material term
   b) The other party becomes insolvent
4. Post-Termination Obligations:
   a) Return of confidential information
   b) Payment of outstanding fees
   c) [Other specific obligations]`;
      
      case 'Specify Payment Terms':
        return `Payment Terms:
1. Fees: [Description of fees and amounts]
2. Payment Schedule: Payments shall be made [monthly/quarterly/annually] within [X] days of invoice date
3. Late Payments: Any payment not received within [X] days shall accrue interest at [Y]% per month
4. Taxes: All fees are exclusive of applicable taxes
5. Disputed Charges: Client shall notify Provider of any disputed charges within [X] days`;
      
      default:
        return '';
    }
  };

  const saveVersion = () => {
    const newVersion = {
      id: Date.now(),
      text: suggestedText,
      timestamp: new Date().toISOString(),
      checklist: checklist
    };
    setSavedVersions([...savedVersions, newVersion]);
  };

  const exportChanges = () => {
    const exportData = {
      issue: item.text,
      recommendations: item.recommendations,
      suggestedText,
      checklist,
      versions: savedVersions
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal-changes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderDiff = () => {
    if (!selectedVersion) return null;
    
    const diff = diffChars(selectedVersion.text, suggestedText);
    
    return (
      <div className="font-mono text-sm whitespace-pre-wrap">
        {diff.map((part, index) => (
          <span
            key={index}
            className={
              part.added ? 'bg-green-100 text-green-800' :
              part.removed ? 'bg-red-100 text-red-800' :
              'text-gray-800'
            }
          >
            {part.value}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="relative bg-white rounded-xl max-w-4xl w-full mx-4 my-8">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Take Action</h2>
              <p className="text-sm text-gray-500 mt-1">Address and resolve the identified issue</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Issue Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900">Issue</h3>
            <p className="mt-1 text-gray-600">{item.text}</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('edit')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'edit'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setActiveTab('checklist')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'checklist'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Checklist
              </button>
              <button
                onClick={() => setActiveTab('versions')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'versions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Versions
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'edit' && (
              <div className="space-y-4">
                {/* Recommendations */}
                {item.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <h3 className="font-medium text-gray-900">{rec.title}</h3>
                    <p className="text-gray-600">{rec.suggestion}</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Example:</span> {rec.example}
                      </p>
                    </div>
                    <button
                      onClick={() => setSuggestedText(generateSuggestedText(rec))}
                      className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100"
                    >
                      Use this template
                    </button>
                  </div>
                ))}

                {/* Text Editor */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block font-medium text-gray-700">
                      Edit Suggested Text
                    </label>
                    <button
                      onClick={saveVersion}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Save Version
                    </button>
                  </div>
                  <textarea
                    value={suggestedText}
                    onChange={(e) => setSuggestedText(e.target.value)}
                    rows={10}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="Edit or paste your text here..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'checklist' && (
              <div className="space-y-4">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {
                        setChecklist(checklist.map(i =>
                          i.id === item.id ? { ...i, completed: !i.completed } : i
                        ));
                      }}
                      className="mt-1 h-4 w-4 text-blue-600 rounded"
                    />
                    <div>
                      <p className="text-gray-900">{item.text}</p>
                      {item.details && (
                        <p className="text-sm text-gray-500 mt-1">{item.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'versions' && (
              <div className="space-y-4">
                {savedVersions.map((version) => (
                  <div key={version.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-gray-500">
                        {new Date(version.timestamp).toLocaleString()}
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => {
                            setSelectedVersion(version);
                            setShowDiff(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Compare
                        </button>
                        <button
                          onClick={() => setSuggestedText(version.text)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Restore
                        </button>
                      </div>
                    </div>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                      {version.text.substring(0, 200)}...
                    </pre>
                  </div>
                ))}

                {showDiff && selectedVersion && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Comparing Changes</h4>
                    {renderDiff()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={exportChanges}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export</span>
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSave(suggestedText);
                  onClose();
                }}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
