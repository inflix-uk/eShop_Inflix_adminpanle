import PropTypes from 'prop-types';

const DirectoryTabs = ({ directories, selectedTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 mb-4">
      <nav className="-mb-px flex justify-between" aria-label="Tabs">
        {directories.map((directory, index) => (
          <button
            key={index}
            onClick={() => onTabChange(directory.name)}
            className={`${
              selectedTab === directory.name
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } w-1/4 border-b-2 py-4 px-1 text-center text-sm font-medium capitalize`}
          >
            {directory.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

DirectoryTabs.propTypes = {
  directories: PropTypes.array.isRequired,
  selectedTab: PropTypes.string,
  onTabChange: PropTypes.func.isRequired
};

export default DirectoryTabs;

