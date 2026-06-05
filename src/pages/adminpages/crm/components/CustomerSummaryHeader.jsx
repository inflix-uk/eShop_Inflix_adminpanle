import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const formatMoney = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `£${Number(value).toFixed(2)}`;
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const StatCard = ({ label, value }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
  </div>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const CustomerSummaryHeader = ({ profile, stats }) => {
  if (!profile) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Customer 360</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{profile.name || 'Customer'}</h1>
          <div className="mt-3 space-y-1 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-500">Email:</span> {profile.email || '—'}
            </p>
            <p>
              <span className="font-semibold text-gray-500">Phone:</span> {profile.phone || '—'}
            </p>
            {profile.pricingGroup?.name && (
              <p>
                <span className="font-semibold text-gray-500">Pricing group:</span>{' '}
                {profile.pricingGroup.name}
              </p>
            )}
            <p>
              <span className="font-semibold text-gray-500">Member since:</span>{' '}
              {formatDate(profile.createdAt)}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to={`/admin/users/edit/${profile._id}`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Edit user profile
            </Link>
          </div>
        </div>
        <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total orders" value={stats?.totalOrders ?? 0} />
          <StatCard label="Total spend" value={formatMoney(stats?.totalSpend)} />
          <StatCard label="First order" value={formatDate(stats?.firstOrderAt)} />
          <StatCard label="Last order" value={formatDate(stats?.lastOrderAt)} />
        </div>
      </div>
    </div>
  );
};

CustomerSummaryHeader.propTypes = {
  profile: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    createdAt: PropTypes.string,
    pricingGroup: PropTypes.shape({ name: PropTypes.string }),
  }),
  stats: PropTypes.shape({
    totalOrders: PropTypes.number,
    totalSpend: PropTypes.number,
    firstOrderAt: PropTypes.string,
    lastOrderAt: PropTypes.string,
  }),
};

export default CustomerSummaryHeader;
