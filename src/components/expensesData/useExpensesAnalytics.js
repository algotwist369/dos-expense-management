import { useMemo } from 'react';

export const useExpensesAnalytics = (filtered, expenses) => {
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

  return {
    analytics,
    trendChartData,
    regionChartData,
    userChartData,
    paidToChartData,
    parseDate
  };
};
