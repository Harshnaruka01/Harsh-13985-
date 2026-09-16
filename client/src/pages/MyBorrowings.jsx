import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import ReturnModal from '../components/ReturnModal';
import { Clock, RefreshCw, AlertTriangle, CheckCircle2, Package, Loader2 } from 'lucide-react';

const MyBorrowings = () => {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Return modal state
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const fetchMyBorrowings = async () => {
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
    fetchMyBorrowings();
  }, []);

  const handleReturnClick = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setIsReturnModalOpen(true);
  };

  const filteredBorrowings = borrowings.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">My Equipment Loans</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track your reserved gear, return dates, deposits, and return equipment to claim your refund.
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
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs text-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <span>{error}</span>
        </div>
      ) : filteredBorrowings.length === 0 ? (
        <div className="p-12 text-center bg-slate-800/80 rounded-3xl border border-slate-700/80 max-w-md mx-auto">
          <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Borrowings Found</h3>
          <p className="text-xs text-slate-400">You currently have no equipment records under this status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBorrowings.map((item) => {
            const equipment = item.equipmentId || {};
            const isOverdue = item.status === 'OVERDUE';
            const isReturned = item.status === 'RETURNED';

            return (
              <div
                key={item._id}
                className={`bg-slate-800/90 rounded-3xl border p-6 shadow-xl space-y-4 flex flex-col justify-between transition-all ${
                  isOverdue ? 'border-rose-500/40 bg-gradient-to-br from-slate-800 to-rose-950/20' : 'border-slate-700/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-sky-400 border border-slate-700">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{equipment.name || 'Equipment Item'}</h3>
                        <span className="text-[11px] text-slate-400 font-medium">Category: {equipment.category || 'AV'}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
                      item.status === 'BORROWED' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                      item.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' :
                      item.status === 'RETURNED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      'bg-slate-700 text-slate-400 border-slate-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Dates & Quantities */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-700/40 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Qty</span>
                      <span className="font-bold text-sky-300">{item.quantity} Unit(s)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Borrow Date</span>
                      <span className="font-medium text-slate-300">{new Date(item.borrowDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Due Date</span>
                      <span className={`font-bold ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                        {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Deposit</span>
                      <span className="font-bold text-emerald-400">₹{item.depositAmount}</span>
                    </div>
                  </div>

                  {/* Return Summary Info (if returned) */}
                  {isReturned && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs space-y-1 text-emerald-200">
                      <div className="flex justify-between">
                        <span>Returned On:</span>
                        <span className="font-medium text-white">{new Date(item.returnedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Late Fee Deducted ({item.lateDays} days late):</span>
                        <span className="font-bold text-amber-400">₹{item.lateFee}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm pt-1 border-t border-emerald-500/20">
                        <span>Refund Recieved:</span>
                        <span className="text-emerald-400">₹{item.refundAmount}</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Return Action button */}
                {!isReturned && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleReturnClick(item)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Mark Returned & Claim Deposit Refund
                    </button>
                  </div>
                )}

              </div>
            );
          })}
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
        onSuccess={fetchMyBorrowings}
      />

    </div>
  );
};

export default MyBorrowings;
