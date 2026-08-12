import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboard';
import { Users, Package, AlertTriangle, IndianRupee, FileText } from 'lucide-react';

interface DashboardStats {
  activeCustomers: number;
  totalProducts: number;
  lowStockItems: number;
  monthlyRevenue: number;
  monthlyChallansCount: number;
}

interface ChallanSummary {
  id: string;
  challanNumber: string;
  customerName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  productName: string;
  type: string;
  quantity: number;
  reason: string;
  userName: string;
  createdAt: string;
}

const SkeletonCard = ({ height, width }: { height: number; width: number }) => (
  <div
    style={{
      height,
      width,
      background: 'var(--border-color)',
      borderRadius: '8px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}
  />
);

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentChallans, setRecentChallans] = useState<ChallanSummary[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await dashboardApi.getStats();
        setStats(response.data.stats);
        setRecentChallans(response.data.recentChallans);
        setRecentActivity(response.data.recentActivity);
      } catch (error) {
        console.error('Unable to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <section className="page-container">
        <div className="skeleton-grid">
          <SkeletonCard height={48} width={200} />
          <SkeletonCard height={48} width={180} />
          <SkeletonCard height={48} width={150} />
          <SkeletonCard height={48} width={140} />
          <SkeletonCard height={48} width={160} />
          <SkeletonCard height={200} width={400} />
          <SkeletonCard height={200} width={300} />
          <SkeletonCard height={150} width={350} />
        </div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <div className="flex justify-between align-center" style={{ marginBottom: '16px', animationDelay: '0.05s', animation: 'cardIn 0.5s ease-out forwards' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>Command Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Operations overview and quick access</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)', boxShadow: '0 0 8px var(--color-success)', animation: 'pulse 2s infinite' }}></div>
          <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600, letterSpacing: '0.5px' }}>SECURE SESSION</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card" style={{ animationDelay: '0.1s' }}>
          <Users size={32} style={{ color: 'var(--color-primary)', marginBottom: '8px' }} />
          <span className="stat-title">Active customers</span>
          <span className="stat-value">{stats?.activeCustomers ?? 0}</span>
        </div>
        <div className="glass-card stat-card" style={{ animationDelay: '0.15s' }}>
          <Package size={32} style={{ color: 'var(--color-secondary)', marginBottom: '8px' }} />
          <span className="stat-title">Total products</span>
          <span className="stat-value">{stats?.totalProducts ?? 0}</span>
        </div>
        <div className="glass-card stat-card" style={{ animationDelay: '0.2s' }}>
          <AlertTriangle size={32} style={{ color: 'var(--color-warning)', marginBottom: '8px' }} />
          <span className="stat-title">Low stock items</span>
          <span className="stat-value">{stats?.lowStockItems ?? 0}</span>
        </div>
        <div className="glass-card stat-card" style={{ animationDelay: '0.25s' }}>
          <IndianRupee size={32} style={{ color: 'var(--color-success)', marginBottom: '8px' }} />
          <span className="stat-title">Monthly revenue</span>
          <span className="stat-value">₹{stats?.monthlyRevenue?.toLocaleString() ?? 0}</span>
        </div>
        <div className="glass-card stat-card" style={{ animationDelay: '0.3s' }}>
          <FileText size={32} style={{ color: 'var(--color-accent)', marginBottom: '8px' }} />
          <span className="stat-title">Confirmed challans</span>
          <span className="stat-value">{stats?.monthlyChallansCount ?? 0}</span>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '24px', animationDelay: '0.35s' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Recent challans</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Challan</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentChallans.map((challan) => (
                <tr key={challan.id} style={{ transition: 'background-color 0.15s ease' }}>
                  <td>{challan.challanNumber}</td>
                  <td>{challan.customerName}</td>
                  <td>
                    <span className={`badge badge-${challan.status.toLowerCase()}`}>
                      {challan.status}
                    </span>
                  </td>
                  <td>₹{challan.totalAmount.toLocaleString()}</td>
                  <td>{new Date(challan.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card" style={{ animationDelay: '0.4s' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Recent stock activity</h3>
        <div className="timeline">
          {recentActivity.map((item) => (
            <div key={item.id} className="timeline-item" style={{ transition: 'margin-left 0.2s ease' }}>
              <span className="timeline-marker" />
              <div className="timeline-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  <strong>{item.productName}</strong>
                  <span>{item.type}</span>
                </div>
                <p>{item.reason}</p>
                <div className="timeline-time">
                  {item.userName} · {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};