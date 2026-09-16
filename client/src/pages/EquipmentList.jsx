import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import SearchFilter from '../components/SearchFilter';
import EquipmentCard from '../components/EquipmentCard';
import BorrowModal from '../components/BorrowModal';
import { Package, AlertTriangle, Loader2 } from 'lucide-react';

const EquipmentList = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Borrow Modal State
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await api.getEquipment({
        search,
        category,
        startDate,
        endDate
      });
      setEquipmentList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipment();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, startDate, endDate]);

  const handleBorrowClick = (equipment) => {
    setSelectedEquipment(equipment);
    setIsBorrowModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">AV Equipment Catalog</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse DSLR cameras, projectors, microphones & tripods. Select dates to check real-time availability.
          </p>
        </div>
      </div>

      {/* Filter Component */}
      <SearchFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs text-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <span>{error}</span>
        </div>
      ) : equipmentList.length === 0 ? (
        <div className="p-12 text-center bg-slate-800/80 rounded-3xl border border-slate-700/80 max-w-md mx-auto">
          <Package className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Equipment Found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipmentList.map((item) => (
            <EquipmentCard
              key={item._id}
              equipment={item}
              onBorrowClick={handleBorrowClick}
            />
          ))}
        </div>
      )}

      {/* Borrow Modal */}
      <BorrowModal
        equipment={selectedEquipment}
        isOpen={isBorrowModalOpen}
        onClose={() => {
          setIsBorrowModalOpen(false);
          setSelectedEquipment(null);
        }}
        onSuccess={fetchEquipment}
      />

    </div>
  );
};

export default EquipmentList;
