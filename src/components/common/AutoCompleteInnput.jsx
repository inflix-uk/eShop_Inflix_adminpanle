import React, { useState } from 'react';

const AutocompleteInput = () => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [options, setOptions] = useState([]);

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
        // Set options based on selected category
        switch (event.target.value) {
            case 'color':
                setOptions(['Red', 'Blue', 'Green']); // Example color options
                break;
            case 'storage':
                setOptions(['16GB', '32GB', '64GB']); // Example storage options
                break;
            case 'condition':
                setOptions(['New', 'Used', 'Refurbished']); // Example condition options
                break;
            default:
                setOptions([]);
                break;
        }
    };

    return (
        <div>
            <label htmlFor="category">Select a category:</label>
            <select id="category" value={selectedCategory} onChange={handleCategoryChange}>
                <option value="">Select...</option>
                <option value="color">Color</option>
                <option value="storage">Storage</option>
                <option value="condition">Condition</option>
            </select>

            <label htmlFor="options">Options:</label>
            <select id="options" disabled={!selectedCategory}>
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default AutocompleteInput;