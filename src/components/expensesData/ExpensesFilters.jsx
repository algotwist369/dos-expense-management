import React from 'react';
import { HiRefresh } from "react-icons/hi";
import { useTheme } from '../../context/ThemeContext';

const ExpensesFilters = ({
  search,
  setSearch,
  regionFilter,
  setRegionFilter,
  paidToFilter,
  setPaidToFilter,
  dateFilter,
  setDateFilter,
  showArea,
  setShowArea,
  showCentre,
  setShowCentre,
  expenses,
  handleRefresh,
  rotating
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`rounded-xl shadow-md p-6 mb-8 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Filters & Controls
          </h3>
        </div>
        <button
          onClick={handleRefresh}
          className="flex gap-2 p-2 rounded-md bg-gray-100 dark:bg-gray-700"
        >
          <HiRefresh
            className={`text-2xl transition-transform duration-500 ${rotating ? "rotate-[360deg]" : ""}`}
          /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {/* Search Input */}
        <div>
          <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Search Expenses
          </label>
          <div className="relative">
            <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, reason, or paid to..."
              className={`border rounded-lg pl-10 pr-3 py-3 w-full outline-none transition-colors duration-200 ${isDarkMode
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400'
                : 'border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400'
                }`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Region Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Filter by Region
          </label>
          <select
            className={`border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-colors duration-200 ${isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-200'
              }`}
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="">All Regions</option>
            {Array.isArray(expenses) &&
              [...new Set(expenses.flatMap((e) => e.region || []))].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
          </select>
        </div>

        {/* Paid To Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Filter by Paid To
          </label>
          <select
            className={`border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-colors duration-200 ${isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-200'
              }`}
            value={paidToFilter}
            onChange={(e) => setPaidToFilter(e.target.value)}
          >
            <option value="">All Recipients</option>
            {Array.isArray(expenses) &&
              [...new Set(expenses.map((e) => e.paidTo).filter(Boolean))].sort().map((paidTo) => (
                <option key={paidTo} value={paidTo}>
                  {paidTo}
                </option>
              ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Filter by Date
          </label>
          <select
            className={`border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-colors duration-200 ${isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white'
              : 'border-gray-200'
              }`}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>
      </div>

      {/* Column Toggle Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setShowArea(!showArea)}
            className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors ${showArea
              ? isDarkMode
                ? 'bg-green-900/50 text-green-400 border border-green-600'
                : 'bg-green-100 text-green-700 border border-green-200'
              : isDarkMode
                ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            type="button"
            title={showArea ? 'Hide Area column' : 'Show Area column'}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {showArea ? 'Hide' : 'Show'} Area
          </button>
          <button
            onClick={() => setShowCentre(!showCentre)}
            className={`px-4 py-3 rounded-lg font-medium text-sm transition-colors ${showCentre
              ? isDarkMode
                ? 'bg-green-900/50 text-green-400 border border-green-600'
                : 'bg-green-100 text-green-700 border border-green-200'
              : isDarkMode
                ? 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            type="button"
            title={showCentre ? 'Hide Centre column' : 'Show Centre column'}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {showCentre ? 'Hide' : 'Show'} Centre
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpensesFilters;
