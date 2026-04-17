import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiPlus, FiEdit2, FiTrash2, FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import {
  getAllPreloadedMessages,
  createPreloadedMessage,
  updatePreloadedMessage,
  deletePreloadedMessage,
  togglePreloadedMessageStatus
} from '../../service';

/**
 * PreloadedMessagesModal Component
 * Modal for CRUD operations on preloaded messages
 */
const PreloadedMessagesModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [formData, setFormData] = useState({
    message: '',
    isActive: true
  });

  // Fetch messages on mount
  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const result = await getAllPreloadedMessages();
      if (result.success) {
        setMessages(result.messages || []);
      } else {
        toast.error(result.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      toast.error('Message is required');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (editingMessage) {
        result = await updatePreloadedMessage(editingMessage._id, formData);
        if (result.success) {
          toast.success('Message updated successfully');
        }
      } else {
        result = await createPreloadedMessage(formData);
        if (result.success) {
          toast.success('Message created successfully');
        }
      }

      if (result.success) {
        resetForm();
        fetchMessages();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('Failed to save message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (msg) => {
    setEditingMessage(msg);
    setFormData({
      message: msg.message,
      isActive: msg.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deletePreloadedMessage(id);
      if (result.success) {
        toast.success('Message deleted successfully');
        fetchMessages();
      } else {
        toast.error(result.error || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const result = await togglePreloadedMessageStatus(id);
      if (result.success) {
        toast.success(result.message);
        fetchMessages();
      } else {
        toast.error(result.error || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle status');
    }
  };

  const resetForm = () => {
    setFormData({
      message: '',
      isActive: true
    });
    setEditingMessage(null);
    setShowForm(false);
  };

  const filteredMessages = messages.filter(
    (msg) => msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Preloaded Messages
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add New</span>
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingMessage ? 'Edit Message' : 'Create New Message'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Enter message content"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Saving...' : editingMessage ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Messages List */}
            {isLoading && !showForm ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchTerm ? 'No messages found matching your search.' : 'No preloaded messages yet. Click "Add New" to create one.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`p-4 rounded-lg border ${
                      msg.isActive
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!msg.isActive && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {msg.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleStatus(msg._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            msg.isActive
                              ? 'text-blue-600 hover:bg-blue-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={msg.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {msg.isActive ? (
                            <FiToggleRight className="w-5 h-5" />
                          ) : (
                            <FiToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(msg)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(msg._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

PreloadedMessagesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PreloadedMessagesModal;
