import React, { useEffect, useState, useMemo } from "react";
import { expenseAPI, apiUtils } from '../../services/apiService';
import { FaSyncAlt } from "react-icons/fa";
import { useTheme } from '../../context/ThemeContext';
import { tabsConfig, getTabById } from './TabConfig';
import TabNavigation from './TabNavigation';
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

import MetaAdsInvoices from "../../googleAds/components/MetaAdsInvoices";
import GoogleAdsInvoices from "../../googleAds/components/GoogleAdsInvoices";
import ExpensesFilters from './ExpensesFilters';
import ExpensesTableView from './ExpensesTableView';
import AnalyticsDashboard from './AnalyticsDashboard';
import { useExpensesAnalytics } from './useExpensesAnalytics';

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
  const [activeTab, setActiveTab] = useState(() => {
    // Get the last active tab from localStorage, default to "table" if not found
    const savedTab = localStorage.getItem('expensesActiveTab');
    return savedTab || "table";
  });
  const [loading, setLoading] = useState(true);
  const [showArea, setShowArea] = useState(true);
  const [showCentre, setShowCentre] = useState(false);
  const itemsPerPage = 15;

  // Helper function to get current tab configuration
  const getCurrentTabConfig = () => getTabById(activeTab);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('expensesActiveTab', activeTab);
  }, [activeTab]);



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

  // Use custom hook for analytics calculations
  const {
    analytics,
    trendChartData,
    regionChartData,
    userChartData,
    paidToChartData,
    parseDate
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

        {/* Dynamic Tab Navigation */}
        <TabNavigation
          tabs={tabsConfig}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-8"
        />

        {/* Filters + Actions - Only show for tabs that have showFilters: true */}
        {getCurrentTabConfig()?.showFilters && (
          <ExpensesFilters
            search={search}
            setSearch={setSearch}
            regionFilter={regionFilter}
            setRegionFilter={setRegionFilter}
            paidToFilter={paidToFilter}
            setPaidToFilter={setPaidToFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            showArea={showArea}
            setShowArea={setShowArea}
            showCentre={showCentre}
            setShowCentre={setShowCentre}
            expenses={expenses}
            handleRefresh={handleRefresh}
            rotating={rotating}
          />
        )}

        {/* Content based on active tab */}
        {
          activeTab === "table" ?
            (
              <ExpensesTableView
                filtered={filtered}
                totalPayment={totalPayment}
                paginatedData={paginatedData}
                showArea={showArea}
                showCentre={showCentre}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                parseDate={parseDate}
                expenses={expenses}
              />
            ) :

            activeTab === "googleAds" ?
              (
                <GoogleAdsInvoices />
              ) :
              activeTab === "metaAds" ?
                (
                  <><MetaAdsInvoices /></>
                ) :
                null
        }
      </div>
    </div>
  );
}

export default ExpensesTable;
