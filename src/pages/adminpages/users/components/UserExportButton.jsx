/**
 * UserExportButton Component
 * CSV export button for users data
 */

import PropTypes from 'prop-types';
import { CSVLink } from 'react-csv';

const UserExportButton = ({ users }) => {
    const getCurrentDate = () => {
        return new Date().toISOString().slice(0, 10);
    };

    return (
        <CSVLink
            data={users}
            filename={`users_${getCurrentDate()}.csv`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            target="_blank"
        >
            Export to CSV
        </CSVLink>
    );
};

UserExportButton.propTypes = {
    users: PropTypes.array.isRequired
};

export default UserExportButton;
