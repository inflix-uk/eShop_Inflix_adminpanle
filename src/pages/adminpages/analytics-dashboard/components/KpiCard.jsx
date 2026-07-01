import PropTypes from "prop-types";

const TONE_CLASSES = {
  blue: "bg-blue-50 border-blue-100 text-blue-900",
  purple: "bg-purple-50 border-purple-100 text-purple-900",
  green: "bg-emerald-50 border-emerald-100 text-emerald-900",
  teal: "bg-teal-50 border-teal-100 text-teal-900",
  pink: "bg-pink-50 border-pink-100 text-pink-900",
  red: "bg-red-50 border-red-100 text-red-700",
  orange: "bg-orange-50 border-orange-100 text-orange-700",
  slate: "bg-slate-50 border-slate-200 text-slate-800",
  indigo: "bg-indigo-50 border-indigo-100 text-indigo-900",
};

export default function KpiCard({
  label,
  value,
  tone = "slate",
  small = false,
  title,
  actionHint,
  onClick,
}) {
  const className = `rounded-lg border px-4 py-4 text-left w-full ${
    TONE_CLASSES[tone] || TONE_CLASSES.slate
  }${onClick ? " cursor-pointer hover:opacity-90 transition-opacity" : ""}`;

  const content = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className={`mt-2 font-semibold ${small ? "text-lg" : "text-2xl"}`}>{value}</p>
      {actionHint ? (
        <p className="mt-1.5 text-[11px] font-medium normal-case tracking-normal opacity-75">
          {actionHint}
        </p>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} title={title} onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <div className={className} title={title}>
      {content}
    </div>
  );
}

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  tone: PropTypes.string,
  small: PropTypes.bool,
  title: PropTypes.string,
  actionHint: PropTypes.string,
  onClick: PropTypes.func,
};
