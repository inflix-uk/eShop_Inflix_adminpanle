import PropTypes from "prop-types";

export default function UnavailableNotice({ title, message }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
      {title && <p className="text-sm font-medium text-gray-700">{title}</p>}
      <p className={`text-sm text-gray-500 ${title ? "mt-1" : ""}`}>{message}</p>
    </div>
  );
}

UnavailableNotice.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
};
