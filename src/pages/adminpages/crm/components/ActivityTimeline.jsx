import PropTypes from 'prop-types';

const TYPE_STYLES = {
  account_created: 'bg-blue-100 text-blue-800',
  order_placed: 'bg-green-100 text-green-800',
  return_requested: 'bg-yellow-100 text-yellow-800',
  return_completed: 'bg-amber-100 text-amber-800',
  trade_in_submitted: 'bg-orange-100 text-orange-800',
  note_added: 'bg-purple-100 text-purple-800',
};

const TYPE_LABELS = {
  account_created: 'Account',
  order_placed: 'Order',
  return_requested: 'Return request',
  return_completed: 'Return',
  trade_in_submitted: 'Trade-in',
  note_added: 'Note',
};

const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ActivityTimeline = ({ activity = [] }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    {activity.length === 0 ? (
      <p className="py-6 text-center text-sm text-gray-500">No activity yet.</p>
    ) : (
      <ol className="relative border-l border-gray-200 pl-4">
        {activity.map((event, index) => (
          <li key={`${event.type}-${event.at}-${index}`} className="mb-6 ml-2 last:mb-0">
            <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-300" />
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  TYPE_STYLES[event.type] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {TYPE_LABELS[event.type] || event.type}
              </span>
              <time className="text-xs text-gray-500">{formatDateTime(event.at)}</time>
            </div>
            <p className="mt-1 text-sm font-semibold text-gray-900">{event.title}</p>
            {event.detail && <p className="mt-0.5 text-sm text-gray-600">{event.detail}</p>}
          </li>
        ))}
      </ol>
    )}
  </div>
);

ActivityTimeline.propTypes = {
  activity: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      title: PropTypes.string,
      detail: PropTypes.string,
      at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    })
  ),
};

export default ActivityTimeline;
