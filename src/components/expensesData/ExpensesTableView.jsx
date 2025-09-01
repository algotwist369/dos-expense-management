import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AnalyticsDashboard from './AnalyticsDashboard';
import { useExpensesAnalytics } from './useExpensesAnalytics';

const ExpensesTableView = ({
  filtered,
  totalPayment,
  paginatedData,
  showArea,
  showCentre,
  page,
  setPage,
  totalPages,
  parseDate,
  expenses
}) => {
  const { isDarkMode } = useTheme();
  const [activeView, setActiveView] = useState('table'); // 'table' or 'analytics'
  
  // Use analytics hook
  const {
    analytics,
    trendChartData,
    regionChartData,
    userChartData,
    paidToChartData,
    parseDate: analyticsParseDate
  } = useExpensesAnalytics(filtered, expenses);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: '600',
          },
          color: isDarkMode ? '#D1D5DB' : '#374151',
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: isDarkMode ? '#4B5563' : '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          callback: function (value) {
            return '₹' + value.toLocaleString();
          },
          font: {
            size: 11,
          },
          color: isDarkMode ? '#9CA3AF' : '#6B7280',
        },
      },
      x: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: isDarkMode ? '#9CA3AF' : '#6B7280',
        },
      },
    },
  };

  return (
    <>
      {/* View Tabs */}
      <div className={`rounded-xl shadow-md p-6 mb-6 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Total Expenses: <span className="text-green-600">₹{totalPayment.toLocaleString()}</span>
            </h3>
            <span className={`text-sm px-2 py-1 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
              {filtered.length} records
            </span>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveView('table')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeView === 'table'
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeView === 'analytics'
                  ? isDarkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

            {/* Content based on active view */}
      {activeView === 'table' ? (
        <>
          {/* Table */}
          <div className={`rounded-lg shadow-sm border overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={`border-b transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <tr>
                {[
                  "Date",
                  "User",
                  "Paid To",
                  "Amount",
                  "Reason",
                  "Region",
                  ...(showArea ? ["Area"] : []),
                  ...(showCentre ? ["Centre"] : []),
                ].map((header) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
              {paginatedData.length > 0 ? (
                paginatedData.map((e) => (
                  <tr key={e._id} className={`transition-colors duration-150 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {(() => {
                        const date = parseDate(e.date);
                        return date ? date.toLocaleDateString('en-GB') : 'Invalid Date';
                      })()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {e.user?.name || 'Unknown'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {e.paidTo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ₹{parseFloat(e.amount).toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-sm max-w-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="truncate" title={e.reason}>
                        {e.reason || 'No reason provided'}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {(e.region || []).join(", ")}
                    </td>
                    {showArea && (
                      <td className={`px-6 py-4 text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {(e.area || []).join(", ")}
                      </td>
                    )}
                    {showCentre && (
                      <td className={`px-6 py-4 text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {(e.centre || []).join(", ")}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className={`px-6 py-12 text-center transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    colSpan={6 + (showArea ? 1 : 0) + (showCentre ? 1 : 0)}
                  >
                    No expenses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Showing {((page - 1) * 15) + 1} to {Math.min(page * 15, filtered.length)} of {filtered.length} results
        </div>

        <div className="flex items-center space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
              ? 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600'
              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
          >
            Previous
          </button>

          <span className={`px-3 py-2 text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
              ? 'text-gray-300 bg-gray-700 border border-gray-600 hover:bg-gray-600'
              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
          >
            Next
          </button>
        </div>
      </div>
        </>
      ) : (
        <AnalyticsDashboard
          loading={false}
          filtered={filtered}
          expenses={expenses}
          analytics={analytics}
          trendChartData={trendChartData}
          regionChartData={regionChartData}
          userChartData={userChartData}
          paidToChartData={paidToChartData}
          chartOptions={chartOptions}
        />
      )}
    </>
  );
};

export default ExpensesTableView;
