import PropTypes from "prop-types";

export default function TrackingStartedBanner({ trackingStarted, preTrackingNote }) {
  if (!trackingStarted) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p>
        Visitor tracking started on{" "}
        <span className="font-semibold">{trackingStarted}</span>. Older orders may not have
        visitor/session attribution.
      </p>
      {preTrackingNote ? (
        <p className="mt-1 text-xs text-amber-800">{preTrackingNote}</p>
      ) : null}
    </div>
  );
}

TrackingStartedBanner.propTypes = {
  trackingStarted: PropTypes.string,
  preTrackingNote: PropTypes.string,
};
