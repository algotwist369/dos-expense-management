import React, { useEffect, useState, useMemo } from "react";
import { expenseAPI, apiUtils } from '../../services/apiService';
import { FaSyncAlt } from "react-icons/fa";
import { useTheme } from '../../context/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import GoogleAdsDashboard from '../../googleAds/GoogleAdsDashboard';
import { HiRefresh } from "react-icons/hi";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ExpensesTable = () => {
  const { isDarkMode } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [paidToFilter, setPaidToFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("thisMonth");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("analytics");
  const [loading, setLoading] = useState(true);
  const [showArea, setShowArea] = useState(true);
  const [showCentre, setShowCentre] = useState(false);
  const itemsPerPage = 15;

  // Helper function to safely parse dates
  const parseDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.warn('Failed to parse date:', dateString);
      return null;
    }
  };
 
  // Fetch Expenses data
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);

        if (!apiUtils.isAuthenticated()) {
          console.error("User not authenticated");
          setLoading(false);
          return;
        }

        const data = await expenseAPI.getAllExpenses();
        const expensesArray = Array.isArray(data) ? data : data.data || [];
        console.log("expensesArray: ", expensesArray);


        setExpenses(expensesArray);
        setFiltered(expensesArray);
      } catch (err) {
        const { message } = apiUtils.handleError(err);
        console.error("Error fetching expenses:", message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      if (!apiUtils.isAuthenticated()) {
        console.error("User not authenticated");
        setLoading(false);
        return;
      }

      const data = await expenseAPI.getAllExpenses();
      const expensesArray = Array.isArray(data) ? data : data.data || [];
      console.log("expensesArray: ", expensesArray);

      setExpenses(expensesArray);
      setFiltered(expensesArray);
    } catch (err) {
      const { message } = apiUtils.handleError(err);
      console.error("Error fetching expenses:", message);
    } finally {
      setLoading(false);
    }
  };


  // Filtering logic
  useEffect(() => {
    let data = expenses;

    // Search filter
    if (search.trim()) {
      data = data.filter(
        (e) =>
          e.paidTo?.toLowerCase().includes(search.toLowerCase()) ||
          e.reason?.toLowerCase().includes(search.toLowerCase()) ||
          e.user?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Region filter
    if (regionFilter) {
      data = data.filter((e) => e.region?.includes(regionFilter));
    }

    // Paid To filter
    if (paidToFilter) {
      data = data.filter((e) => e.paidTo?.toLowerCase().includes(paidToFilter.toLowerCase()));
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      data = data.filter((e) => {
        const expDate = parseDate(e.date);
        if (!expDate) return false; // Skip invalid dates

        if (dateFilter === "today") {
          return (
            expDate.getDate() === now.getDate() &&
            expDate.getMonth() === now.getMonth() &&
            expDate.getFullYear() === now.getFullYear()
          );
        }

        if (dateFilter === "yesterday") {
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);
          return (
            expDate.getDate() === yesterday.getDate() &&
            expDate.getMonth() === yesterday.getMonth() &&
            expDate.getFullYear() === yesterday.getFullYear()
          );
        }

        if (dateFilter === "last7") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 6); // include today
          return expDate >= sevenDaysAgo && expDate <= now;
        }

        if (dateFilter === "thisMonth") {
          return (
            expDate.getMonth() === now.getMonth() &&
            expDate.getFullYear() === now.getFullYear()
          );
        }

        if (dateFilter === "lastMonth") {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return (
            expDate.getMonth() === lastMonth.getMonth() &&
            expDate.getFullYear() === lastMonth.getFullYear()
          );
        }

        if (dateFilter === "thisYear") {
          return expDate.getFullYear() === now.getFullYear();
        }

        return true;
      });
    }

    setFiltered(data);
    setPage(1);
  }, [search, regionFilter, paidToFilter, dateFilter, expenses]);

  // Analytics calculations - based on filtered data
  const analytics = useMemo(() => {
    if (!filtered.length) return {};

    // Basic calculations
    const totalAmount = filtered.reduce((sum, e) => sum + (e.amount || 0), 0);
    const maxAmount = Math.max(...filtered.map(e => e.amount || 0));

    // Today's expenses calculation
    const today = new Date();
    const todayExpenses = filtered.filter(e => {
      const expDate = parseDate(e.date);
      return expDate && (
        expDate.getDate() === today.getDate() &&
        expDate.getMonth() === today.getMonth() &&
        expDate.getFullYear() === today.getFullYear()
      );
    });
    const todayTotal = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Group by different categories
    const expensesByRegion = {};
    const expensesByUser = {};
    const expensesByReason = {};
    const expensesByPaidTo = {};
    const expensesByMonth = {};

    filtered.forEach(expense => {
      // Region grouping
      const regions = expense.region || [];
      regions.forEach(region => {
        expensesByRegion[region] = (expensesByRegion[region] || 0) + (expense.amount || 0);
      });

      // User grouping
      const userName = expense.user?.name || 'Unknown';
      expensesByUser[userName] = (expensesByUser[userName] || 0) + (expense.amount || 0);

      // Reason grouping
      const reason = expense.reason || 'No reason';
      expensesByReason[reason] = (expensesByReason[reason] || 0) + (expense.amount || 0);

      // Paid To grouping
      const paidTo = expense.paidTo || 'Unknown';
      expensesByPaidTo[paidTo] = (expensesByPaidTo[paidTo] || 0) + (expense.amount || 0);

      // Month grouping
      const date = parseDate(expense.date);
      if (date) {
        const monthStr = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
        expensesByMonth[monthStr] = (expensesByMonth[monthStr] || 0) + (expense.amount || 0);
      }
    });

    // Simple trend data - last 30 days
    const trendLabels = [];
    const trendData = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-GB');
      trendLabels.push(dateStr);

      // Calculate total for this date from filtered data
      const dayTotal = filtered
        .filter(e => {
          const expDate = parseDate(e.date);
          return expDate && expDate.toLocaleDateString('en-GB') === dateStr;
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      trendData.push(dayTotal);
    }

    return {
      totalAmount,
      maxAmount,
      todayTotal,
      todayExpenses: todayExpenses.length,
      expensesByRegion,
      expensesByUser,
      expensesByReason,
      expensesByPaidTo,
      expensesByMonth,
      trendData,
      trendLabels
    };
  }, [filtered]);

  // Chart configurations
  const trendChartData = {
    labels: analytics.trendLabels?.map(dateStr => {
      // Parse the date string properly to avoid "Invalid Date" errors
      const [day, month, year] = dateStr.split('/');
      const date = new Date(year, month - 1, day); // month is 0-indexed
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }) || [],
    datasets: [
      {
        label: 'Daily Expenses',
        data: analytics.trendData || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const regionChartData = {
    labels: Object.keys(analytics.expensesByRegion || {}),
    datasets: [
      {
        label: 'Expenses by Region',
        data: Object.values(analytics.expensesByRegion || {}),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 4,
      },
    ],
  };

  const userChartData = {
    labels: Object.keys(analytics.expensesByUser || {}).slice(0, 8), // Top 8 users
    datasets: [
      {
        label: 'Expenses by User',
        data: Object.values(analytics.expensesByUser || {}).slice(0, 8),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const paidToChartData = {
    labels: Object.keys(analytics.expensesByPaidTo || {}).slice(0, 8), // Top 8 recipients
    datasets: [
      {
        label: 'Expenses by Recipient',
        data: Object.values(analytics.expensesByPaidTo || {}).slice(0, 8),
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

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

  // Sort filtered data by date (newest first) and pagination
  const sortedData = [...filtered].sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB - dateA;
  });
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Total payment
  const totalPayment = filtered.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Loading Component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
      <div>
        <FaSyncAlt className="text-4xl text-blue-600" />
      </div>
      <span className={`ml-3 text-lg transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Loading analytics
      </span>
    </div>
  );

  const [rotating, setRotating] = useState(false);

  const handleRefresh = () => {
    setRotating(true);
    setTimeout(() => setRotating(false), 360);
    fetchExpenses();
  };



  return (
    <div className={`min-h-screen p-6 rounded-xl transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-[99rem] mx-auto font-sans transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>

        {/* Tab Navigation */}
        <div className={`flex mb-8 rounded-xl shadow-md p-2 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 px-6 py-4 font-semibold text-sm rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${activeTab === "analytics"
              ? isDarkMode
                ? "text-blue-400 bg-blue-900/50"
                : "text-blue-600 bg-blue-50"
              : isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Daily Analytics
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`flex-1 px-6 py-4 font-semibold text-sm rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${activeTab === "table"
              ? isDarkMode
                ? "text-blue-400 bg-blue-900/50"
                : "text-blue-600 bg-blue-50"
              : isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Daily Expense Table
          </button>
          <button
            onClick={() => setActiveTab("googleAds")}
            className={`flex-1 px-6 py-4 font-semibold text-sm rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${activeTab === "googleAds"
              ? isDarkMode
                ? "text-blue-400 bg-blue-900/50"
                : "text-blue-600 bg-blue-50"
              : isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Google Ads
          </button>
        </div>

        {/* Filters + Actions - Only show for non-Google Ads tabs */}
        {activeTab !== "googleAds" && (
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
                  className={`text-2xl transition-transform duration-500 ${rotating ? "rotate-[360deg]" : ""
                    }`}
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
        )}

        {/* Content based on active tab */}
        {activeTab === "table" ? (
          <>
            {/* Table Header */}
            <div className={`rounded-xl shadow-md p-6 mb-6 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className={`text-lg font-semibold transition-colors duration-200 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Total Expenses: <span className="text-green-600">₹{totalPayment.toLocaleString()}</span>
                  </h3>,
                  <span className={`text-sm px-2 py-1 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {filtered.length} records
                  </span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className={`rounded-lg shadow-sm border overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className={`border-b transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
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
                          className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            }`}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'
                    }`}>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((e) => (
                        <tr key={e._id} className={`transition-colors duration-150 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          }`}>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                            {(() => {
                              const date = parseDate(e.date);
                              return date ? date.toLocaleDateString('en-GB') : 'Invalid Date';
                            })()}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                            {e.user?.name || 'Unknown'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                            {e.paidTo || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            ₹{parseFloat(e.amount).toLocaleString()}
                          </td>
                          <td className={`px-6 py-4 text-sm max-w-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            <div className="truncate" title={e.reason}>
                              {e.reason || 'No reason provided'}
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                            {(e.region || []).join(", ")}
                          </td>
                          {showArea && (
                            <td className={`px-6 py-4 text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}>
                              {(e.area || []).join(", ")}
                            </td>
                          )}
                          {showCentre && (
                            <td className={`px-6 py-4 text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}>
                              {(e.centre || []).join(", ")}
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className={`px-6 py-12 text-center transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
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
                Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filtered.length)} of {filtered.length} results
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
        ) : activeTab === "googleAds" ? (
          <GoogleAdsDashboard />
        ) : (
          /* Analytics Dashboard */
          <div className="space-y-8">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpensesTable;
