import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import ReturnModal from '../components/ReturnModal';
import { Shield, RefreshCw, AlertTriangle, Package, Search, Loader2 } from 'lucide-react';

const AdminBorrowings = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  // Return modal state
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const fetchBorrowings = async () => {
    try {
      setLoading(true);
      const data = await api.getBorrowings();
      setBorrowings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const handleReturnClick = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsReturnModalOpen(true);
  };

  const filteredBorrowings = borrowings.filter((b) => {
    const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
    const studentName = b.userId ? b.userId.name.toLowerCase() : '';
    const equipmentName = b.equipmentId ? b.equipmentId.name.toLowerCase() : '';
    const matchesSearch = studentName.includes(search.toLowerCase()) || equipmentName.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">All Campus Borrowings & Returns</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Admin oversight: Monitor active loans, track overdue items, and mark equipment returns.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700/80 text-xs">
          {['ALL', 'BORROWED', 'OVERDUE', 'RETURNED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterStatus === st
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by student name or gear model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs text-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="bg-slate-800/90 rounded-3xl border border-slate-700/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Equipment</th>
                  <th className="py-3.5 px-4">Borrower Student</th>
                  <th className="py-3.5 px-4">Qty</th>
                  <th className="py-3.5 px-4">Borrow Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Deposit</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredBorrowings.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-700/30 transition-colors">
                    
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-sky-400 shrink-0" />
                      {item.equipmentId ? item.equipmentId.name : 'Equipment'}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {item.userId ? item.userId.name : 'Student'}
                      <span className="text-[10px] text-slate-400 block">{item.userId ? item.userId.email : ''}</span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-sky-400">
                      {item.quantity} unit(s)
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(item.borrowDate).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-300">
                      {new Date(item.dueDate).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ₹{item.depositAmount}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        item.status === 'BORROWED' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                        item.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' :
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
                          Process Return
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Return Modal */}
      <ReturnModal
        borrowing={selectedBorrowing}
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedBorrowing(null);
        }}
        onSuccess={fetchBorrowings}
      />

    </div>
  );
};

export default AdminBorrowings;
