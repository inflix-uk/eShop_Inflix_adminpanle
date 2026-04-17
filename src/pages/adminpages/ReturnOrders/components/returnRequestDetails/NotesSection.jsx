import PropTypes from 'prop-types';

/**
 * Notes Section Component
 * Displays additional notes for a return request
 */
const NotesSection = ({ notes }) => {
  return (
    <section className="mb-6">
      <h3 className="text-2xl font-bold mb-5 flex items-center text-gray-800">
        Notes
      </h3>
      <p className="text-gray-700">{notes || "No additional notes."}</p>
    </section>
  );
};

NotesSection.propTypes = {
  notes: PropTypes.string,
};

export default NotesSection;
