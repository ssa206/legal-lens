'use client';
import { useState, useEffect } from 'react';
import { RecommendationEngine } from './utils/recommendationUtils';
import ActionModal from './ActionModal';

export default function RecommendationsPanel({ findings, onActionClick }) {
  const [actionItems, setActionItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const engine = new RecommendationEngine();
    const items = engine.generateActionItems(findings);
    setActionItems(items);
  }, [findings]);

  const filteredItems = selectedCategory === 'all'
    ? actionItems
    : actionItems.filter(item => item.category === selectedCategory);

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleActionClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    onActionClick?.(item);
  };

  const handleSave = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recommendations & Action Items</h3>
          <div className="mt-2 flex gap-2">
            {['all', 'critical', 'warning', 'info'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredItems.map(item => (
            <div key={item.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    item.category === 'critical' ? 'bg-red-500' :
                    item.category === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{item.text}</p>
                    {item.recommendations.length > 0 && (
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="mt-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        {expandedItems.has(item.id) ? 'Hide' : 'Show'} recommendations
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleActionClick(item)}
                  className="ml-4 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100"
                >
                  Take Action
                </button>
              </div>

              {expandedItems.has(item.id) && (
                <div className="mt-3 ml-5 space-y-3">
                  {item.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-900">{rec.title}</div>
                      <p className="mt-1 text-sm text-gray-600">{rec.suggestion}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Example:</span> {rec.example}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        onSave={handleSave}
      />
    </>
  );
}
