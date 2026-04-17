import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import {
  getPredefinedTags,
  addTagToConversation,
  removeTagFromConversation
} from '../../service/messagesService';

/**
 * TagSelector Component
 * Allows admins to assign tags to conversations
 */
const TagSelector = ({ userId, conversationId, orderId = null, currentTags = [], onTagsUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [predefinedTags, setPredefinedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customTagName, setCustomTagName] = useState('');
  const [customTagColor, setCustomTagColor] = useState('#3B82F6');
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch predefined tags
    const loadPredefinedTags = async () => {
      const result = await getPredefinedTags();
      if (result.success) {
        setPredefinedTags(result.tags);
      }
    };
    loadPredefinedTags();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTag = async (tag) => {
    // Check if tag already exists
    if (currentTags.some((t) => t.name === tag.name)) {
      return;
    }

    setLoading(true);
    const result = await addTagToConversation(
      userId,
      conversationId,
      tag.name,
      tag.color,
      orderId
    );

    if (result.success) {
      onTagsUpdate(result.tags);
    }
    setLoading(false);
  };

  const handleRemoveTag = async (tagName) => {
    setLoading(true);
    const result = await removeTagFromConversation(userId, conversationId, tagName);

    if (result.success) {
      onTagsUpdate(result.tags);
    }
    setLoading(false);
  };

  const handleCreateCustomTag = async (e) => {
    e.preventDefault();

    // Validate tag name
    if (!customTagName.trim()) {
      alert('Please enter a tag name');
      return;
    }

    // Check if tag already exists
    if (currentTags.some((t) => t.name.toLowerCase() === customTagName.trim().toLowerCase())) {
      alert('This tag already exists');
      return;
    }

    setLoading(true);
    const result = await addTagToConversation(
      userId,
      conversationId,
      customTagName.trim(),
      customTagColor,
      orderId
    );

    if (result.success) {
      onTagsUpdate(result.tags);
      setCustomTagName('');
      setCustomTagColor('#3B82F6');
      setIsOpen(false);
    }
    setLoading(false);
  };

  // Filter out already applied tags
  const availableTags = predefinedTags.filter(
    (tag) => !currentTags.some((t) => t.name === tag.name)
  );

  return (
    <div className="flex items-center gap-2 flex-wrap" ref={dropdownRef}>
      {/* Display current tags */}
      {currentTags.map((tag) => (
        <span
          key={tag.name}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
          style={{ backgroundColor: tag.color }}
        >
          {tag.name}
          <button
            onClick={() => handleRemoveTag(tag.name)}
            className="hover:opacity-75 focus:outline-none"
            disabled={loading}
            aria-label={`Remove ${tag.name} tag`}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </span>
      ))}

      {/* Add tag button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 px-3 py-1 border-2 border-dashed border-gray-300 rounded-full text-xs font-medium text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
          disabled={loading}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Tag
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-3">
              {/* Predefined Tags Section */}
              {availableTags.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">
                    Select a tag
                  </p>
                  <div className="mb-3">
                    {availableTags.map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => {
                          handleAddTag(tag);
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded transition-colors text-left"
                        disabled={loading}
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-sm text-gray-700">{tag.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                </>
              )}

              {/* Custom Tag Creation Form */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1 mb-2">
                  Create custom tag
                </p>
                <form onSubmit={handleCreateCustomTag} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 px-2">
                      Tag Name
                    </label>
                    <input
                      type="text"
                      value={customTagName}
                      onChange={(e) => setCustomTagName(e.target.value)}
                      placeholder="Enter tag name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 px-2">
                      Tag Color
                    </label>
                    <div className="flex items-center gap-2 px-2">
                      <input
                        type="color"
                        value={customTagColor}
                        onChange={(e) => setCustomTagColor(e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        disabled={loading}
                      />
                      <input
                        type="text"
                        value={customTagColor}
                        onChange={(e) => setCustomTagColor(e.target.value)}
                        placeholder="#3B82F6"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                        maxLength={7}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Tag'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

TagSelector.propTypes = {
  userId: PropTypes.string.isRequired,
  conversationId: PropTypes.string.isRequired,
  orderId: PropTypes.string,
  currentTags: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired
    })
  ),
  onTagsUpdate: PropTypes.func.isRequired
};

export default TagSelector;
