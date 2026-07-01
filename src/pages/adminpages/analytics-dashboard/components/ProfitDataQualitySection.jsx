import PropTypes from "prop-types";

export default function ProfitDataQualitySection({ data }) {
  if (!data?.show) return null;

  return (
    <div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-[#92400E]">
      <p className="text-sm font-semibold">Profit data quality</p>
      <p className="text-sm">
        {data.lineItemsMissingCost} order lines missing product cost match
      </p>
    </div>
  );
}

ProfitDataQualitySection.propTypes = {
  data: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    lineItemsMissingCost: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  }).isRequired,
};
