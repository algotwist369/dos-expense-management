import { useEffect, useState, useMemo } from "react";
import { expenseAPI, apiUtils } from '../../services/apiService';
import { SlRefresh } from "react-icons/sl";
import { useTheme } from "../../context/ThemeContext";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { FiSearch } from "react-icons/fi";

const PAGE_SIZE = 10;

export default function TodaysExpenses() {
    const { isDarkMode } = useTheme();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("today");
    const [currentPage, setCurrentPage] = useState(1);

    const formatLocation = (expense) => ({
        regions: expense.region?.map((r) => r.name || r) || [],
        areas: expense.area?.map((a) => a.name || a) || [],
        centres: expense.centre?.map((c) => c.name || c) || [],
    });

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            setError("");

            if (!apiUtils.isAuthenticated()) {
                setError("Unauthorized. Please log in.");
                return;
            }

            const userId = apiUtils.getCurrentUser().userId;
            const data = await expenseAPI.getExpensesByUser(userId);

            setExpenses(data);
        } catch (err) {
            const { message } = apiUtils.handleError(err);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const isInDateRange = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const last7Days = new Date();
        last7Days.setDate(today.getDate() - 7);

        switch (dateFilter) {
            case "today":
                return date.toDateString() === today.toDateString();
            case "yesterday":
                return date.toDateString() === yesterday.toDateString();
            case "last7days":
                return date >= last7Days;
            default:
                return true;
        }
    };

    const filteredExpenses = useMemo(() => {
        return expenses
            .filter((exp) => isInDateRange(exp.date))
            .filter((exp) => {
                const searchLower = search.toLowerCase();
                const loc = formatLocation(exp);
                const locationString = [...loc.regions, ...loc.areas, ...loc.centres].join(" ").toLowerCase();

                return (
                    exp.paidTo.toLowerCase().includes(searchLower) ||
                    exp.reason.toLowerCase().includes(searchLower) ||
                    locationString.includes(searchLower)
                );
            });
    }, [expenses, search, dateFilter]);

    const totalAmount = useMemo(
        () => filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        [filteredExpenses]
    );

    const totalPages = Math.ceil(filteredExpenses.length / PAGE_SIZE);
    const paginatedExpenses = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredExpenses.slice(start, start + PAGE_SIZE);
    }, [filteredExpenses, currentPage]);

    useEffect(() => {
        fetchExpenses();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, dateFilter]);

    const handleDelete = async (id) => {
        try {
            if (!window.confirm("Are you sure you want to delete this expense?")) return;
            const token = localStorage.getItem('token');
            await axios.delete(`https://expense.d0s369.co.in/api/expense/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert('Expense Deleted Successfully!');
            fetchExpenses(); // ✅ Refresh list after deletion
        } catch (error) {
            alert('Got error while deleting expense!');
        }
    };

    return (
        <div className="dark:text-white p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-[500px]">
            <h1 className="text-3xl font-extrabold mb-6 text-blue-700 dark:text-blue-400">
                Expense Overview
            </h1>

            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex w-full md:w-auto gap-2 items-center">
                    <div className="flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Search by name, reason or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 outline-none bg-transparent"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={fetchExpenses} // ✅ no full page reload
                        aria-label="Refresh expenses"
                        className="flex text-md dark:text-white items-center justify-center px-4 py-2 text-black border border-gray-300 dark:border-gray-600 rounded-md"
                    >
                        <SlRefresh className="mr-2" />
                        Refresh
                    </button>
                </div>

                {/* Date filters */}
                <div className="flex flex-wrap items-center gap-2">
                    {["all", "today", "yesterday", "last7days"].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setDateFilter(filter)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors duration-200 ${dateFilter === filter
                                ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500"
                                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-500"
                                }`}
                        >
                            {filter === "all"
                                ? "All"
                                : filter === "today"
                                    ? "Today"
                                    : filter === "yesterday"
                                        ? "Yesterday"
                                        : "Last 7 Days"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                Total Payment:{" "}
                <span className="text-green-600 dark:text-green-400">
                    ₹{totalAmount.toLocaleString()}
                </span>
            </div>

            {/* Table */}
            {loading ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
            ) : error ? (
                <p className="text-red-500 dark:text-red-400 text-center">{error}</p>
            ) : filteredExpenses.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">No expenses found.</p>
            ) : (
                <div className="overflow-x-auto shadow-lg rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="max-h-[600px] overflow-y-auto">
                        <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-700">
                            <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                <tr>
                                    <th className="px-4 py-3 border-b">Date</th>
                                    <th className="px-4 py-3 border-b">Paid To</th>
                                    <th className="px-4 py-3 border-b">Amount</th>
                                    <th className="px-4 py-3 border-b">Reason</th>
                                    <th className="px-4 py-3 border-b">Location</th>
                                    <th className="px-4 py-3 border-b">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedExpenses.map((exp, index) => {
                                    const loc = formatLocation(exp);
                                    return (
                                        <tr
                                            key={exp._id}
                                            className={`border-b ${index % 2 === 0
                                                ? "bg-white dark:bg-gray-800"
                                                : "bg-gray-50 dark:bg-gray-700"
                                                } hover:bg-blue-50 dark:hover:bg-blue-900/20`}
                                        >
                                            <td className="px-4 py-3">
                                                {new Date(exp.date).toLocaleString("en-GB", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </td>
                                            <td className="px-4 py-3 font-medium">{exp.paidTo}</td>
                                            <td className="px-4 py-3 font-bold text-green-700 dark:text-green-400">
                                                ₹{exp.amount}
                                            </td>
                                            <td className="px-4 py-3">{exp.reason}</td>
                                            <td className="px-4 py-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    {/* Regions */}
                                                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded p-2 text-xs border">
                                                        <p className="font-semibold mb-1">Regions</p>
                                                        {loc.regions.length > 0
                                                            ? loc.regions.map((item, idx) => (
                                                                <p key={idx} className="truncate">
                                                                    {item}
                                                                </p>
                                                            ))
                                                            : <p className="italic">N/A</p>}
                                                    </div>

                                                    {/* Areas */}
                                                    <div className="bg-green-100 dark:bg-green-900/30 rounded p-2 text-xs border">
                                                        <p className="font-semibold mb-1">Areas</p>
                                                        {loc.areas.length > 0
                                                            ? loc.areas.map((item, idx) => (
                                                                <p key={idx} className="truncate">
                                                                    {item}
                                                                </p>
                                                            ))
                                                            : <p className="italic">N/A</p>
                                                        }
                                                    </div>

                                                    {/* Centres */}
                                                    <div className="bg-purple-100 dark:bg-purple-900/30 rounded p-2 text-xs border">
                                                        <p className="font-semibold mb-1">Centres</p>
                                                        <div className="max-h-20 overflow-y-auto">
                                                            {loc.centres.length > 0
                                                                ? loc.centres.map((item, idx) => (
                                                                    <p key={idx} className="truncate">
                                                                        {item}
                                                                    </p>
                                                                ))
                                                                : <p className="italic">N/A</p>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-red-500">
                                                <button onClick={() => handleDelete(exp._id)}>
                                                    <MdDelete className="text-3xl cursor-pointer" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-2">
                    {/* Prev Button */}
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
                    >
                        Prev
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                            (page) =>
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 2 && page <= currentPage + 2)
                        )
                        .reduce((acc, page, idx, arr) => {
                            if (idx > 0 && page - arr[idx - 1] > 1) {
                                acc.push("ellipsis-" + idx); // add ellipsis
                            }
                            acc.push(page);
                            return acc;
                        }, [])
                        .map((page, idx) =>
                            typeof page === "string" ? (
                                <span key={page} className="px-2">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1.5 rounded border text-sm ${currentPage === page
                                        ? "bg-blue-600 text-white"
                                        : "bg-white dark:bg-gray-700"
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        )}

                    {/* Next Button */}
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

        </div>
    );
}