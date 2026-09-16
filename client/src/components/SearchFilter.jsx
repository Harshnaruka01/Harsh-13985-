import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';

const categories = ['All', 'Camera', 'Projector', 'Microphone', 'Tripod', 'Audio/Speaker', 'Other'];

const SearchFilter = ({ search, setSearch, category, setCategory, startDate, setStartDate, endDate, setEndDate }) => {
  return (
    <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/70 shadow-lg space-y-4">
      
      <div className="flex flex-col md:flex-row gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search gear name or model (e.g. DSLR, Epson, Shure)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>

        {/* Date Range Picker for Live Availability Search */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/80 text-xs">
          <Calendar className="w-4 h-4 text-sky-400 ml-2" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Dates:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

    </div>
  );
};

export default SearchFilter;
