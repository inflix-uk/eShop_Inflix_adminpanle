import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import Side from '../nav/Side';
import Top from '../nav/Top';
import { useAuth } from '../../../context/Auth';
import { getCustomer360 } from './services/crmService';
import CustomerSummaryHeader from './components/CustomerSummaryHeader';
import ActivityTimeline from './components/ActivityTimeline';
import OrderHistoryTable from './components/OrderHistoryTable';
import DevicesPurchasedTable from './components/DevicesPurchasedTable';
import TradeInHistoryTable from './components/TradeInHistoryTable';
import CustomerNotesPanel from './components/CustomerNotesPanel';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    {children}
  </section>
);

const Customer360 = () => {
  const { userId } = useParams();
  const { user: adminUser } = useAuth();
  const [selectedPage] = useState('crm-customers');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  const actor = useMemo(
    () => ({
      id: adminUser?._id,
      name: `${adminUser?.firstname || ''} ${adminUser?.lastname || ''}`.trim() || adminUser?.email,
    }),
    [adminUser]
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCustomer360(userId);
      if (response.status === 200) {
        setData(response);
      } else {
        toast.error(response.message || 'Failed to load customer profile');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load customer profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <>
      <Helmet>
        <title>Customer 360 | Admin</title>
      </Helmet>
      <div className="flex min-h-screen bg-gray-50">
        <Side
          selectedPage={selectedPage}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((v) => !v)}
          closeSidebar={() => setIsSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col lg:pl-72">
          <Top toggleSidebar={() => setIsSidebarOpen((v) => !v)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mb-4">
              <Link
                to="/admin/crm/customers"
                className="text-sm font-semibold text-primary hover:underline"
              >
                ← Back to customers
              </Link>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            ) : !data ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
                Customer profile could not be loaded.
              </div>
            ) : (
              <div className="space-y-8">
                <CustomerSummaryHeader profile={data.profile} stats={data.stats} />

                <div className="grid gap-8 xl:grid-cols-3">
                  <div className="xl:col-span-2 space-y-8">
                    <Section title="Order history">
                      <OrderHistoryTable orders={data.orders} />
                    </Section>
                    <Section title="Devices purchased">
                      <DevicesPurchasedTable devices={data.devicesPurchased} />
                    </Section>
                    <Section title="Trade-in history">
                      <TradeInHistoryTable tradeIns={data.tradeIns} />
                    </Section>
                  </div>
                  <div className="space-y-8">
                    <Section title="Activity timeline">
                      <ActivityTimeline activity={data.activity} />
                    </Section>
                    <Section title="Internal notes">
                      <CustomerNotesPanel
                        userId={userId}
                        notes={data.notes}
                        actor={actor}
                        onNotesChange={loadData}
                      />
                    </Section>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default Customer360;
