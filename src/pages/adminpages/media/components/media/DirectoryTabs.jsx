import PropTypes from 'prop-types';
import { getDirectoryDisplayName } from '../../utils/mediaUtils';

const DirectoryTabs = ({ directories, selectedTab, onTabChange }) => {
  if (!directories?.length) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 mb-4">
      <nav className="-mb-px flex flex-wrap gap-1" aria-label="Tabs">
        {directories.map((directory, index) => (
          <button
            key={directory.name || index}
            onClick={() => onTabChange(directory.name)}
            className={`${
              selectedTab === directory.name
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } border-b-2 py-3 px-4 text-center text-sm font-medium capitalize whitespace-nowrap`}
            title={directory.name}
          >
            {getDirectoryDisplayName(directory.name)}
          </button>
        ))}
      </nav>
    </div>
  );
};

DirectoryTabs.propTypes = {
  directories: PropTypes.array.isRequired,
  selectedTab: PropTypes.string,
  onTabChange: PropTypes.func.isRequired,
};

export default DirectoryTabs;
