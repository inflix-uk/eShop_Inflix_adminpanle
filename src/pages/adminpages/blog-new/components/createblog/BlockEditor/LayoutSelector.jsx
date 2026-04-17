"use client";

import PropTypes from 'prop-types';

const layouts = [
  { id: 'full', label: '100', cols: [100] },
  { id: 'half-half', label: '50 / 50', cols: [50, 50] },
  { id: 'one-third-two-thirds', label: '33 / 66', cols: [33, 66] },
  { id: 'two-thirds-one-third', label: '66 / 33', cols: [66, 33] },
  { id: 'three-cols', label: '33 / 33 / 33', cols: [33, 33, 33] },
  { id: 'three-cols-weighted', label: '25 / 50 / 25', cols: [25, 50, 25] }
];

export default function LayoutSelector({ onSelect }) {
  return (
    <div className="p-5 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Divide into columns. Select a layout:</h3>
      
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            type="button"
            onClick={() => onSelect(layout)}
            className="flex flex-col items-center p-2 border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div className="flex w-full h-12 gap-1 mb-2">
              {layout.cols.map((width, idx) => (
                <div 
                  key={idx}
                  className="bg-gray-400 rounded-sm" 
                  style={{ width: `${width}%` }}
                ></div>
              ))}
            </div>
            <span className="text-xs text-gray-600">{layout.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

LayoutSelector.propTypes = {
  onSelect: PropTypes.func.isRequired
};
