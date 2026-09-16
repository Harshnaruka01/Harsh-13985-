import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import EquipmentModal from '../components/EquipmentModal';
import { Package, Plus, Edit, Trash2, Search, AlertTriangle, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';

const AdminEquipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Modal State
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await api.getEquipment({ search, activeOnly: false });
      setEquipmentList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [search]);

  const handleAdd = () => {
    setSelectedEquipment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedEquipment(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this equipment?')) return;

    try {
      await api.deleteEquipment(id);
      fetchEquipment();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Inventory Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Add new AV gear, modify daily late fees & deposits, track quantities and deactivate equipment.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Equipment
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search inventory by name or category..."
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
                  <th className="py-3.5 px-4">Equipment Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Total Qty</th>
                  <th className="py-3.5 px-4">Late Fee/Day</th>
                  <th className="py-3.5 px-4">Deposit</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {equipmentList.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-700/30 transition-colors">
                    
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-700">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-slate-500 m-2" />
                        )}
                      </div>
                      {item.name}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {item.category}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-sky-400">
                      {item.totalQuantity} units
                    </td>

                    <td className="py-3.5 px-4 font-medium text-amber-400">
                      ₹{item.lateFeePerDay}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-emerald-400">
                      ₹{item.depositAmount}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-900 rounded text-[11px] font-medium text-slate-300 border border-slate-700">
                        {item.condition}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.active
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                          title="Edit Equipment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {item.active && (
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Deactivate Equipment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      <EquipmentModal
        equipment={selectedEquipment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEquipment(null);
        }}
        onSuccess={fetchEquipment}
      />

    </div>
  );
};

export default AdminEquipment;
