import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import Side from '../../nav/Side';
import Top from '../../nav/Top';

export default function AnalyticsReportShell({
  selectedPage,
  title,
  children,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((open) => !open);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <Helmet>
        <title>{title} | Admin</title>
      </Helmet>

      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        toggleSidebar={toggleSidebar}
      />

      <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
        />

        <main className="py-6 sm:py-8 bg-gray-50 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

AnalyticsReportShell.propTypes = {
  selectedPage: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
