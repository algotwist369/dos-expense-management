import React, { useState, useEffect } from 'react';
import { invoiceAPI, apiUtils } from '../../api';

const StatsCards = ({ invoices = [], pagination = {} }) => {
    const [overallTotals, setOverallTotals] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log("invoices: ", invoices);

    // Fetch overall totals from API
    useEffect(() => {
        const fetchOverallTotals = async () => {
            try {
                setLoading(true);
                const response = await invoiceAPI.getOverallTotals();
                setOverallTotals(response.data.totals);
            } catch (error) {
                console.error('Error fetching overall totals:', error);
                // Fallback to calculating from current invoices
                const totalSpent = invoices.reduce((sum, inv) => {
                    return sum + (inv.extractedData?.totalAmount || 0);
                }, 0);
                setOverallTotals({ totalSpent, totalInvoices: pagination.totalInvoices || 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchOverallTotals();
    }, [invoices, pagination.totalInvoices]);

    // Format currency
    const formatCurrency = (amount, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    };

    const cards = [
        {
            label: "Total Campaigns",
            value: pagination.totalInvoices || 0,
        },
        {
            label: "Total Spent",
            value: loading ? 'Loading...' : formatCurrency(overallTotals?.totalSpent || 0),
            isCurrency: true
        },
        {
            label: "Google Ads",
            value: invoices.filter(inv => inv.platform === 'google_ads').length,
        },
        {
            label: "Meta Ads",
            value: invoices.filter(inv => inv.platform === 'meta_ads').length,
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {cards.map(({ label, value, isCurrency }, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 flex items-center">
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{label}</p>
                        <p className={`text-2xl font-semibold ${isCurrency ? 'text-green-600' : 'text-gray-900'}`}>
                            {value}
                        </p>
                        {loading && isCurrency && (
                            <div className="text-xs text-gray-400 mt-1">Calculating...</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default StatsCards
