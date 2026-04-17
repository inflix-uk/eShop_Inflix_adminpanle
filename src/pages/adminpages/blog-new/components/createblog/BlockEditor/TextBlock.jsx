"use client";

import { useRef } from 'react';
import PropTypes from 'prop-types';
import { Grip, Trash2 } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';

export default function TextBlock({
  id,
  content = '',
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  colWidth = 100
} = {}) {
  const editorRef = useRef(null);

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow"
      style={{ width: `${colWidth}%` }}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Grip className="mr-2 text-gray-400 cursor-move" size={16} />
          <span className="text-sm font-medium text-gray-700">Text Block</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onMoveUp(id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(id)}
            className="p-1 text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-2">
        <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          licenseKey="gpl"
          onInit={(evt, editor) => (editorRef.current = editor)}
          value={content || ''}
          init={{
            height: 500,
            menubar: true,
            plugins: [
              "advlist",
              "autolink",
              "lists",
              "link",
              "image",
              "charmap",
              "preview",
              "anchor",
              "searchreplace",
              "visualblocks",
              "code",
              "fullscreen",
              "insertdatetime",
              "media",
              "table",
              "help",
              "wordcount"
            ],
            toolbar:
              "undo redo | blocks fontsize | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | table | removeformat | code",
            table_toolbar:
              "tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",
            content_style:
              "body { font-family:Helvetica,Arial,sans-serif; font-size:14px } li > h1, li > h2, li > h3, li > h4, li > h5, li > h6 { display: inline; margin: 0; }"
          }}
          onEditorChange={(newContent) => onChange(id, newContent)}
        />
      </div>
    </div>
  );
}

TextBlock.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
  colWidth: PropTypes.number
};
