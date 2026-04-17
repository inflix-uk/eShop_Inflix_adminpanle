import PropTypes from 'prop-types';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search Images by Name..."
        className="block w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>
  );
};

SearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired
};

export default SearchBar;

