import PropTypes from 'prop-types';
import MetaPageForm from './MetaPageForm';

/**
 * Modal component for editing static meta pages
 */
const MetaPageModal = ({ 
  isOpen, 
  selectedPage = null, 
  formData, 
  setFormData, 
  handleSubmit, 
  handleCloseModal 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={handleCloseModal}
          ></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {selectedPage ? `Edit Meta Information - ${selectedPage.pageName}` : "Add New Page"}
            </h3>
            <MetaPageForm
              formData={formData}
              setFormData={setFormData}
              selectedPage={selectedPage}
              handleSubmit={handleSubmit}
              handleCloseModal={handleCloseModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

MetaPageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  selectedPage: PropTypes.shape({
    pageName: PropTypes.string,
  }),
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCloseModal: PropTypes.func.isRequired
};

export default MetaPageModal;
