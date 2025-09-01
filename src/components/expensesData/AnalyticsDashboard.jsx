import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import LoadingSpinner from '../LoadingSpinner';

const AnalyticsDashboard = ({
  loading,
  filtered,
  expenses,
  analytics,
  trendChartData,
  regionChartData,
  userChartData,
  paidToChartData,
  chartOptions
}) => {
  const { isDarkMode } = useTheme();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className={`p-6 rounded-xl shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <span className={`text-sm font-medium px-2 py-1 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}>
              {filtered.length > 0 ? ((filtered.length / expenses.length) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <h3 className={`text-2xl font-bold mb-1 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            ₹{analytics.totalAmount?.toLocaleString() || '0'}
          </h3>
          <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Total Expenses ({filtered.length} transactions)
          </p>
        </div>

        <div className={`p-6 rounded-xl shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className={`text-sm font-medium px-2 py-1 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
              }`}>
              Regions
            </span>
          </div>
          <h3 className={`text-2xl font-bold mb-1 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            {Object.keys(analytics.expensesByRegion || {}).length}
          </h3>
          <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Active Regions
          </p>
        </div>

        <div className={`p-6 rounded-xl shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <span className={`text-sm font-medium px-2 py-1 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
              }`}>
              Users
            </span>
          </div>
          <h3 className={`text-2xl font-bold mb-1 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            {Object.keys(analytics.expensesByUser || {}).length}
          </h3>
          <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Active Users
          </p>
        </div>

        <div className={`p-6 rounded-xl shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className={`text-sm font-medium px-2 py-1 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
              }`}>
              Top
            </span>
          </div>
          <h3 className={`text-2xl font-bold mb-1 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            ₹{analytics.maxAmount ? analytics.maxAmount.toLocaleString() : '0'}
          </h3>
          <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Highest Expense
          </p>
        </div>

        <div className={`p-6 rounded-xl shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className={`text-sm font-medium px-2 py-1 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
              }`}>
              Today
            </span>
          </div>
          <h3 className={`text-2xl font-bold mb-1 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            ₹{analytics.todayTotal ? analytics.todayTotal.toLocaleString() : '0'}
          </h3>
          <p className={`text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
            Today's Expenses ({analytics.todayExpenses || 0})
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Trend Chart */}
        <div className={`p-8 rounded-xl shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          <h3 className={`text-xl font-bold mb-6 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
            30-Day Expense Trend
          </h3>
          <div className="h-80">
            <Line data={trendChartData} options={chartOptions} />
          </div>
        </div>

        {/* Region Distribution */}
        <div className={`p-8 rounded-xl shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          <h3 className={`text-xl font-bold mb-6 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
            Expenses by Region
          </h3>
          <div className="h-[460px]">
            <Doughnut
              data={regionChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 25,
                      usePointStyle: true,
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* User Expenses */}
        <div className={`p-8 rounded-xl shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          <h3 className={`text-xl font-bold mb-6 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
            Top Users by Expenses
          </h3>
          <div className="h-80">
            <Bar data={userChartData} options={chartOptions} />
          </div>
        </div>

        {/* Paid To Analysis */}
        <div className={`p-8 rounded-xl shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          <h3 className={`text-xl font-bold mb-6 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
            Top Recipients by Expenses
          </h3>
          <div className="h-80">
            <Bar data={paidToChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Reasons */}
        <div className={`p-8 rounded-xl shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          <h3 className={`text-xl font-bold mb-6 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
            Top Expense Reasons
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.expensesByReason || {})
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([reason, amount], index) => (
                <div key={reason} className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'
                  }`}>
                  <div className="flex items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 transition-colors duration-200 ${isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
                      }`}>
                      {index + 1}
                    </span>
                    <span className={`font-medium truncate max-w-[400px] transition-colors duration-200 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>{reason}</span>
                  </div>
                  <span className="font-bold text-green-600 text-lg">₹{amount.toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className={`p-8 rounded-xl shadow-md border transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
          <h3 className={`text-xl font-bold mb-6 transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
            Monthly Expense Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.expensesByMonth || {})
              .sort(([a], [b]) => new Date(a) - new Date(b))
              .slice(0, 8)
              .map(([month, amount]) => (
                <div key={month} className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'
                  }`}>
                  <span className={`font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>{month}</span>
                  <span className="font-bold text-blue-600 text-lg">₹{amount.toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
