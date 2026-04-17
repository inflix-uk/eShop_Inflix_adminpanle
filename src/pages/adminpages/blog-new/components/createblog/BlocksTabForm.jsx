"use client";

import BlockEditor from "./BlockEditor/BlockEditor";
import PropTypes from "prop-types";

export default function BlocksTabForm({ 
  blocks, 
  setBlocks,
  errors
}) {
  return (
    <div className="space-y-6">
      {/* Block-Based Content Editor */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Content Blocks <span className="text-red-500">*</span>
          </label>
        </div>
        
        <BlockEditor 
          blocks={blocks} 
          setBlocks={setBlocks} 
          className={errors.content ? "border border-red-300 rounded-md p-4" : "p-4"}
        />
        
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
      </div>
    </div>
  );
}

BlocksTabForm.propTypes = {
  blocks: PropTypes.array.isRequired,
  setBlocks: PropTypes.func.isRequired,
  errors: PropTypes.object
};
