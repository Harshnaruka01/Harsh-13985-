import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';
import ReturnModal from '../components/ReturnModal';
import { Package, Clock, CheckCircle2, AlertTriangle, Camera, ArrowRight, Shield, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Return modal state
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const handleReturnClick = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsReturnModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-800 to-sky-950 p-6 md:p-8 rounded-3xl border border-slate-700/80 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full text-xs font-bold text-sky-400">
            <Camera className="w-3.5 h-3.5" />
            <span>AV Equipment Lending Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Track camera gear, check real-time date availability, manage student reservations, and auto-calculate refundable deposits & late fees.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              to="/equipment"
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Browse Gear Catalog
            </Link>
            <Link
              to="/my-borrowings"
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              My Active Borrowings
            </Link>
          </div>
        </div>

        {/* Decorative background icon */}
        <Camera className="absolute -right-8 -bottom-8 w-64 h-64 text-sky-500/5 rotate-12 pointer-events-none" />
      </div>

      {/* Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total AV Inventory"
            value={`${stats.totalEquipmentUnits} Units`}
            subtitle={`${stats.totalEquipmentItems} distinct equipment models`}
            icon={Package}
            color="blue"
          />
          <MetricCard
            title="Available Today"
            value={`${stats.availableUnits} Units`}
            subtitle="Free for immediate borrowing"
            icon={CheckCircle2}
            color="emerald"
          />
          <MetricCard
            title="Currently Borrowed"
            value={`${stats.currentlyBorrowedUnits} Units`}
            subtitle="Active out on loan"
            icon={Clock}
            color="amber"
          />
          <MetricCard
            title="Overdue Items"
            value={stats.overdueCount}
            subtitle="Requires immediate return nudge"
            icon={AlertTriangle}
            color={stats.overdueCount > 0 ? "rose" : "purple"}
          />
        </div>
      )}

      {/* User Active Limit Status Bar */}
      <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Student Borrowing Limit System</h3>
            <p className="text-xs text-slate-400">
              Each student is allowed maximum <span className="text-sky-400 font-semibold">{user?.maxBorrowLimit || 3} active equipment units</span> at once to ensure fair access.
            </p>
          </div>
        </div>
        <div className="shrink-0 px-4 py-2 bg-slate-900 rounded-xl border border-slate-700 text-xs font-bold text-emerald-400">
          Max {user?.maxBorrowLimit || 3} Units / Borrower
        </div>
      </div>

      {/* Recent Borrowings Table */}
      <div className="bg-slate-800/90 rounded-3xl border border-slate-700/80 overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Borrowing Activity</h2>
            <p className="text-xs text-slate-400">Latest reservations and active loans</p>
          </div>
          <Link
            to={user?.role === 'ADMIN' ? '/admin/borrowings' : '/my-borrowings'}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            View All Loans <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {stats?.recentBorrowings && stats.recentBorrowings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                <tr>
                  <th className="py-3 px-4">Equipment</th>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Borrow Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Deposit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {stats.recentBorrowings.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-700/30 transition-colors">
                    
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-sky-400 shrink-0" />
                      {item.equipmentId ? item.equipmentId.name : 'Unknown Equipment'}
                    </td>

                    <td className="py-3.5 px-4">
                      {item.userId ? item.userId.name : 'Student'}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-sky-300">
                      {item.quantity} unit(s)
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(item.borrowDate).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {new Date(item.dueDate).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ₹{item.depositAmount}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        item.status === 'BORROWED' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                        item.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        item.status === 'RETURNED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        'bg-slate-700 text-slate-400 border-slate-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {(item.status === 'BORROWED' || item.status === 'OVERDUE') && (
                        <button
                          onClick={() => handleReturnClick(item)}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Return
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-xs">
            No active borrowings recorded yet.
          </div>
        )}
      </div>

      {/* Return Modal */}
      <ReturnModal
        borrowing={selectedBorrowing}
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedBorrowing(null);
        }}
        onSuccess={fetchDashboard}
      />

    </div>
  );
};

export default Dashboard;
