"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusCircle, Trash2, Grip, ChevronDown, ChevronRight } from 'lucide-react';
import { nanoid } from 'nanoid';
import LayoutSelector from './LayoutSelector';
import TextBlock from './TextBlock';
import ImageBlock from './ImageBlock';
import WidgetBlock from './WidgetBlock';
import WidgetPickerModal from './WidgetPickerModal';
import ProductsBlock from './ProductsBlock';
import { createBannerWidgetItem } from './bannerWidgetDefaults';
import {
  createCategoryCardWidgetItem,
  DEFAULT_CATEGORY_CARDS_SECTION,
} from './categoryCardWidgetDefaults';
import { createDefaultPromotionalSectionsContent } from './promotionalSectionsWidgetDefaults';
import PropTypes from 'prop-types';

function countBlocksInRow(row) {
  if (!row?.columns) return 0;
  return row.columns.reduce((acc, col) => acc + (col.blocks?.length || 0), 0);
}

export default function BlockEditor({ blocks, setBlocks, className, collapsibleRows = true }) {
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [widgetPickerTarget, setWidgetPickerTarget] = useState(null);
  /** row.id -> true when row body is collapsed */
  const [collapsedRowIds, setCollapsedRowIds] = useState({});

  useEffect(() => {
    if (!blocks.some((r) => !r?.id)) return;
    setBlocks((prev) => {
      if (!prev.some((r) => !r?.id)) return prev;
      return prev.map((r) => (r?.id ? r : { ...r, id: nanoid() }));
    });
  }, [blocks, setBlocks]);

  const handleRowDragEnd = (result) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;
    const next = Array.from(blocks);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setBlocks(next);
  };

  // Helper functions for managing blocks
  const deleteRow = (rowIndex) => {
    const newBlocks = [...blocks];
    newBlocks.splice(rowIndex, 1);
    setBlocks(newBlocks);
  };
  
  const addRow = (layout) => {
    const newRow = {
      id: nanoid(),
      type: 'row',
      columns: layout.cols.map(width => ({
        id: nanoid(),
        width,
        blocks: []
      }))
    };
    
    const newBlocks = [...blocks];
    
    if (selectedRowIndex !== null) {
      // Insert after the selected row
      newBlocks.splice(selectedRowIndex + 1, 0, newRow);
    } else {
      // Add to the end
      newBlocks.push(newRow);
    }
    
    setBlocks(newBlocks);
    setShowLayoutSelector(false);
    setSelectedRowIndex(null);
  };
  
  const addBlock = (rowIndex, columnIndex, blockType, widgetSubtype = 'slider') => {
    const newBlocks = [...blocks];
    const newBlock = {
      id: nanoid(),
      type: blockType,
      content: blockType === 'text' ? '## Start writing...' : null
    };
    
    if (blockType === 'image') {
      newBlock.content = {
        url: '',
        alt: '',
        heading: '', // Add heading field with default empty value
        externalLink: '' // Add externalLink field with default empty value
      };
    }

    if (blockType === 'widget') {
      if (widgetSubtype === 'newsletter') {
        newBlock.content = {
          widgetType: 'newsletter',
          heading: '',
          description: '',
          placeholder: 'Enter your email',
          buttonLabel: 'Subscribe',
          imageUrl: '',
        };
      } else if (widgetSubtype === 'faq') {
        newBlock.content = {
          widgetType: 'faq',
          sectionHeading: '',
          items: [{ id: nanoid(), question: '', answer: '' }],
        };
      } else if (widgetSubtype === 'video') {
        newBlock.content = {
          widgetType: 'video',
          videoUrl: '',
          heading: '',
          caption: '',
        };
      } else if (widgetSubtype === 'map') {
        newBlock.content = {
          widgetType: 'map',
          embedUrl: '',
          heading: '',
          heightPx: 400,
        };
      } else if (widgetSubtype === 'gallery') {
        newBlock.content = {
          widgetType: 'gallery',
          heading: '',
          items: [{ id: nanoid(), imageUrl: '', caption: '', alt: '' }],
        };
      } else if (widgetSubtype === 'iconBox') {
        newBlock.content = {
          widgetType: 'iconBox',
          heading: '',
          items: [{ id: nanoid(), iconCode: '', title: '', description: '' }],
        };
      } else if (widgetSubtype === 'testimonials') {
        newBlock.content = {
          widgetType: 'testimonials',
          heading: '',
          description: '',
          items: [
            {
              id: nanoid(),
              quote: '',
              authorName: '',
              authorRole: '',
              rating: 5,
              avatarUrl: '',
            },
          ],
        };
      } else if (widgetSubtype === 'trustpilot') {
        newBlock.content = {
          widgetType: 'trustpilot',
          embedScript: '',
        };
      } else if (widgetSubtype === 'siteBanners') {
        newBlock.content = {
          widgetType: 'siteBanners',
          items: [createBannerWidgetItem()],
        };
      } else if (widgetSubtype === 'categoryCards') {
        newBlock.content = {
          widgetType: 'categoryCards',
          ...DEFAULT_CATEGORY_CARDS_SECTION,
          items: [createCategoryCardWidgetItem()],
        };
      } else if (widgetSubtype === 'promotionalSections') {
        newBlock.content = createDefaultPromotionalSectionsContent();
      } else if (widgetSubtype === 'latestBlogs') {
        newBlock.content = {
          widgetType: 'latestBlogs',
          sectionHeading: 'Latest blogs',
          maxPosts: 6,
          viewAllLabel: 'View all blogs',
        };
      } else if (widgetSubtype === 'htmlCss') {
        newBlock.content = {
          widgetType: 'htmlCss',
          html: '',
          css: '',
        };
      } else {
        newBlock.content = {
          widgetType: 'slider',
          sectionHeading: '',
          sectionDescription: '',
          slides: [
            { id: nanoid(), heading: '', description: '', imageUrl: '' },
          ],
        };
      }
    }

    if (blockType === 'products') {
      newBlock.content = {
        sectionTitle: '',
        productIds: [],
        selectedProductsMeta: [],
        productSource: 'manual',
      };
    }
    
    newBlocks[rowIndex].columns[columnIndex].blocks.push(newBlock);
    setBlocks(newBlocks);
  };
  
  const updateBlockContent = (rowIndex, columnIndex, blockIndex, blockId, newContent) => {
    const newBlocks = [...blocks];
    const block = newBlocks[rowIndex].columns[columnIndex].blocks[blockIndex];
    
    if (block && block.id === blockId) {
      block.content = newContent;
      setBlocks(newBlocks);
    }
  };
  
  const deleteBlock = (rowIndex, columnIndex, blockId) => {
    const newBlocks = [...blocks];
    const column = newBlocks[rowIndex].columns[columnIndex];
    
    column.blocks = column.blocks.filter(block => block.id !== blockId);
    
    // Check if all columns in the row are empty, if so, delete the row too
    const rowEmpty = newBlocks[rowIndex].columns.every(col => col.blocks.length === 0);
    
    if (rowEmpty) {
      newBlocks.splice(rowIndex, 1);
    }
    
    setBlocks(newBlocks);
  };
  
  const moveBlock = (rowIndex, columnIndex, blockIndex, direction) => {
    const newBlocks = [...blocks];
    const column = newBlocks[rowIndex].columns[columnIndex];
    const block = column.blocks[blockIndex];
    
    if (direction === 'up' && blockIndex > 0) {
      // Move up within the same column
      column.blocks.splice(blockIndex, 1);
      column.blocks.splice(blockIndex - 1, 0, block);
    } else if (direction === 'down' && blockIndex < column.blocks.length - 1) {
      // Move down within the same column
      column.blocks.splice(blockIndex, 1);
      column.blocks.splice(blockIndex + 1, 0, block);
    }
    
    setBlocks(newBlocks);
  };

  const toggleRowCollapsed = (rowId) => {
    if (!collapsibleRows) return;
    setCollapsedRowIds((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const expandAllRows = () => {
    if (!collapsibleRows) return;
    setCollapsedRowIds({});
  };

  const collapseAllRows = () => {
    if (!collapsibleRows) return;
    const next = {};
    blocks.forEach((r) => {
      if (r?.id) next[r.id] = true;
    });
    setCollapsedRowIds(next);
  };

  return (
    <div className={className}>
      {collapsibleRows && blocks.length > 0 ? (
        <div className="flex flex-wrap items-center justify-end gap-2 mb-3">
          <button
            type="button"
            onClick={expandAllRows}
            className="text-xs font-medium text-gray-700 px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
          >
            Expand all rows
          </button>
          <button
            type="button"
            onClick={collapseAllRows}
            className="text-xs font-medium text-gray-700 px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
          >
            Collapse all rows
          </button>
        </div>
      ) : null}

      <DragDropContext onDragEnd={handleRowDragEnd}>
        <Droppable droppableId="block-editor-content-rows">
          {(droppableProvided) => (
            <div
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
            >
      {blocks.map((row, rowIndex) => {
        const rowCollapsed = collapsibleRows && Boolean(collapsedRowIds[row.id]);
        const blockCount = countBlocksInRow(row);

        return (
        <Draggable
          key={row.id}
          draggableId={String(row.id)}
          index={rowIndex}
        >
          {(dragProvided, snapshot) => (
        <div
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          className={`mb-6 border-2 border-gray-300 rounded-lg p-4 relative hover:border-blue-300 transition-colors ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400 ring-opacity-50 bg-white z-10' : ''
          }`}
        >
          {/* Row header with controls */}
          <div
            className={`flex justify-between items-center pb-2 border-b border-gray-200 bg-gray-50 -mx-4 -mt-4 px-4 py-2 rounded-t-lg ${
              rowCollapsed ? 'mb-0' : 'mb-4'
            }`}
          >
            <div className="flex items-center min-w-0 gap-1">
              {collapsibleRows ? (
                <button
                  type="button"
                  onClick={() => toggleRowCollapsed(row.id)}
                  className="p-1 rounded-md text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shrink-0"
                  title={rowCollapsed ? 'Expand row' : 'Collapse row'}
                  aria-expanded={!rowCollapsed}
                  aria-label={rowCollapsed ? `Expand row ${rowIndex + 1}` : `Collapse row ${rowIndex + 1}`}
                >
                  {rowCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                </button>
              ) : null}
              <span
                {...dragProvided.dragHandleProps}
                className="inline-flex items-center mr-1 text-gray-500 cursor-grab active:cursor-grabbing shrink-0 touch-none"
                title="Drag to reorder row"
              >
                <Grip size={18} />
              </span>
              <span className="text-sm font-medium text-gray-700">Row {rowIndex + 1}</span>
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full shrink-0">
                {row.columns.length} {row.columns.length === 1 ? 'column' : 'columns'}
              </span>
              {rowCollapsed ? (
                <span className="ml-2 text-xs text-gray-500 truncate">
                  · {blockCount} {blockCount === 1 ? 'block' : 'blocks'}
                </span>
              ) : null}
            </div>
            <button 
              type="button" 
              onClick={() => deleteRow(rowIndex)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shrink-0"
              title="Delete row"
            >
              <Trash2 size={18} />
            </button>
          </div>
          
          {!rowCollapsed ? (
          <div className="flex gap-4">
            {row.columns.map((column, columnIndex) => (
              <div 
                key={column.id} 
                className="flex flex-col"
                style={{ width: `${column.width}%` }}
              >
                {column.blocks.map((block, blockIndex) => (
                  <React.Fragment key={block.id}>
                    {block.type === 'text' ? (
                      <TextBlock 
                        id={block.id}
                        content={block.content}
                        colWidth={100}
                        onChange={(id, newContent) => updateBlockContent(rowIndex, columnIndex, blockIndex, id, newContent)}
                        onDelete={(id) => deleteBlock(rowIndex, columnIndex, id)}
                        onMoveUp={() => moveBlock(rowIndex, columnIndex, blockIndex, 'up')}
                        onMoveDown={() => moveBlock(rowIndex, columnIndex, blockIndex, 'down')}
                      />
                    ) : block.type === 'image' ? (
                      <ImageBlock 
                        id={block.id}
                        imageUrl={block.content.url}
                        altText={block.content.alt}
                        heading={block.content.heading} // Pass heading prop to ImageBlock
                        externalLink={block.content.externalLink} // Pass externalLink prop to ImageBlock
                        colWidth={100}
                        width={block.content.width}
                        height={block.content.height}
                        onChange={(id, newContent) => updateBlockContent(rowIndex, columnIndex, blockIndex, id, newContent)}
                        onDelete={(id) => deleteBlock(rowIndex, columnIndex, id)}
                        onMoveUp={() => moveBlock(rowIndex, columnIndex, blockIndex, 'up')}
                        onMoveDown={() => moveBlock(rowIndex, columnIndex, blockIndex, 'down')}
                      />
                    ) : block.type === 'widget' ? (
                      <WidgetBlock
                        id={block.id}
                        content={block.content}
                        onChange={(bid, newContent) =>
                          updateBlockContent(rowIndex, columnIndex, blockIndex, bid, newContent)
                        }
                        onDelete={(bid) => deleteBlock(rowIndex, columnIndex, bid)}
                        onMoveUp={() => moveBlock(rowIndex, columnIndex, blockIndex, 'up')}
                        onMoveDown={() => moveBlock(rowIndex, columnIndex, blockIndex, 'down')}
                      />
                    ) : block.type === 'products' ? (
                      <ProductsBlock
                        id={block.id}
                        content={block.content}
                        onChange={(bid, newContent) =>
                          updateBlockContent(rowIndex, columnIndex, blockIndex, bid, newContent)
                        }
                        onDelete={(bid) => deleteBlock(rowIndex, columnIndex, bid)}
                        onMoveUp={() => moveBlock(rowIndex, columnIndex, blockIndex, 'up')}
                        onMoveDown={() => moveBlock(rowIndex, columnIndex, blockIndex, 'down')}
                      />
                    ) : null}
                  </React.Fragment>
                ))}
                
                {/* Add Block Button - Only show if column has no blocks */}
                {column.blocks.length === 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => addBlock(rowIndex, columnIndex, 'text')}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm flex items-center gap-1"
                    >
                      <PlusCircle size={14} />
                      <span>Add Text</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock(rowIndex, columnIndex, 'image')}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm flex items-center gap-1"
                    >
                      <PlusCircle size={14} />
                      <span>Add Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setWidgetPickerTarget({ rowIndex, columnIndex })
                      }
                      className="px-3 py-2 bg-violet-100 text-violet-800 rounded-md hover:bg-violet-200 text-sm flex items-center gap-1"
                    >
                      <PlusCircle size={14} />
                      <span>Add Widget</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock(rowIndex, columnIndex, 'products')}
                      className="px-3 py-2 bg-emerald-100 text-emerald-800 rounded-md hover:bg-emerald-200 text-sm flex items-center gap-1"
                    >
                      <PlusCircle size={14} />
                      <span>Add products</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          ) : null}
        </div>
          )}
        </Draggable>
        );
      })}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Row with Layout Selector */}
      {showLayoutSelector ? (
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-blue-700">Select Row Layout</h3>
            <button
              type="button"
              onClick={() => setShowLayoutSelector(false)}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <LayoutSelector onSelect={addRow} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setShowLayoutSelector(true);
            setSelectedRowIndex(blocks.length - 1);
          }}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle size={20} />
          <span className="text-base">Add Content Row</span>
        </button>
      )}

      <WidgetPickerModal
        isOpen={!!widgetPickerTarget}
        onClose={() => setWidgetPickerTarget(null)}
        onSelectWidgetType={(widgetType) => {
          if (!widgetPickerTarget) return;
          const { rowIndex, columnIndex } = widgetPickerTarget;
          if (
            widgetType === "slider" ||
            widgetType === "newsletter" ||
            widgetType === "faq" ||
            widgetType === "video" ||
            widgetType === "map" ||
            widgetType === "gallery" ||
            widgetType === "iconBox" ||
            widgetType === "testimonials" ||
            widgetType === "trustpilot" ||
            widgetType === "siteBanners" ||
            widgetType === "categoryCards" ||
            widgetType === "promotionalSections" ||
            widgetType === "latestBlogs" ||
            widgetType === "htmlCss"
          ) {
            addBlock(rowIndex, columnIndex, "widget", widgetType);
          }
          setWidgetPickerTarget(null);
        }}
      />
    </div>
  );
}

BlockEditor.propTypes = {
  blocks: PropTypes.array.isRequired,
  setBlocks: PropTypes.func.isRequired,
  className: PropTypes.string,
  collapsibleRows: PropTypes.bool,
};