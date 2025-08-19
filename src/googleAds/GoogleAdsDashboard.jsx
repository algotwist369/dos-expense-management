import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Search, Filter, Download, RefreshCw, Calendar, TrendingUp, Target, DollarSign, MousePointer, Eye, ChevronLeft, ChevronRight, SortAsc, SortDesc, Settings, BarChart3, PieChart as PieChartIcon, Activity, Moon, Sun } from 'lucide-react';
import { monthlyData } from './data';
import { useTheme } from '../context/ThemeContext';

const GoogleAdsDashboard = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [selectedView, setSelectedView] = useState('table');
    const [selectedMonth, setSelectedMonth] = useState('July 2025');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLocation, setFilterLocation] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'costWithGST', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currencyFormat, setCurrencyFormat] = useState('lac'); // 'cr', 'lac', 'k', 'rupees'
    const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'area'
    const [quickFilter, setQuickFilter] = useState('all'); // 'all', 'high_performing', 'low_performing', 'high_spend'
 
    // Get current month data
    const currentMonthData = monthlyData[selectedMonth];
    const combinedData = useMemo(() => {
        if (!currentMonthData) return [];
        return [...(currentMonthData.originalData || []), ...(currentMonthData.pdfData || [])];
    }, [currentMonthData]);

    // Enhanced data with metrics
    const dataWithMetrics = useMemo(() => {
        return combinedData.map(item => ({
            ...item,
            cpc: item.clicks ? (item.costWithoutGST / item.clicks) : 0,
            ctr: (item.impressions && item.clicks) ? ((item.clicks / item.impressions) * 100) : 0,
            cpm: item.impressions ? ((item.costWithoutGST / item.impressions) * 1000) : 0,
            roi: item.clicks ? ((item.costWithoutGST / item.clicks) * 100) : 0,
            performance: item.clicks > 0 ? (item.costWithoutGST / item.clicks) : 0
        }));
    }, [combinedData]);

    // Currency formatting function
    const formatCurrency = (amount, format = currencyFormat) => {
        if (!amount || amount === 0) return '₹0';
        switch (format) {
            case 'cr':
                return `₹${(amount / 10000000).toFixed(2)}Cr`;
            case 'lac':
                return `₹${(amount / 100000).toFixed(1)}L`;
            case 'k':
                return `₹${(amount / 1000).toFixed(0)}K`;
            case 'rupees':
            default:
                return `₹${amount.toLocaleString('en-IN')}`;
        }
    };

    // Calculate metrics first
    const totalSpendWithoutGST = combinedData.reduce((sum, item) => sum + item.costWithoutGST, 0);
    const totalSpendWithGST = combinedData.reduce((sum, item) => sum + item.costWithGST, 0);
    const totalClicks = combinedData.reduce((sum, item) => sum + (item.clicks || 0), 0);
    const totalImpressions = combinedData.reduce((sum, item) => sum + (item.impressions || 0), 0);



    // Filter and search functionality with quick filters
    const filteredData = useMemo(() => {
        let filtered = dataWithMetrics;

        // Apply quick filter
        if (quickFilter !== 'all') {
            switch (quickFilter) {
                case 'high_performing':
                    filtered = filtered.filter(item => item.ctr > 2 && item.cpc < 50);
                    break;
                case 'low_performing':
                    filtered = filtered.filter(item => item.ctr < 1 || item.cpc > 100);
                    break;
                case 'high_spend':
                    filtered = filtered.filter(item => item.costWithGST > 50000);
                    break;
                default:
                    break;
            }
        }

        // Apply search filter
        if (searchTerm && searchTerm.trim() !== '') {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(item =>
                (item.name && item.name.toLowerCase().includes(searchLower)) ||
                (item.location && item.location.toLowerCase().includes(searchLower))
            );
        }

        // Apply location filter
        if (filterLocation && filterLocation !== 'all') {
            const locationLower = filterLocation.toLowerCase().trim();
            filtered = filtered.filter(item =>
                item.location && item.location.toLowerCase() === locationLower
            );
        }

        // Apply sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle null/undefined values
                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';

                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (sortConfig.direction === 'asc') {
                    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                } else {
                    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
                }
            });
        }

        return filtered;
    }, [dataWithMetrics, searchTerm, filterLocation, sortConfig, quickFilter]);

    // Calculate total payment for filtered data
    const totalFilteredPaymentWithGST = useMemo(() => {
        return filteredData.reduce((sum, item) => sum + item.costWithGST, 0);
    }, [filteredData]);

    const totalFilteredPaymentWithoutGST = useMemo(() => {
        return filteredData.reduce((sum, item) => sum + item.costWithoutGST, 0);
    }, [filteredData]);

    // Calculate campaign statistics for table view
    const campaignStats = useMemo(() => {
        const totalCampaigns = combinedData.length;
        const highPerforming = combinedData.filter(item => item.ctr > 2 && item.cpc < 50).length;
        const lowPerforming = combinedData.filter(item => item.ctr < 1 || item.cpc > 100).length;
        const highSpend = combinedData.filter(item => item.costWithGST > 50000).length;
        
        return {
            totalCampaigns,
            highPerforming,
            lowPerforming,
            highSpend
        };
    }, [combinedData]);

    // Calculate campaign category counts
    const campaignCounts = useMemo(() => {
        const allCount = dataWithMetrics.length;
        const highPerformingCount = dataWithMetrics.filter(item => item.ctr > 2 && item.cpc < 50).length;
        const lowPerformingCount = dataWithMetrics.filter(item => item.ctr < 1 || item.cpc > 100).length;
        const highSpendCount = dataWithMetrics.filter(item => item.costWithGST > 50000).length;
        
        return {
            all: allCount,
            highPerforming: highPerformingCount,
            lowPerforming: lowPerformingCount,
            highSpend: highSpendCount
        };
    }, [dataWithMetrics]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterLocation, quickFilter]);
    
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    // Get unique locations for filter
    const locations = useMemo(() => {
        const uniqueLocations = [...new Set(combinedData.map(item => item.location))];
        return uniqueLocations.sort();
    }, [combinedData]);

    // Top performers - now showing 20+ campaigns
    const topSpenders = [...dataWithMetrics].sort((a, b) => b.costWithGST - a.costWithGST).slice(0, 25);
    const costEfficiency = dataWithMetrics
        .filter(item => item.clicks > 0)
        .sort((a, b) => a.cpc - b.cpc)
        .slice(0, 20);

    // High performing campaigns
    const highPerforming = dataWithMetrics
        .filter(item => item.ctr > 2 && item.cpc < 50)
        .sort((a, b) => b.ctr - a.ctr)
        .slice(0, 10);

    // Location performance data
    const locationPerformance = useMemo(() => {
        const locationStats = {};
        combinedData.forEach(item => {
            if (!locationStats[item.location]) {
                locationStats[item.location] = {
                    location: item.location,
                    campaigns: 0,
                    totalSpend: 0,
                    totalClicks: 0,
                    totalImpressions: 0
                };
            }
            locationStats[item.location].campaigns += 1;
            locationStats[item.location].totalSpend += item.costWithGST;
            locationStats[item.location].totalClicks += item.clicks || 0;
            locationStats[item.location].totalImpressions += item.impressions || 0;
        });

        return Object.values(locationStats).map(stat => ({
            ...stat,
            avgCPC: stat.totalClicks > 0 ? (stat.totalSpend / stat.totalClicks) : 0
        })).sort((a, b) => b.totalSpend - a.totalSpend);
    }, [combinedData]);

    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Simulate refresh
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    // Close export dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const dropdown = document.getElementById('exportDropdown');
            const button = document.getElementById('exportButton');
            if (dropdown && !dropdown.contains(event.target) && !button?.contains(event.target)) {
                dropdown.classList.add('hidden');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const exportToCSV = () => {
        const csvData = filteredData.map(item => ({
            'Campaign Name': item.name,
            'Location': item.location,
            'Spend (excl GST)': item.costWithoutGST,
            'Spend (incl GST)': item.costWithGST,
            'Clicks': item.clicks || 0,
            'Impressions': item.impressions || 0,
            'CPC': item.cpc.toFixed(2),
            'CTR %': item.ctr.toFixed(2),
            'CPM': item.cpm.toFixed(2)
        }));

        const csvContent = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spa-campaigns-${selectedMonth.replace(' ', '-')}.csv`;
        a.click();
    };

    const exportToPDF = () => {
        // Placeholder for PDF export functionality
        alert('PDF export functionality would be implemented here');
    };



    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-[99rem] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Campaign Analytics
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Performance Dashboard</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDarkMode ? (
                                    <Sun className="w-4 h-4" />
                                ) : (
                                    <Moon className="w-4 h-4" />
                                )}
                            </button>

                            {/* Currency Format Selector */}
                            <div className="flex items-center space-x-2">
                                <Settings className="w-4 h-4 text-gray-500" />
                                <select
                                    value={currencyFormat}
                                    onChange={(e) => setCurrencyFormat(e.target.value)}
                                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                                >
                                    <option value="rupees">₹ Rupees</option>
                                    <option value="k">₹ K</option>
                                    <option value="lac">₹ Lac</option>
                                    <option value="cr">₹ Cr</option>
                                </select>
                            </div>

                            {/* Month Selector */}
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                                >
                                    <option value="July 2025">July 2025</option>
                                </select>
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                className={`p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </button>

                            {/* Export Dropdown */}
                            <div className="relative">
                                <button
                                    id="exportButton"
                                    onClick={() => document.getElementById('exportDropdown').classList.toggle('hidden')}
                                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Export</span>
                                </button>
                                <div id="exportDropdown" className="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                    <div className="py-1">
                                        <button
                                            onClick={exportToCSV}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Export as CSV
                                        </button>
                                        <button
                                            onClick={exportToPDF}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Export as PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[99rem] mx-auto  py-6">
                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-1 mb-6">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
                        { id: 'performance', label: 'Performance', icon: Target },
                        { id: 'locations', label: 'Locations', icon: MousePointer },
                        { id: 'table', label: 'Data Table', icon: Eye }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setSelectedView(id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all text-sm ${selectedView === id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {selectedView === 'dashboard' && (
                    <>
                        {/* Hero Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">{combinedData.length}</span>
                                    </div>
                                </div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Campaigns</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Active this month</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalSpendWithoutGST)}</span>
                                    </div>
                                </div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spend</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Excluding GST</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                        <MousePointer className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">{(totalClicks / 1000).toFixed(1)}K</span>
                                    </div>
                                </div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clicks</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This month</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">₹{(totalSpendWithoutGST / totalClicks).toFixed(0)}</span>
                                    </div>
                                </div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg CPC</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Cost per click</p>
                            </div>
                        </div>

                        {/* Chart Controls */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Campaigns</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setChartType('bar')}
                                    className={`p-2 rounded-md ${chartType === 'bar' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setChartType('line')}
                                    className={`p-2 rounded-md ${chartType === 'line' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    <Activity className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Top Performing Campaigns - Now showing 20+ */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <ResponsiveContainer width="100%" height={400}>
                                    {chartType === 'bar' ? (
                                        <BarChart data={topSpenders.slice(0, 20)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#f0f0f0"} />
                                            <XAxis
                                                dataKey="name"
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                                fontSize={9}
                                                stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                                            />
                                            <YAxis 
                                                formatter={(value) => formatCurrency(value, currencyFormat)} 
                                                stroke={isDarkMode ? "#9ca3af" : "#6b7280"} 
                                                fontSize={10}
                                            />
                                            <Tooltip
                                                formatter={(value) => [formatCurrency(value, currencyFormat), 'Spend']}
                                                contentStyle={{ 
                                                    borderRadius: '8px', 
                                                    border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb', 
                                                    backgroundColor: isDarkMode ? '#1f2937' : 'white',
                                                    color: isDarkMode ? '#f9fafb' : '#111827',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                            <Bar dataKey="costWithGST" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                                        </BarChart>
                                    ) : (
                                        <LineChart data={topSpenders.slice(0, 20)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#f0f0f0"} />
                                            <XAxis
                                                dataKey="name"
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                                fontSize={9}
                                                stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                                            />
                                            <YAxis 
                                                formatter={(value) => formatCurrency(value, currencyFormat)} 
                                                stroke={isDarkMode ? "#9ca3af" : "#6b7280"} 
                                                fontSize={10}
                                            />
                                            <Tooltip
                                                formatter={(value) => [formatCurrency(value, currencyFormat), 'Spend']}
                                                contentStyle={{ 
                                                    borderRadius: '8px', 
                                                    border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb', 
                                                    backgroundColor: isDarkMode ? '#1f2937' : 'white',
                                                    color: isDarkMode ? '#f9fafb' : '#111827',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                            <Line type="monotone" dataKey="costWithGST" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                                        </LineChart>
                                    )}
                                </ResponsiveContainer>
                            </div>

                            {/* Spend Distribution Pie */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spend Distribution</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <PieChart>
                                        <Pie
                                            data={topSpenders.slice(0, 10)}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={120}
                                            dataKey="costWithGST"
                                            nameKey="name"
                                            stroke="none"
                                        >
                                            {topSpenders.slice(0, 10).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => formatCurrency(value, currencyFormat)}
                                            contentStyle={{ 
                                                borderRadius: '8px', 
                                                border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb', 
                                                backgroundColor: isDarkMode ? '#1f2937' : 'white',
                                                color: isDarkMode ? '#f9fafb' : '#111827',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Key Insights */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Insights</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-base mb-2">Highest Spender</h4>
                                    <p className="text-blue-700 dark:text-blue-200 font-medium text-sm">{topSpenders[0]?.name}</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">{formatCurrency(topSpenders[0]?.costWithGST || 0)}</p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 text-base mb-2">Most Cost-Effective</h4>
                                    <p className="text-green-700 dark:text-green-200 font-medium text-sm">{costEfficiency[0]?.name}</p>
                                    <p className="text-xs text-green-600 dark:text-green-300 mt-1">₹{costEfficiency[0]?.cpc.toFixed(2)} CPC</p>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 text-base mb-2">Total GST Paid</h4>
                                    <p className="text-purple-700 dark:text-purple-200 font-medium text-sm">{formatCurrency(totalSpendWithGST - totalSpendWithoutGST)}</p>
                                    <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">18% of total spend</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {selectedView === 'performance' && (
                    <div className="space-y-6">
                        {/* Performance Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Avg CTR</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {(totalClicks / totalImpressions * 100).toFixed(2)}%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Avg CPC</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            ₹{(totalSpendWithoutGST / totalClicks).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {((highPerforming.length / combinedData.length) * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {highPerforming.length} high-performing campaigns
                                    </span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">ROI</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {((totalClicks * 100) / totalSpendWithoutGST).toFixed(2)}%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                        <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Return on investment
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Cost Efficiency */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Cost-Effective Campaigns</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={costEfficiency}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#f0f0f0"} />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        fontSize={9}
                                        stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                                    />
                                    <YAxis stroke={isDarkMode ? "#9ca3af" : "#6b7280"} fontSize={10} />
                                    <Tooltip 
                                        formatter={(value) => [`₹${value}`, 'CPC']}
                                        contentStyle={{ 
                                            borderRadius: '8px', 
                                            border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb', 
                                            backgroundColor: isDarkMode ? '#1f2937' : 'white',
                                            color: isDarkMode ? '#f9fafb' : '#111827',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Bar dataKey="cpc" fill="#10B981" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Clicks vs Spend */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clicks vs Spend Analysis</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={dataWithMetrics.slice(0, 50)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#f0f0f0"} />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        fontSize={9}
                                        stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                                    />
                                    <YAxis yAxisId="left" stroke={isDarkMode ? "#9ca3af" : "#6b7280"} fontSize={10} />
                                    <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? "#9ca3af" : "#6b7280"} fontSize={10} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: '8px', 
                                            border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb', 
                                            backgroundColor: isDarkMode ? '#1f2937' : 'white',
                                            color: isDarkMode ? '#f9fafb' : '#111827',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="clicks" fill="#F59E0B" name="Clicks" radius={[2, 2, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="costWithoutGST" fill="#EF4444" name="Spend (₹)" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* High Performing Campaigns */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">High Performing Campaigns (CTR &gt; 2%, CPC &lt; ₹50)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {highPerforming.map((campaign, index) => (
                                    <div key={index} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                                        <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2">{campaign.name}</h4>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-green-600 dark:text-green-400">CTR:</span>
                                                <span className="font-medium text-green-700 dark:text-green-200">{campaign.ctr.toFixed(2)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-600 dark:text-green-400">CPC:</span>
                                                <span className="font-medium text-green-700 dark:text-green-200">₹{campaign.cpc.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-600 dark:text-green-400">Spend:</span>
                                                <span className="font-medium text-green-700 dark:text-green-200">{formatCurrency(campaign.costWithGST)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {selectedView === 'locations' && (
                    <div className="space-y-6">
                        {/* Location Performance Overview */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location Performance Overview</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={locationPerformance}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#f0f0f0"} />
                                    <XAxis dataKey="location" stroke={isDarkMode ? "#9ca3af" : "#6b7280"} fontSize={10} />
                                    <YAxis stroke={isDarkMode ? "#9ca3af" : "#6b7280"} fontSize={10} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: '8px', 
                                            border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb', 
                                            backgroundColor: isDarkMode ? '#1f2937' : 'white',
                                            color: isDarkMode ? '#f9fafb' : '#111827',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="totalSpend" fill="#8B5CF6" name="Total Spend (₹)" />
                                    <Bar dataKey="totalClicks" fill="#06B6D4" name="Total Clicks" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Location Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {locationPerformance.slice(0, locationPerformance.length).map((location, index) => (
                                <div key={location.location} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{location.location}</h4>
                                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Campaigns:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{location.campaigns}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Spend:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(location.totalSpend)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Clicks:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{location.totalClicks.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Avg CPC:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">₹{location.avgCPC.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedView === 'table' && (
                    <div className="space-y-4">
                        {/* Search and Filter Bar */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search campaigns or locations..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Location Filter */}
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        value={filterLocation}
                                        onChange={(e) => setFilterLocation(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
                                    >
                                        <option value="all">All Locations</option>
                                        {locations.map(location => (
                                            <option key={location} value={location}>{location}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Total Payment Display */}
                                <div className="flex flex-col justify-center items-center">
                                    <div className="text-center space-y-1">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                                            Total Payment
                                        </div>
                                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                            {formatCurrency(totalFilteredPaymentWithGST)} (with GST)
                                        </div>
                                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                            {formatCurrency(totalFilteredPaymentWithoutGST)} (without GST)
                                        </div>
                                        {(searchTerm || filterLocation !== 'all') && (
                                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                (Filtered)
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Results Info and Clear Filters */}
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                        Showing {filteredData.length} of {combinedData.length} campaigns
                                    </span>
                                    {(searchTerm || filterLocation !== 'all') && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setFilterLocation('all');
                                            }}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Filter Bar */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setQuickFilter('all')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        quickFilter === 'all'
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                    }`}
                                >
                                    All Campaigns ({campaignCounts.all})
                                </button>
                                <button
                                    onClick={() => setQuickFilter('high_performing')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        quickFilter === 'high_performing'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                    }`}
                                >
                                    High Performing ({campaignCounts.highPerforming})
                                </button>
                                <button
                                    onClick={() => setQuickFilter('low_performing')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        quickFilter === 'low_performing'
                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                    }`}
                                >
                                    Low Performing ({campaignCounts.lowPerforming})
                                </button>
                                <button
                                    onClick={() => setQuickFilter('high_spend')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        quickFilter === 'high_spend'
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                    }`}
                                >
                                    High Spend ({campaignCounts.highSpend})
                                </button>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            {[
                                                { key: 'name', label: 'Campaign Name' },
                                                { key: 'location', label: 'Location' },
                                                { key: 'costWithoutGST', label: 'Spend (excl. GST)' },
                                                { key: 'costWithGST', label: 'Spend (incl. GST)' },
                                                { key: 'clicks', label: 'Clicks' },
                                                { key: 'cpc', label: 'CPC' },
                                                { key: 'ctr', label: 'CTR %' }
                                            ].map(({ key, label }) => (
                                                <th
                                                    key={key}
                                                    onClick={() => handleSort(key)}
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <span>{label}</span>
                                                        {sortConfig.key === key && (
                                                            sortConfig.direction === 'asc' ?
                                                                <SortAsc className="w-3 h-3" /> :
                                                                <SortDesc className="w-3 h-3" />
                                                        )}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedData.map((campaign, index) => (
                                            <tr key={`${campaign.name}-${index}`} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                        {campaign.location}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                                    {formatCurrency(campaign.costWithoutGST)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                                    {formatCurrency(campaign.costWithGST)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {campaign.clicks?.toLocaleString('en-IN') || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                                                    ₹{campaign.cpc.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {campaign.ctr.toFixed(2)}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="ml-3 relative inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Showing{' '}
                                                <span className="font-medium text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span>
                                                {' '}to{' '}
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {Math.min(currentPage * itemsPerPage, filteredData.length)}
                                                </span>
                                                {' '}of{' '}
                                                <span className="font-medium text-gray-900 dark:text-white">{filteredData.length}</span>
                                                {' '}results
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                <button
                                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>

                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${currentPage === pageNum
                                                                    ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                                                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}

                                                <button
                                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoogleAdsDashboard;