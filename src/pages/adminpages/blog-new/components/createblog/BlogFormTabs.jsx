import { FileText, Globe, LayoutGrid, Lock } from "lucide-react";
import PropTypes from "prop-types";

const TABS = [
  { id: "content", label: "Content", icon: FileText, index: 0 },
  { id: "seo", label: "SEO", icon: Globe, index: 1 },
  { id: "blocks", label: "Blocks", icon: LayoutGrid, index: 2 },
];

/**
 * @param {string} activeTab - "content" | "seo" | "blocks"
 * @param {(id: string) => void} onRequestTab - parent only switches tab if unlocked
 * @param {number} maxUnlockedIndex - 0 = content only, 1 = +seo, 2 = all
 */
export default function BlogFormTabs({ activeTab, onRequestTab, maxUnlockedIndex }) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8" aria-label="Blog form steps">
        {TABS.map(({ id, label, icon: Icon, index }) => {
          const locked = index > maxUnlockedIndex;
          const selected = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              disabled={locked}
              aria-disabled={locked}
              aria-current={selected ? "step" : undefined}
              onClick={() => {
                if (!locked) onRequestTab(id);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2 ${
                locked
                  ? "border-transparent text-gray-400 cursor-not-allowed opacity-60"
                  : selected
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {locked ? <Lock className="h-4 w-4 shrink-0" aria-hidden /> : <Icon className="h-4 w-4 shrink-0" aria-hidden />}
              {label}
              {locked ? <span className="sr-only">(locked)</span> : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

BlogFormTabs.propTypes = {
  activeTab: PropTypes.oneOf(["content", "seo", "blocks"]).isRequired,
  onRequestTab: PropTypes.func.isRequired,
  maxUnlockedIndex: PropTypes.number.isRequired,
};
