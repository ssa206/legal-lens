'use client';
import { useState } from 'react';

export default function ActionModal({ isOpen, onClose, item, onSave }) {
  const [suggestedText, setSuggestedText] = useState('');
  
  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold text-gray-900">Take Action</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Issue</h3>
              <p className="mt-1 text-gray-600">{item.text}</p>
            </div>

            {item.recommendations.map((rec, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="font-medium text-gray-900">{rec.title}</h3>
                <p className="text-gray-600">{rec.suggestion}</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Example:</span> {rec.example}
                  </p>
                </div>

                <button
                  onClick={() => setSuggestedText(generateSuggestedText(rec))}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Generate suggested text
                </button>
              </div>
            ))}

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                Edit Suggested Text
              </label>
              <textarea
                value={suggestedText}
                onChange={(e) => setSuggestedText(e.target.value)}
                rows={10}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Edit or paste your text here..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
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
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
