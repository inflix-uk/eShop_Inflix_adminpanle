import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  createCustomerNote,
  updateCustomerNote,
  deleteCustomerNote,
} from '../services/crmService';

const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const CustomerNotesPanel = ({ userId, notes = [], actor, onNotesChange }) => {
  const [newBody, setNewBody] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    const body = newBody.trim();
    if (!body) {
      toast.error('Note cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      await createCustomerNote(userId, body, actor);
      setNewBody('');
      toast.success('Note added');
      onNotesChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (noteId) => {
    const body = editBody.trim();
    if (!body) {
      toast.error('Note cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      await updateCustomerNote(userId, noteId, body, actor);
      setEditingId(null);
      setEditBody('');
      toast.success('Note updated');
      onNotesChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    setIsSaving(true);
    try {
      await deleteCustomerNote(userId, noteId, actor);
      toast.success('Note deleted');
      onNotesChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label htmlFor="new-note" className="mb-2 block text-sm font-semibold text-gray-700">
          Add internal note
        </label>
        <textarea
          id="new-note"
          rows={3}
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary focus:ring-primary"
          placeholder="Write a note visible only to admins..."
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleCreate}
            disabled={isSaving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            Add note
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note._id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{note.authorName || 'Admin'}</span>
                  {' · '}
                  {formatDateTime(note.createdAt)}
                  {note.updatedAt && note.updatedAt !== note.createdAt && ' (edited)'}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(note._id);
                      setEditBody(note.body);
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(note._id)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {editingId === note._id ? (
                <div>
                  <textarea
                    rows={3}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(note._id)}
                      disabled={isSaving}
                      className="rounded bg-primary px-3 py-1 text-xs font-semibold text-white"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditBody('');
                      }}
                      className="rounded border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm text-gray-800">{note.body}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

CustomerNotesPanel.propTypes = {
  userId: PropTypes.string.isRequired,
  notes: PropTypes.arrayOf(PropTypes.object),
  actor: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
  onNotesChange: PropTypes.func,
};

export default CustomerNotesPanel;
