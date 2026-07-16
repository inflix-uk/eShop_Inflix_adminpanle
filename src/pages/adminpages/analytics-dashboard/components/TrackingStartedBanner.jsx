import PropTypes from "prop-types";

export default function TrackingStartedBanner({ trackingStarted, preTrackingNote }) {
  if (!trackingStarted) return null;

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-900 shadow-sm">
      <p>
        Visitor tracking started on{" "}
        <span className="font-semibold">{trackingStarted}</span>. Older orders may not have
        visitor/session attribution.
      </p>
      {preTrackingNote ? (
        <p className="mt-1 text-xs text-red-800/90">{preTrackingNote}</p>
      ) : null}
    </div>
  );
}

TrackingStartedBanner.propTypes = {
  trackingStarted: PropTypes.string,
  preTrackingNote: PropTypes.string,
};
